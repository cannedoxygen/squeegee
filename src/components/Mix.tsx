import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useStore, type SavedRecipe } from "../state/store";
import {
  PIGMENT_SYSTEMS,
  SYSTEM_LIST,
  findPigment,
  type PigmentSystem,
  type PigmentSystemId,
} from "../lib/pigments";
import {
  findRecipes,
  scaleRecipe,
  deltaEConfidence,
  BATCH_SIZES,
  gramsForLabel,
  type Recipe,
} from "../lib/mixer";
import {
  Card,
  SectionHeader,
  TextInput,
  Stamp,
} from "./ui";

export function Mix() {
  const mixer = useStore((s) => s.mixer);
  const setMixer = useStore((s) => s.setMixer);
  const saveRecipe = useStore((s) => s.saveRecipe);
  const deleteRecipe = useStore((s) => s.deleteRecipe);

  const system = PIGMENT_SYSTEMS[mixer.systemId];
  const deferredTarget = useDeferredValue(mixer.targetHex);

  const recipes = useMemo<Recipe[]>(() => {
    if (!system.available || system.pigments.length === 0) return [];
    if (!isHex(deferredTarget)) return [];
    try {
      return findRecipes(deferredTarget, system, {
        maxComponents: mixer.maxComponents,
        topN: 4,
        precision: mixer.maxComponents === 3 ? "fast" : "balanced",
      });
    } catch {
      return [];
    }
  }, [deferredTarget, system, mixer.maxComponents]);

  const top = recipes[0];
  const alts = recipes.slice(1);
  const batchGrams = gramsForLabel(mixer.batchLabel);
  const conf = top ? deltaEConfidence(top.deltaE) : null;

  return (
    <div className="mx-auto max-w-3xl px-3 sm:px-6 pb-20 pt-6 sm:pt-12">
      {/* ────────── HERO: target / predicted swatches ────────── */}
      <div className="ink-down mb-8 sm:mb-12">
        <Card paper="50" tilt={1} className="relative overflow-visible">
          <div className="p-4 sm:p-8">
            <div className="flex items-baseline justify-between mb-4 gap-2 flex-wrap">
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] text-ink-700">
                  № M-1 · The Mixer
                </div>
                <h1 className="font-poster text-4xl sm:text-6xl leading-none text-ink-950 mt-1">
                  Color → Recipe
                </h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <Stamp color="ink">{system.brand}</Stamp>
                {system.estimated && (
                  <Stamp color="pink">Estimated swatches</Stamp>
                )}
              </div>
            </div>

            {/* Side-by-side swatches */}
            <div className="grid grid-cols-2 gap-0 mt-6 border-2 border-ink-950">
              <SwatchBlock
                label="Target"
                hex={mixer.targetHex}
                muted={!isHex(mixer.targetHex)}
              />
              <SwatchBlock
                label="Predicted"
                hex={top?.predictedHex ?? "#E5E5E5"}
                muted={!top}
                rightBorder={false}
              />
            </div>

            {/* Confidence bar */}
            <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
              {conf ? (
                <DeltaBadge tier={conf.tier} dE={top!.deltaE} />
              ) : (
                <span className="font-mono text-xs text-ink-500 uppercase tracking-wider">
                  enter a hex color to begin
                </span>
              )}
              <div className="font-body italic text-xs text-ink-700">
                {conf?.label}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ────────── SYSTEM PICKER ────────── */}
      <div className="ink-rise mb-6" style={{ animationDelay: "60ms" }}>
        <Card paper="50" tilt={2}>
          <div className="p-4 sm:p-6">
            <SectionHeader num="01" sub="your pigments">
              The System
            </SectionHeader>
            <div className="flex flex-wrap gap-2">
              {SYSTEM_LIST.map((s) => (
                <SystemChip
                  key={s.id}
                  system={s}
                  active={mixer.systemId === s.id}
                  onClick={() =>
                    s.available && setMixer({ systemId: s.id })
                  }
                />
              ))}
            </div>
            <p className="font-body italic text-xs text-ink-700 mt-4 max-w-prose">
              Pigment swatches are <strong>estimated</strong>. Once you measure
              your shop's actual pigments — sample a printed chip with a phone
              eyedropper or color picker — override the values to tighten match
              accuracy.
            </p>
          </div>
        </Card>
      </div>

      {/* ────────── TARGET INPUT ────────── */}
      <div className="ink-rise mb-6" style={{ animationDelay: "120ms" }}>
        <Card paper="50" tilt={3} accent="pink">
          <div className="p-4 sm:p-6">
            <SectionHeader num="02" accent="pink" sub="hex / picker">
              The Target
            </SectionHeader>
            <div className="grid grid-cols-[1fr_auto] gap-3 items-stretch">
              <TextInput
                value={mixer.targetHex.toUpperCase()}
                onChange={(e) => {
                  let v = e.target.value.trim();
                  if (v && !v.startsWith("#")) v = "#" + v;
                  setMixer({ targetHex: v });
                }}
                placeholder="#FF3E5A"
                spellCheck={false}
                className="font-mono text-lg uppercase tracking-wider"
              />
              <label className="border-2 border-ink-950 bg-paper-50 cursor-pointer overflow-hidden flex items-center justify-center w-14 sm:w-20 hover:bg-riso-yellow/20 transition">
                <span className="sr-only">color picker</span>
                <input
                  type="color"
                  value={isHex(mixer.targetHex) ? mixer.targetHex : "#000000"}
                  onChange={(e) => setMixer({ targetHex: e.target.value })}
                  className="w-16 h-12 cursor-pointer appearance-none border-0 bg-transparent p-0"
                />
              </label>
            </div>
            <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-[11px] uppercase tracking-[0.16em] text-ink-950">
                  Search depth
                </span>
                <DepthPicker
                  value={mixer.maxComponents}
                  onChange={(n) => setMixer({ maxComponents: n })}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ────────── RECIPE ────────── */}
      <div className="ink-rise mb-6" style={{ animationDelay: "180ms" }}>
        <Card paper="50" tilt={4} accent="cyan">
          <div className="p-4 sm:p-6">
            <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[10px] tracking-[0.2em] text-ink-500">
                  03
                </span>
                <h2 className="font-display font-black text-2xl uppercase leading-none tracking-tight text-riso-cyan">
                  The Recipe
                </h2>
              </div>
              <BatchPicker
                value={mixer.batchLabel}
                onChange={(label) => setMixer({ batchLabel: label })}
              />
            </div>
            <div className="press-rule mb-4" />

            {!top ? (
              <EmptyRecipe systemAvailable={system.available} />
            ) : (
              <RecipeTable
                recipe={top}
                system={system}
                batchGrams={batchGrams}
                onSave={(name, customer) =>
                  saveRecipe({
                    ...top,
                    targetHex: mixer.targetHex,
                    batchLabel: mixer.batchLabel,
                    name,
                    customer,
                  })
                }
              />
            )}
          </div>
        </Card>
      </div>

      {/* ────────── ALTERNATIVES ────────── */}
      {alts.length > 0 && (
        <div className="ink-rise mb-6" style={{ animationDelay: "240ms" }}>
          <Card paper="50" tilt={1}>
            <div className="p-4 sm:p-6">
              <SectionHeader num="04" sub="other ways to mix it">
                Alternatives
              </SectionHeader>
              <div className="grid gap-2">
                {alts.map((r, i) => (
                  <AltRow
                    key={i}
                    recipe={r}
                    system={system}
                    onUse={() => {
                      // swap top and selected — easiest is to set targetHex to predicted
                      // but cleaner: surface as the top via maxComponents constraint.
                      // For simplicity, just inform the user.
                    }}
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ────────── RECIPE BOOK ────────── */}
      <div className="ink-rise mb-6" style={{ animationDelay: "300ms" }}>
        <Card paper="50" tilt={2}>
          <div className="p-4 sm:p-6">
            <SectionHeader num="05" sub={`${mixer.recipeBook.length} saved`}>
              Recipe Book
            </SectionHeader>
            {mixer.recipeBook.length === 0 ? (
              <p className="font-body italic text-sm text-ink-700">
                Your saved formulas will live here. Hit{" "}
                <strong className="not-italic">Save Recipe</strong> on a match
                to add one.
              </p>
            ) : (
              <ul className="space-y-2">
                {mixer.recipeBook.map((r) => (
                  <SavedRecipeRow
                    key={r.id}
                    saved={r}
                    onLoad={() =>
                      setMixer({
                        targetHex: r.targetHex,
                        batchLabel: r.batchLabel,
                        systemId: r.systemId as PigmentSystemId,
                      })
                    }
                    onDelete={() => deleteRecipe(r.id)}
                  />
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <p className="text-center mt-10 font-body italic text-sm text-ink-700">
        ◆ Match accuracy improves once you calibrate pigments to your shop. Print a
        test, measure, save the corrected recipe.
      </p>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function SwatchBlock({
  label,
  hex,
  muted,
  rightBorder = true,
}: {
  label: string;
  hex: string;
  muted?: boolean;
  rightBorder?: boolean;
}) {
  return (
    <div
      className={
        "h-32 sm:h-40 relative " +
        (rightBorder ? "border-r-2 border-ink-950" : "")
      }
      style={{ background: muted ? "#E5E5E5" : hex }}
    >
      <div className="absolute top-0 left-0 right-0 px-3 py-2 bg-ink-950/85 text-paper-50 flex items-center justify-between">
        <span className="font-display font-black text-[10px] uppercase tracking-[0.18em]">
          {label}
        </span>
        <span className="font-mono text-xs tabular-nums">
          {muted ? "—" : hex.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

function DeltaBadge({
  tier,
  dE,
}: {
  tier: "excellent" | "close" | "ballpark" | "poor";
  dE: number;
}) {
  const cls =
    tier === "excellent"
      ? "bg-riso-cyan text-paper-50"
      : tier === "close"
      ? "bg-riso-yellow text-ink-950"
      : tier === "ballpark"
      ? "bg-paper-200 text-ink-950 border-ink-950"
      : "bg-riso-pink text-paper-50";
  return (
    <span
      className={
        "inline-flex items-center gap-2 border-2 border-ink-950 px-3 py-1 " +
        cls
      }
    >
      <span className="font-display font-black text-[11px] uppercase tracking-[0.16em]">
        ΔE {dE.toFixed(1)}
      </span>
    </span>
  );
}

function SystemChip({
  system,
  active,
  onClick,
}: {
  system: PigmentSystem;
  active: boolean;
  onClick: () => void;
}) {
  const dim = !system.available;
  return (
    <button
      onClick={onClick}
      disabled={dim}
      className={
        "border-2 border-ink-950 px-3 py-2 text-left transition " +
        (dim
          ? "bg-paper-200 opacity-60 cursor-not-allowed"
          : active
          ? "bg-riso-yellow text-ink-950 shadow-[3px_3px_0_var(--color-ink-950)]"
          : "bg-paper-50 hover:bg-paper-100")
      }
    >
      <div className="font-mono text-[9px] tracking-[0.2em] text-ink-700">
        {system.brand}
      </div>
      <div className="font-display font-black text-base uppercase tracking-tight leading-tight">
        {system.name}
      </div>
      <div className="font-body italic text-[10px] text-ink-700 mt-0.5">
        {system.available
          ? `${system.pigments.length} pigments`
          : "coming soon"}
      </div>
    </button>
  );
}

function DepthPicker({
  value,
  onChange,
}: {
  value: 1 | 2 | 3;
  onChange: (v: 1 | 2 | 3) => void;
}) {
  return (
    <div className="flex items-stretch">
      {[1, 2, 3].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n as 1 | 2 | 3)}
          className={
            "border-2 border-ink-950 -ml-[2px] first:ml-0 px-3 py-1 font-display font-black text-sm tabular-nums " +
            (value === n
              ? "bg-ink-950 text-paper-50"
              : "bg-paper-50 hover:bg-paper-100")
          }
          title={`Up to ${n} pigment${n === 1 ? "" : "s"}`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function BatchPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border-2 border-ink-950 bg-paper-50 px-3 py-1.5 font-display font-black text-sm uppercase tracking-tight outline-none cursor-pointer focus:bg-riso-yellow/20"
    >
      {BATCH_SIZES.map((b) => (
        <option key={b.label} value={b.label}>
          {b.label}
        </option>
      ))}
    </select>
  );
}

function RecipeTable({
  recipe,
  system,
  batchGrams,
  onSave,
}: {
  recipe: Recipe;
  system: PigmentSystem;
  batchGrams: number;
  onSave: (name: string, customer?: string) => void;
}) {
  const ingredients = scaleRecipe(recipe, system, batchGrams);
  const [name, setName] = useState("");
  const [customer, setCustomer] = useState("");
  const [showSave, setShowSave] = useState(false);

  return (
    <div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left font-display font-bold text-[10px] uppercase tracking-[0.16em] text-ink-700 pb-2">
              Ingredient
            </th>
            <th className="text-right font-display font-bold text-[10px] uppercase tracking-[0.16em] text-ink-700 pb-2">
              Grams
            </th>
            <th className="text-right font-display font-bold text-[10px] uppercase tracking-[0.16em] text-ink-700 pb-2">
              %
            </th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ing, i) => {
            const isBase = ing.pigment.id === system.base.id;
            return (
              <tr
                key={i}
                className={"border-t border-dotted border-ink-300 " + (isBase ? "" : "")}
              >
                <td className="py-2.5 align-baseline">
                  <div
                    className={
                      "font-display font-bold uppercase tracking-tight " +
                      (isBase ? "text-ink-700 text-sm" : "text-ink-950 text-base")
                    }
                  >
                    <span
                      className="inline-block w-3 h-3 mr-2 align-middle border border-ink-950"
                      style={{ background: ing.pigment.hex }}
                    />
                    {ing.pigment.name}
                  </div>
                  {ing.pigment.shorthand && !isBase && (
                    <div className="font-mono text-[10px] text-ink-500 ml-5">
                      {ing.pigment.shorthand}
                    </div>
                  )}
                </td>
                <td className="text-right font-mono tabular-nums py-2.5 align-baseline">
                  {ing.grams.toFixed(1)}
                </td>
                <td className="text-right font-mono tabular-nums text-ink-700 py-2.5 align-baseline">
                  {ing.pct.toFixed(1)}%
                </td>
              </tr>
            );
          })}
          <tr className="border-t-2 border-ink-950">
            <td className="pt-2 font-display font-black uppercase">Total</td>
            <td className="text-right pt-2 font-mono font-bold tabular-nums">
              {batchGrams.toFixed(1)}
            </td>
            <td className="text-right pt-2 font-mono font-bold tabular-nums">
              100.0%
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-5">
        {!showSave ? (
          <button
            onClick={() => setShowSave(true)}
            className="brut-button brut-button-ink w-full px-4 py-3 text-sm uppercase"
          >
            Save Recipe ▸
          </button>
        ) : (
          <div className="space-y-2 border-2 border-dashed border-ink-700 p-3 bg-paper-100">
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Recipe name (e.g. Brand X Red)"
              className="w-full"
            />
            <TextInput
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Customer (optional)"
              className="w-full"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (!name.trim()) return;
                  onSave(name.trim(), customer.trim() || undefined);
                  setName("");
                  setCustomer("");
                  setShowSave(false);
                }}
                disabled={!name.trim()}
                className="brut-button brut-button-cyan flex-1 px-4 py-2 text-sm uppercase disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSave(false);
                  setName("");
                  setCustomer("");
                }}
                className="brut-button px-4 py-2 text-sm uppercase"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AltRow({
  recipe,
  system,
}: {
  recipe: Recipe;
  system: PigmentSystem;
  onUse?: () => void;
}) {
  const conf = deltaEConfidence(recipe.deltaE);
  const colorBlocks = recipe.ingredients
    .filter((i) => i.pigmentId !== system.base.id && i.pct > 0)
    .map((i) => findPigment(system, i.pigmentId))
    .filter(Boolean);

  return (
    <div className="grid grid-cols-[60px_1fr_auto] items-center gap-3 border-2 border-ink-950 bg-paper-50 p-2">
      <div
        className="h-10 border-2 border-ink-950"
        style={{ background: recipe.predictedHex }}
        title={recipe.predictedHex}
      />
      <div>
        <div className="flex items-center gap-1 mb-0.5">
          {colorBlocks.map((p, i) =>
            p ? (
              <span
                key={i}
                className="inline-block size-3 border border-ink-950"
                style={{ background: p.hex }}
                title={p.name}
              />
            ) : null,
          )}
        </div>
        <div className="font-display font-bold text-sm uppercase tracking-tight text-ink-950 leading-tight">
          {recipe.pigmentCount} pigment{recipe.pigmentCount === 1 ? "" : "s"}
        </div>
        <div className="font-mono text-[10px] text-ink-500">
          {recipe.predictedHex.toUpperCase()}
        </div>
      </div>
      <DeltaBadge tier={conf.tier} dE={recipe.deltaE} />
    </div>
  );
}

function SavedRecipeRow({
  saved,
  onLoad,
  onDelete,
}: {
  saved: SavedRecipe;
  onLoad: () => void;
  onDelete: () => void;
}) {
  const date = new Date(saved.createdAt);
  return (
    <li className="grid grid-cols-[44px_1fr_auto] items-center gap-3 border-2 border-ink-950 bg-paper-50 p-2">
      <button
        onClick={onLoad}
        className="h-10 w-10 border-2 border-ink-950 cursor-pointer"
        style={{ background: saved.predictedHex }}
        aria-label={`load ${saved.name}`}
      />
      <button onClick={onLoad} className="text-left">
        <div className="font-display font-bold text-base uppercase tracking-tight text-ink-950 leading-tight">
          {saved.name}
        </div>
        <div className="font-body italic text-xs text-ink-700">
          {saved.customer && (
            <>
              <span>{saved.customer}</span>
              <span className="mx-1">·</span>
            </>
          )}
          ΔE {saved.deltaE.toFixed(1)} · {saved.batchLabel} ·{" "}
          {date.toLocaleDateString()}
        </div>
      </button>
      <button
        onClick={onDelete}
        className="font-mono text-xs text-ink-500 hover:text-riso-pink px-2 py-1"
        aria-label="delete"
        title="delete"
      >
        ✕
      </button>
    </li>
  );
}

function EmptyRecipe({ systemAvailable }: { systemAvailable: boolean }) {
  return (
    <div className="py-8 text-center">
      <p className="font-body italic text-base text-ink-700">
        {!systemAvailable
          ? "Pigment data for this system is still being assembled."
          : "Enter a valid HEX color above and we'll find a recipe."}
      </p>
    </div>
  );
}

function isHex(s: string): boolean {
  return /^#?[0-9A-Fa-f]{6}$/.test(s.replace("#", ""));
}

// suppress unused import warning; kept for future enhancement (image eyedrop)
void useEffect;
