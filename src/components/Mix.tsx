import { useDeferredValue, useMemo, useState } from "react";
import { useStore, type SavedRecipe } from "../state/store";
import {
  PIGMENT_SYSTEMS,
  SYSTEM_LIST,
  calibratedSystem,
  findPigment,
  type Pigment,
  type PigmentSystem,
  type PigmentSystemId,
} from "../lib/pigments";
import {
  findRecipes,
  scaleRecipe,
  deltaEConfidence,
  BATCH_SIZES,
  gramsForLabel,
  parseRecipeText,
  recipeFromIngredients,
  type Recipe,
  type Ingredient,
} from "../lib/mixer";
import { STARTER_RECIPES, type StarterRecipe } from "../lib/sampleRecipes";
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

  const system = useMemo(
    () =>
      calibratedSystem(
        PIGMENT_SYSTEMS[mixer.systemId],
        mixer.pigmentOverrides,
      ),
    [mixer.systemId, mixer.pigmentOverrides],
  );
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
  const [showAdd, setShowAdd] = useState(false);

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
            <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[10px] tracking-[0.2em] text-ink-500">
                  05
                </span>
                <h2 className="font-display font-black text-2xl uppercase leading-none tracking-tight text-ink-950">
                  Recipe Book
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-body italic text-sm text-ink-700">
                  {mixer.recipeBook.length} saved
                </span>
                <button
                  onClick={() => setShowAdd((v) => !v)}
                  className="brut-button brut-button-ink px-3 py-1 text-xs uppercase"
                >
                  {showAdd ? "Close" : "+ Add"}
                </button>
              </div>
            </div>
            <div className="press-rule mb-4" />

            {showAdd && (
              <div className="mb-4">
                <AddRecipeForm
                  system={system}
                  onSave={(payload) => {
                    saveRecipe(payload);
                    setShowAdd(false);
                  }}
                  onCancel={() => setShowAdd(false)}
                  defaultBatchLabel={mixer.batchLabel}
                />
              </div>
            )}

            {mixer.recipeBook.length === 0 && !showAdd ? (
              <p className="font-body italic text-sm text-ink-700">
                Your saved formulas live here. Save an auto-match, paste one
                from Matsui CMS, or add manually.
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

      {/* ────────── PUBLIC EXAMPLES ────────── */}
      <div className="ink-rise mb-6" style={{ animationDelay: "360ms" }}>
        <Card paper="50" tilt={3}>
          <div className="p-4 sm:p-6">
            <SectionHeader
              num="06"
              sub="open-source starters"
            >
              Public Examples
            </SectionHeader>
            {(() => {
              const matching = STARTER_RECIPES.filter(
                (s) => s.systemId === system.id,
              );
              if (matching.length === 0) {
                return (
                  <p className="font-body italic text-sm text-ink-700">
                    No public starters wired up for {system.brand} yet — they
                    live with the Matsui Neo system. Switch to{" "}
                    <strong className="not-italic">Matsui Neo Pigment</strong>{" "}
                    in The System above to see CMYK process examples.
                  </p>
                );
              }
              return (
                <>
                  <p className="font-body italic text-xs text-ink-700 mb-3">
                    CMYK process formulas openly shared by{" "}
                    {system.brand} distributors as teaching examples. Tap to
                    copy any starter into your Recipe Book.
                  </p>
                  <ul className="space-y-2">
                    {matching.map((s) => (
                      <StarterRow
                        key={s.id}
                        starter={s}
                        system={system}
                        onCopy={() => {
                          try {
                            const recipe = recipeFromIngredients(
                              s.ingredients,
                              system,
                            );
                            saveRecipe({
                              ...recipe,
                              targetHex: recipe.predictedHex,
                              batchLabel: mixer.batchLabel,
                              name: s.name,
                              customer: undefined,
                            });
                          } catch {
                            // recipe references pigments that aren't in the
                            // selected system — silently skip
                          }
                        }}
                      />
                    ))}
                  </ul>
                </>
              );
            })()}
          </div>
        </Card>
      </div>

      {/* ────────── CALIBRATE PIGMENTS ────────── */}
      <div className="ink-rise mb-6" style={{ animationDelay: "420ms" }}>
        <CalibrateCard system={system} />
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
  const typeLabel = system.inkType === "plastisol" ? "Plastisol" : "Waterbase";
  return (
    <button
      onClick={onClick}
      disabled={dim}
      className={
        "border-2 border-ink-950 px-3 py-2 text-left transition relative " +
        (dim
          ? "bg-paper-200 opacity-60 cursor-not-allowed"
          : active
          ? "bg-riso-yellow text-ink-950 shadow-[3px_3px_0_var(--color-ink-950)]"
          : "bg-paper-50 hover:bg-paper-100")
      }
    >
      <div className="flex items-baseline justify-between gap-2 mb-0.5">
        <div className="font-mono text-[9px] tracking-[0.2em] text-ink-700">
          {system.brand}
        </div>
        <span
          className={
            "font-display font-black text-[8px] uppercase tracking-[0.16em] px-1.5 border " +
            (system.inkType === "plastisol"
              ? "border-riso-pink text-riso-pink"
              : "border-riso-cyan text-riso-cyan")
          }
        >
          {typeLabel}
        </span>
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

/* ─── Add Recipe (manual + paste-from-CMS) ─────────────────── */

function AddRecipeForm({
  system,
  onSave,
  onCancel,
  defaultBatchLabel,
}: {
  system: PigmentSystem;
  onSave: (payload: Omit<SavedRecipe, "id" | "createdAt">) => void;
  onCancel: () => void;
  defaultBatchLabel: string;
}) {
  const [mode, setMode] = useState<"manual" | "paste">("manual");
  const [name, setName] = useState("");
  const [customer, setCustomer] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [manualPcts, setManualPcts] = useState<Record<string, number>>({});

  const allPigments: Pigment[] = useMemo(
    () => [system.base, ...system.pigments],
    [system],
  );

  const parsed = useMemo(() => {
    if (mode !== "paste" || !pasteText.trim())
      return { ingredients: [], warnings: [], matchedNames: [] };
    return parseRecipeText(pasteText, system);
  }, [mode, pasteText, system]);

  const manualIngredients: Ingredient[] = useMemo(() => {
    const items = Object.entries(manualPcts)
      .filter(([, v]) => v > 0)
      .map(([id, v]) => ({ pigmentId: id, pct: v }));
    const sum = items.reduce((acc, i) => acc + i.pct, 0);
    if (sum === 0) return [];
    return items.map((i) => ({ pigmentId: i.pigmentId, pct: (i.pct / sum) * 100 }));
  }, [manualPcts]);

  const ingredients = mode === "paste" ? parsed.ingredients : manualIngredients;
  const previewRecipe = useMemo(() => {
    if (ingredients.length === 0) return null;
    try {
      return recipeFromIngredients(ingredients, system);
    } catch {
      return null;
    }
  }, [ingredients, system]);

  const canSave = name.trim().length > 0 && ingredients.length > 0;

  return (
    <div className="border-2 border-ink-950 bg-paper-100 p-3 sm:p-4">
      {/* mode tabs */}
      <div className="flex items-stretch mb-3">
        <button
          onClick={() => setMode("manual")}
          className={
            "border-2 border-ink-950 px-3 py-1 font-display font-black text-xs uppercase tracking-tight " +
            (mode === "manual"
              ? "bg-ink-950 text-paper-50"
              : "bg-paper-50 hover:bg-paper-100")
          }
        >
          Manual
        </button>
        <button
          onClick={() => setMode("paste")}
          className={
            "border-2 border-ink-950 -ml-[2px] px-3 py-1 font-display font-black text-xs uppercase tracking-tight " +
            (mode === "paste"
              ? "bg-ink-950 text-paper-50"
              : "bg-paper-50 hover:bg-paper-100")
          }
        >
          Paste from CMS
        </button>
      </div>

      <div className="space-y-2 mb-3">
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Recipe name (e.g. PMS 185 — Matsui CMS)"
          className="w-full"
        />
        <TextInput
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          placeholder="Customer (optional)"
          className="w-full"
        />
      </div>

      {mode === "manual" ? (
        <div className="border-2 border-dashed border-ink-700 bg-paper-50 p-2 max-h-72 overflow-y-auto">
          <div className="font-display font-bold text-[10px] uppercase tracking-[0.16em] text-ink-700 mb-2 px-1">
            Pick pigments + their % of total mix
          </div>
          <ul className="space-y-1">
            {allPigments.map((p) => {
              const v = manualPcts[p.id] ?? 0;
              return (
                <li
                  key={p.id}
                  className="grid grid-cols-[20px_1fr_90px_28px] items-center gap-2"
                >
                  <span
                    className="size-4 border border-ink-950"
                    style={{ background: p.hex }}
                  />
                  <span className="font-display font-bold text-sm uppercase tracking-tight text-ink-950 truncate">
                    {p.name}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={v}
                    onChange={(e) =>
                      setManualPcts((m) => ({
                        ...m,
                        [p.id]: Number(e.target.value),
                      }))
                    }
                    className="border-2 border-ink-950 bg-paper-50 px-2 py-1 font-mono text-sm tabular-nums text-right outline-none focus:bg-riso-yellow/20"
                  />
                  <span className="font-mono text-xs text-ink-700">%</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={
              "Paste a Matsui CMS formula here, e.g.:\n\nClear 301 Base  209.4 g\nNeo Rose MB     12.0 g\nNeo Yellow M3G   5.4 g"
            }
            className="w-full h-40 border-2 border-ink-950 bg-paper-50 p-3 font-mono text-sm text-ink-950 outline-none focus:bg-riso-yellow/20 resize-y"
          />
          {parsed.matchedNames.length > 0 && (
            <div className="mt-2 border-2 border-dashed border-ink-700 bg-paper-50 p-2">
              <div className="font-display font-bold text-[10px] uppercase tracking-[0.16em] text-riso-cyan mb-1">
                Matched
              </div>
              <ul className="font-mono text-xs space-y-0.5">
                {parsed.matchedNames.map((n, i) => (
                  <li key={i} className="text-ink-950">
                    ✓ {n}
                  </li>
                ))}
              </ul>
              {parsed.warnings.length > 0 && (
                <ul className="font-mono text-xs mt-2 space-y-0.5 text-riso-pink">
                  {parsed.warnings.map((w, i) => (
                    <li key={i}>⚠ {w}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {pasteText.trim() && parsed.ingredients.length === 0 && (
            <div className="mt-2 font-mono text-xs text-riso-pink">
              No pigments matched. Try including the full pigment name (e.g.
              "Neo Rose MB" rather than "rose").
            </div>
          )}
        </div>
      )}

      {/* preview */}
      {previewRecipe && (
        <div className="mt-3 grid grid-cols-[60px_1fr] items-center gap-3 border-2 border-ink-950 bg-paper-50 p-2">
          <div
            className="h-12 border-2 border-ink-950"
            style={{ background: previewRecipe.predictedHex }}
          />
          <div>
            <div className="font-display font-bold text-sm uppercase tracking-tight text-ink-950">
              Preview · {previewRecipe.predictedHex.toUpperCase()}
            </div>
            <div className="font-body italic text-xs text-ink-700">
              {previewRecipe.pigmentCount} pigment
              {previewRecipe.pigmentCount === 1 ? "" : "s"} +{" "}
              {ingredients.find((i) => i.pigmentId === system.base.id)
                ? "base"
                : "no base"}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => {
            if (!canSave || !previewRecipe) return;
            onSave({
              ...previewRecipe,
              name: name.trim(),
              customer: customer.trim() || undefined,
              targetHex: previewRecipe.predictedHex,
              batchLabel: defaultBatchLabel,
            });
          }}
          disabled={!canSave || !previewRecipe}
          className="brut-button brut-button-cyan flex-1 px-4 py-2 text-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save to Recipe Book
        </button>
        <button
          onClick={onCancel}
          className="brut-button px-4 py-2 text-sm uppercase"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─── Starter recipe row (Public Examples) ─────────────────── */

function StarterRow({
  starter,
  system,
  onCopy,
}: {
  starter: StarterRecipe;
  system: PigmentSystem;
  onCopy: () => void;
}) {
  const recipe = useMemo(() => {
    try {
      return recipeFromIngredients(starter.ingredients, system);
    } catch {
      return null;
    }
  }, [starter, system]);
  if (!recipe) return null;
  return (
    <li className="grid grid-cols-[44px_1fr_auto] items-center gap-3 border-2 border-ink-950 bg-paper-50 p-2">
      <div
        className="h-10 w-10 border-2 border-ink-950"
        style={{ background: recipe.predictedHex }}
      />
      <div>
        <div className="font-display font-bold text-base uppercase tracking-tight text-ink-950 leading-tight">
          {starter.name}
        </div>
        <div className="font-body italic text-xs text-ink-700">
          {starter.description}
        </div>
      </div>
      <button
        onClick={onCopy}
        className="brut-button brut-button-cyan px-3 py-1 text-[10px] uppercase"
      >
        Copy →
      </button>
    </li>
  );
}

/* ─── Calibrate Pigments collapsible ─────────────────── */

function CalibrateCard({ system }: { system: PigmentSystem }) {
  const overrides = useStore((s) => s.mixer.pigmentOverrides);
  const setPigmentOverride = useStore((s) => s.setPigmentOverride);
  const resetPigmentOverrides = useStore((s) => s.resetPigmentOverrides);
  const [open, setOpen] = useState(false);

  const overrideCount = Object.keys(overrides).length;

  return (
    <Card paper="50" tilt={4}>
      <div className="p-4 sm:p-6">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-baseline justify-between gap-3 w-full text-left"
        >
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[10px] tracking-[0.2em] text-ink-500">
              07
            </span>
            <h2 className="font-display font-black text-2xl uppercase leading-none tracking-tight text-ink-950">
              Calibrate Pigments
            </h2>
          </div>
          <span className="font-display font-black text-xl">
            {open ? "−" : "+"}
          </span>
        </button>
        <div className="press-rule mt-2 mb-4" />

        {!open ? (
          <p className="font-body italic text-sm text-ink-700">
            Override any pigment's HEX with what you actually print. Mixer
            accuracy improves immediately.
            {overrideCount > 0 && (
              <>
                {" "}
                <span className="not-italic font-display font-bold text-riso-cyan">
                  {overrideCount} calibrated
                </span>
              </>
            )}
          </p>
        ) : (
          <>
            <p className="font-body italic text-xs text-ink-700 mb-3">
              Print a swatch of each pigment at full strength. Sample with your
              phone camera or a color picker. Paste the HEX here.
            </p>
            <ul className="space-y-2">
              {[system.base, ...system.pigments].map((p) => (
                <CalibrateRow
                  key={p.id}
                  pigment={p}
                  overridden={!!overrides[p.id]}
                  onChange={(hex) => setPigmentOverride(p.id, hex)}
                />
              ))}
            </ul>
            {overrideCount > 0 && (
              <button
                onClick={() => {
                  if (
                    confirm("Reset all pigment HEX overrides to estimated defaults?")
                  )
                    resetPigmentOverrides();
                }}
                className="mt-4 brut-button brut-button-pink px-3 py-2 text-[10px] uppercase"
              >
                Reset all calibrations
              </button>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

function CalibrateRow({
  pigment,
  overridden,
  onChange,
}: {
  pigment: Pigment;
  overridden: boolean;
  onChange: (hex: string | null) => void;
}) {
  return (
    <li className="grid grid-cols-[44px_1fr_120px_28px] items-center gap-2 border-2 border-ink-950 bg-paper-50 p-2">
      <label className="h-10 w-10 border-2 border-ink-950 cursor-pointer relative overflow-hidden">
        <span
          className="block w-full h-full"
          style={{ background: pigment.hex }}
        />
        <input
          type="color"
          value={pigment.hex}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </label>
      <div>
        <div className="font-display font-bold text-sm uppercase tracking-tight text-ink-950 leading-tight truncate">
          {pigment.name}
        </div>
        {pigment.shorthand && (
          <div className="font-mono text-[10px] text-ink-500">
            {pigment.shorthand}
          </div>
        )}
      </div>
      <input
        type="text"
        value={pigment.hex.toUpperCase()}
        onChange={(e) => {
          const v = e.target.value.trim();
          if (/^#?[0-9A-Fa-f]{6}$/.test(v)) {
            onChange(v.startsWith("#") ? v : `#${v}`);
          }
        }}
        className="border-2 border-ink-950 bg-paper-50 px-2 py-1 font-mono text-xs uppercase tabular-nums text-center outline-none focus:bg-riso-yellow/20"
      />
      <button
        onClick={() => overridden && onChange(null)}
        disabled={!overridden}
        title={overridden ? "Reset to estimate" : "Not calibrated"}
        className={
          "font-mono text-xs px-1 py-1 " +
          (overridden ? "text-riso-pink hover:bg-paper-100" : "text-ink-300")
        }
      >
        {overridden ? "↺" : "·"}
      </button>
    </li>
  );
}
