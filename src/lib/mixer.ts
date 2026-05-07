// The Mixer — Kubelka-Munk pigment matching engine.
//
// Given a target color and a pigment system, search for 1-, 2-, and 3-pigment
// recipes (loaded into the system's base) that minimize ΔE2000 vs target.
//
// Math:
//   - Spectral.js handles the K-M mixing on each candidate combination
//   - Culori handles HEX↔LAB conversion + ΔE2000 computation
//
// Algorithm (per call):
//   1. For each k in {1, 2, 3} pigments:
//      - For each combo C(13, k) of pigments from the system:
//        - For each total pigment load P in [min, max] (coarse step):
//          - For each ratio split among the k pigments (coarse step):
//            - Predict mix HEX via spectral.mix
//            - Convert to LAB, compute ΔE
//   2. Sort all candidates, return top N.
//
// Performance: ~30k candidate evaluations on a 13-pigment system in under
// a second on a modern device. We expose a `maxComponents` knob so the UI
// can request fast 1+2 search live, then a deeper 3-pigment search on demand.

import * as spectral from "spectral.js";
import { converter, differenceCiede2000, formatHex } from "culori";
import type { Pigment, PigmentSystem } from "./pigments";

// ─── Types ──────────────────────────────────────────────────────

export type Ingredient = {
  pigmentId: string;
  pct: number; // % of total mix (sums to 100% across all ingredients)
};

export type Recipe = {
  systemId: string;
  ingredients: Ingredient[];
  predictedHex: string;
  deltaE: number;
  pigmentCount: number; // not counting base
};

export type ScaledIngredient = {
  pigment: Pigment;
  pct: number;
  grams: number;
};

export type MixOptions = {
  maxComponents?: 1 | 2 | 3;
  topN?: number;
  // Coarse vs fine search. Fine = slower but more accurate ratios.
  precision?: "fast" | "balanced" | "thorough";
};

// ─── Helpers ────────────────────────────────────────────────────

const toLab = converter("lab");
const deltaE = differenceCiede2000();

function hexToLab(hex: string): { l: number; a: number; b: number } {
  const lab = toLab(hex);
  return { l: lab?.l ?? 0, a: lab?.a ?? 0, b: lab?.b ?? 0 };
}

function deltaELab(
  a: { l: number; a: number; b: number },
  b: { l: number; a: number; b: number },
): number {
  return (
    deltaE(
      { mode: "lab", l: a.l, a: a.a, b: a.b },
      { mode: "lab", l: b.l, a: b.a, b: b.b },
    ) ?? Infinity
  );
}

// Combinations of size k from list (returns indices).
function* combinations<T>(arr: T[], k: number): Generator<T[]> {
  if (k === 0) {
    yield [];
    return;
  }
  if (k > arr.length) return;
  for (let i = 0; i <= arr.length - k; i++) {
    for (const tail of combinations(arr.slice(i + 1), k - 1)) {
      yield [arr[i], ...tail];
    }
  }
}

// All ratios summing to 100 across `n` slots in given step (in percent).
// E.g. ratiosSummingTo100(2, 25) → [[25,75],[50,50],[75,25]] (skips 0 endpoints).
function* ratiosSummingTo100(
  n: number,
  step: number,
  remaining = 100,
): Generator<number[]> {
  if (n === 1) {
    if (remaining > 0) yield [remaining];
    return;
  }
  for (let v = step; v <= remaining - step * (n - 1); v += step) {
    for (const tail of ratiosSummingTo100(n - 1, step, remaining - v)) {
      yield [v, ...tail];
    }
  }
}

// Predict the mix outcome HEX via Spectral.js K-M.
export function predictMixHex(
  system: PigmentSystem,
  ingredients: Ingredient[],
): string {
  const pigments = new Map<string, Pigment>();
  pigments.set(system.base.id, system.base);
  for (const p of system.pigments) pigments.set(p.id, p);

  const colors = ingredients
    .filter((i) => i.pct > 0)
    .map((i) => {
      const pig = pigments.get(i.pigmentId);
      if (!pig) throw new Error(`unknown pigment ${i.pigmentId}`);
      const c = new spectral.Color(pig.hex);
      if (typeof pig.tintStrength === "number") {
        c.tintingStrength = pig.tintStrength;
      }
      return [c, i.pct] as [unknown, number];
    });

  if (colors.length === 0) return system.base.hex;
  if (colors.length === 1) return colorToHex(colors[0][0]);

  // spectral.mix accepts [color, factor] tuples — factors get normalized.
  const mixed = (spectral.mix as (...args: unknown[]) => unknown).apply(
    null,
    colors,
  );
  return colorToHex(mixed);
}

function colorToHex(c: unknown): string {
  // spectral.Color has .toString() that returns hex (with options).
  const obj = c as { toString: (opts?: { format?: string }) => string };
  return obj.toString({ format: "hex" });
}

// ─── Main matching algorithm ───────────────────────────────────

const PRECISION = {
  fast: { loadStep: 4, splitStep: 25 },
  balanced: { loadStep: 2, splitStep: 10 },
  thorough: { loadStep: 1, splitStep: 5 },
};

export function findRecipes(
  targetHex: string,
  system: PigmentSystem,
  options: MixOptions = {},
): Recipe[] {
  const { maxComponents = 3, topN = 4, precision = "balanced" } = options;
  const { loadStep, splitStep } = PRECISION[precision];

  if (system.pigments.length === 0) return [];

  const targetLab = hexToLab(targetHex);
  const candidates: Recipe[] = [];

  for (let k = 1; k <= maxComponents; k++) {
    for (const combo of combinations(system.pigments, k)) {
      const best = optimizeForCombo(
        combo,
        system,
        targetLab,
        loadStep,
        splitStep,
      );
      if (best) candidates.push(best);
    }
  }

  // Sort by ΔE; deduplicate by predictedHex (different combos can land in same place)
  const seen = new Set<string>();
  const sorted = candidates
    .sort((a, b) => a.deltaE - b.deltaE)
    .filter((r) => {
      const key = r.predictedHex.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return sorted.slice(0, topN);
}

function optimizeForCombo(
  pigments: Pigment[],
  system: PigmentSystem,
  targetLab: { l: number; a: number; b: number },
  loadStep: number,
  splitStep: number,
): Recipe | null {
  let best: Recipe | null = null;

  for (
    let totalLoad = system.minPigmentLoadPct;
    totalLoad <= system.maxPigmentLoadPct;
    totalLoad += loadStep
  ) {
    if (pigments.length === 1) {
      // Single pigment — just one ratio "split" of [100]
      const pigPct = totalLoad;
      const cap0 = pigments[0].maxLoadPct;
      if (cap0 !== undefined && pigPct > cap0) {
        continue;
      }
      const ingredients: Ingredient[] = [
        { pigmentId: system.base.id, pct: 100 - totalLoad },
        { pigmentId: pigments[0].id, pct: pigPct },
      ];
      const recipe = scoreRecipe(ingredients, system, targetLab);
      if (recipe && (!best || recipe.deltaE < best.deltaE)) best = recipe;
      continue;
    }

    for (const split of ratiosSummingTo100(pigments.length, splitStep)) {
      // split is a percentage of pigment-portion that goes to each
      let valid = true;
      const ingredients: Ingredient[] = [
        { pigmentId: system.base.id, pct: 100 - totalLoad },
      ];
      for (let i = 0; i < pigments.length; i++) {
        const pigPct = (totalLoad * split[i]) / 100;
        const cap = pigments[i].maxLoadPct;
        if (cap !== undefined && pigPct > cap) {
          valid = false;
          break;
        }
        ingredients.push({ pigmentId: pigments[i].id, pct: pigPct });
      }
      if (!valid) continue;

      const recipe = scoreRecipe(ingredients, system, targetLab);
      if (recipe && (!best || recipe.deltaE < best.deltaE)) best = recipe;
    }
  }

  return best;
}

function scoreRecipe(
  ingredients: Ingredient[],
  system: PigmentSystem,
  targetLab: { l: number; a: number; b: number },
): Recipe | null {
  try {
    const predictedHex = predictMixHex(system, ingredients);
    const predictedLab = hexToLab(predictedHex);
    const dE = deltaELab(targetLab, predictedLab);
    return {
      systemId: system.id,
      ingredients,
      predictedHex: formatHex(predictedHex) ?? predictedHex,
      deltaE: dE,
      pigmentCount: ingredients.filter(
        (i) => i.pigmentId !== system.base.id && i.pct > 0,
      ).length,
    };
  } catch {
    return null;
  }
}

// ─── Scaling ────────────────────────────────────────────────────

export function scaleRecipe(
  recipe: Recipe,
  system: PigmentSystem,
  batchGrams: number,
): ScaledIngredient[] {
  return recipe.ingredients
    .filter((i) => i.pct > 0)
    .map((i): ScaledIngredient | null => {
      const pig =
        i.pigmentId === system.base.id
          ? system.base
          : system.pigments.find((p) => p.id === i.pigmentId);
      if (!pig) return null;
      return {
        pigment: pig,
        pct: i.pct,
        grams: (batchGrams * i.pct) / 100,
      };
    })
    .filter((x): x is ScaledIngredient => x !== null);
}

// ─── Confidence labeling ────────────────────────────────────────
// Trade-standard ΔE bands for textile screen print.

export function deltaEConfidence(
  dE: number,
): { tier: "excellent" | "close" | "ballpark" | "poor"; label: string } {
  if (dE <= 2) return { tier: "excellent", label: "Excellent — should match" };
  if (dE <= 4) return { tier: "close", label: "Close — usually shippable" };
  if (dE <= 7) return { tier: "ballpark", label: "Ballpark — print a test" };
  return { tier: "poor", label: "Off — try a different combo" };
}

// ─── Batch size helpers ─────────────────────────────────────────

export const BATCH_SIZES = [
  { label: "4 oz", grams: 113.4 },
  { label: "8 oz", grams: 226.8 },
  { label: "16 oz", grams: 453.6 },
  { label: "1 kg", grams: 1000 },
  { label: "1 lb", grams: 453.6 },
] as const;

export function gramsForLabel(label: string): number {
  const found = BATCH_SIZES.find((b) => b.label === label);
  return found?.grams ?? 226.8;
}
