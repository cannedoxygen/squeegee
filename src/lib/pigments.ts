// Pigment libraries for The Mixer.
//
// IMPORTANT: All HEX values for the Matsui Neo Pigment system are *estimated*
// from trade knowledge — Matsui does not publish full-strength masstone HEX
// values for their concentrates (printed cards typically show pigments at 10%
// in 301 Primary Base, not full strength). Treat these as a starting scaffold:
// once a shop measures their own pigments with a colorimeter or scans a real
// printed swatch, they should override these values for tight matches.

export type Pigment = {
  id: string;
  name: string;
  shorthand?: string;       // e.g. "M3G", "MFR"
  hex: string;              // approximate masstone
  tintStrength?: number;    // 1 = default. Higher = more dominant in mixes.
  maxLoadPct?: number;      // hard cap on % of total mix this pigment can occupy
  notes?: string;           // human-readable hint shown in UI
  estimated?: boolean;
};

export type InkType = "waterbase" | "plastisol";

export type PigmentSystem = {
  id: PigmentSystemId;
  name: string;
  brand: string;
  inkType: InkType;
  notes: string;
  base: Pigment;                // mixing white / 301 / Opaque Core
  pigments: Pigment[];          // concentrates that load INTO the base
  minPigmentLoadPct: number;    // typical lower bound for total pigment load
  maxPigmentLoadPct: number;    // typical upper bound
  defaultLoadPct: number;       // sensible default starting point
  estimated: boolean;           // overall flag — UI shows a disclaimer when true
  available: boolean;           // false = data still being researched
  // optional secondary base (e.g. Green Galaxy Clear Core when blended 80/20)
  secondaryBase?: Pigment;
};

export type PigmentSystemId =
  | "matsui-neo"
  | "green-galaxy-fusion"
  | "fn-ink";

// ─── MATSUI NEO PIGMENT (CMS) ───────────────────────────────────
// 13 concentrates loaded INTO 301 Primary Base (an opaque mixing white).
// Source: Matsui product naming convention + trade-knowledge estimates.
// All HEX values are estimated until the user calibrates against their shop's
// actual swatches.

export const MATSUI_NEO: PigmentSystem = {
  id: "matsui-neo",
  name: "Neo Pigment",
  brand: "Matsui",
  inkType: "waterbase",
  notes:
    "13 concentrates blended into 301 Primary Base (opaque mixing white). " +
    "Typical total pigment load 5–10%. Hard ceiling around 15% combined.",
  base: {
    id: "neo-301-base",
    name: "301 Primary Base",
    hex: "#F4F4F2",
    notes: "Opaque mixing white — the carrier for every recipe in this system.",
  },
  pigments: [
    {
      id: "neo-yellow-m3g",
      name: "Yellow M3G",
      shorthand: "M3G",
      hex: "#FFE600",
      notes: "Greenish (cool) lemon yellow",
      tintStrength: 1,
      estimated: true,
    },
    {
      id: "neo-gold-yellow-mfr",
      name: "Gold Yellow MFR",
      shorthand: "MFR",
      hex: "#F2A900",
      notes: "Warm/red-shade golden yellow",
      tintStrength: 1,
      estimated: true,
    },
    {
      id: "neo-orange-mgd",
      name: "Orange MGD",
      shorthand: "MGD-O",
      hex: "#F26B1F",
      notes: "Vivid mid orange, slight red lean",
      tintStrength: 1,
      estimated: true,
    },
    {
      id: "neo-red-mgd",
      name: "Red MGD",
      shorthand: "MGD-R",
      hex: "#D81E2A",
      notes: "Warm (yellow-shade) red, fire-engine",
      tintStrength: 1,
      estimated: true,
    },
    {
      id: "neo-red-mfb",
      name: "Red MFB",
      shorthand: "MFB-R",
      hex: "#B8202E",
      notes: "Cool (blue-shade) red, leans crimson",
      tintStrength: 1,
      estimated: true,
    },
    {
      id: "neo-rose-mb",
      name: "Rose MB",
      shorthand: "MB-Ro",
      hex: "#C8175C",
      notes: "High-chroma magenta rose. Strong tinter — cap ~8%",
      tintStrength: 1.3,
      maxLoadPct: 8,
      estimated: true,
    },
    {
      id: "neo-pink-mb",
      name: "Pink MB",
      shorthand: "MB-Pi",
      hex: "#E94B86",
      notes: "Soft rose, near process magenta. Cap ~8%",
      tintStrength: 1.1,
      maxLoadPct: 8,
      estimated: true,
    },
    {
      id: "neo-violet-mfb",
      name: "Violet MFB",
      shorthand: "MFB-V",
      hex: "#5B2A86",
      notes: "Blue-shade purple. Strong tinter — cap ~8%",
      tintStrength: 1.2,
      maxLoadPct: 8,
      estimated: true,
    },
    {
      id: "neo-navy-mb",
      name: "Navy Blue MB",
      shorthand: "MB-N",
      hex: "#122B5C",
      notes: "Deep red-shade navy, near-black at full strength. Use sparingly",
      tintStrength: 1.4,
      maxLoadPct: 8,
      estimated: true,
    },
    {
      id: "neo-blue-mb",
      name: "Blue MB",
      shorthand: "MB-B",
      hex: "#1A4FA3",
      notes: "Reflex-style mid blue, slight red shade",
      tintStrength: 1.1,
      estimated: true,
    },
    {
      id: "neo-blue-mg",
      name: "Blue MG",
      shorthand: "MG-B",
      hex: "#00679A",
      notes: "Green-shade cyan/blue, cool",
      tintStrength: 1,
      estimated: true,
    },
    {
      id: "neo-green-mb",
      name: "Green MB",
      shorthand: "MB-G",
      hex: "#007A4D",
      notes: "Mid green, slight blue shade",
      tintStrength: 1,
      estimated: true,
    },
    {
      id: "neo-black-mk",
      name: "Black MK",
      shorthand: "MK",
      hex: "#0A0A0A",
      notes:
        "Neutral carbon black, very high tint strength. Cap 5–8% — over-loading affects cure",
      tintStrength: 1.6,
      maxLoadPct: 8,
      estimated: true,
    },
  ],
  minPigmentLoadPct: 2,
  maxPigmentLoadPct: 12,
  defaultLoadPct: 8,
  estimated: true,
  available: true,
};

// ─── GREEN GALAXY FUSION (Ryonet HSA) ───────────────────────────
// 11 HSA waterbase pigments loaded into Opaque Core (and optionally
// blended with Clear Core ~80/20). Sourced from product listings on
// screenprinting.com — HEX values are estimates, calibrate against your
// own printed swatches for accurate matches.

export const GREEN_GALAXY_FUSION: PigmentSystem = {
  id: "green-galaxy-fusion",
  name: "Fusion HSA",
  brand: "Green Galaxy / Ryonet",
  inkType: "waterbase",
  notes:
    "11 HSA pigments loaded into Opaque Core base (often blended 80/20 with " +
    "Clear Core for desired opacity). Typical pigment load 2–12%.",
  base: {
    id: "fusion-opaque-core",
    name: "Opaque Core Base",
    hex: "#F8F8F6",
    notes: "Opaque mixing base. Pair with Clear Core (~80/20) for fine-tuning.",
  },
  secondaryBase: {
    id: "fusion-clear-core",
    name: "Clear Core Base",
    hex: "#F2EAD3",
    notes: "Clear/translucent base. Typically blended with Opaque Core.",
  },
  pigments: [
    { id: "fusion-white",   name: "Fusion White",   hex: "#F8F8F6", notes: "Tint base / opaque white", estimated: true },
    { id: "fusion-black",   name: "Fusion Black",   hex: "#0A0A0A", notes: "Carbon black, high tinter — cap ~8%", tintStrength: 1.6, maxLoadPct: 8, estimated: true },
    { id: "fusion-yellow",  name: "Fusion Yellow",  hex: "#F8DC1E", notes: "Cool/lemon-shade yellow", estimated: true },
    { id: "fusion-gold",    name: "Fusion Gold",    hex: "#E8A300", notes: "Warm/red-shade golden yellow", estimated: true },
    { id: "fusion-orange",  name: "Fusion Scarlet", hex: "#DC2A33", notes: "Vivid orange-red (scarlet)", estimated: true },
    { id: "fusion-red",     name: "Fusion Red",     hex: "#E03127", notes: "Warm/yellow-shade red", estimated: true },
    { id: "fusion-ruby",    name: "Fusion Ruby",    hex: "#C0185A", notes: "Cool/blue-shade red, rubine. Cap ~8%", tintStrength: 1.2, maxLoadPct: 8, estimated: true },
    { id: "fusion-pink",    name: "Fusion Pink",    hex: "#F26B91", notes: "Soft rose/magenta", maxLoadPct: 8, estimated: true },
    { id: "fusion-violet",  name: "Fusion Violet",  hex: "#5C2A86", notes: "Mid violet/purple. Cap ~8%", tintStrength: 1.2, maxLoadPct: 8, estimated: true },
    { id: "fusion-blue",    name: "Fusion Blue",    hex: "#1E47B8", notes: "Reflex-style mid blue", tintStrength: 1.1, estimated: true },
    { id: "fusion-green",   name: "Fusion Green",   hex: "#00803F", notes: "Mid green, slight blue shade", estimated: true },
  ],
  minPigmentLoadPct: 2,
  maxPigmentLoadPct: 12,
  defaultLoadPct: 8,
  estimated: true,
  available: true,
};

// ─── FN-INK MIXING SYSTEM (Ryonet plastisol) ────────────────────
// 14 plastisol mixing colors loaded into FN-INK Mixing White base.
// Pantone Coated targeted via the free FN-INK Mixing software.
// Plastisol mixes work the same algebraically as waterbase here.
// All HEX values are estimated — calibrate against your shop's prints.

export const FN_INK: PigmentSystem = {
  id: "fn-ink",
  name: "Mixing System",
  brand: "FN-INK / Ryonet",
  inkType: "plastisol",
  notes:
    "14 mixing colors blended into FN-INK Mixing White. Free FN-INK software " +
    "outputs exact Pantone formulas — paste those into Squeegee's Recipe Book.",
  base: {
    id: "fnink-mixing-white",
    name: "FN-INK Mixing White",
    hex: "#F8F8F4",
    notes: "Plastisol mixing white — the carrier for every recipe.",
  },
  pigments: [
    { id: "fnink-black",         name: "FN-INK Black",            hex: "#0A0A0A", notes: "Carbon black, very high tinter — cap ~8%", tintStrength: 1.6, maxLoadPct: 8, estimated: true },
    { id: "fnink-yellow",        name: "FN-INK Yellow",           hex: "#F4D000", notes: "Cool/lemon-shade yellow", estimated: true },
    { id: "fnink-golden-yellow", name: "FN-INK Golden Yellow",    hex: "#E89B00", notes: "Warm/red-shade golden yellow", estimated: true },
    { id: "fnink-orange",        name: "FN-INK Orange",           hex: "#F26B1F", notes: "Vivid mid orange", estimated: true },
    { id: "fnink-bright-red",    name: "FN-INK Bright Red",       hex: "#DC1F2A", notes: "Warm/yellow-shade bright red", estimated: true },
    { id: "fnink-ruby-red",      name: "FN-INK Ruby Red",         hex: "#B0152C", notes: "Cool/blue-shade red, rubine", estimated: true },
    { id: "fnink-magenta",       name: "FN-INK Magenta",          hex: "#C81878", notes: "Process magenta, blue-shade. Cap ~8%", tintStrength: 1.2, maxLoadPct: 8, estimated: true },
    { id: "fnink-fuchsia",       name: "FN-INK Fuchsia",          hex: "#ED3185", notes: "Hot pink/fuchsia. Cap ~8%", tintStrength: 1.1, maxLoadPct: 8, estimated: true },
    { id: "fnink-violet",        name: "FN-INK Violet",           hex: "#5B2A86", notes: "Mid violet/purple. Cap ~8%", tintStrength: 1.2, maxLoadPct: 8, estimated: true },
    { id: "fnink-light-blue",    name: "FN-INK Light Blue",       hex: "#008FCC", notes: "Process cyan / cool light blue", estimated: true },
    { id: "fnink-light-royal",   name: "FN-INK Light Royal Blue", hex: "#4570CC", notes: "Lighter royal blue", estimated: true },
    { id: "fnink-royal-blue",    name: "FN-INK Royal Blue",       hex: "#1E45A8", notes: "Mid royal blue", tintStrength: 1.1, estimated: true },
    { id: "fnink-navy-blue",     name: "FN-INK Navy Blue",        hex: "#0E2658", notes: "Deep navy, near-black at full strength. Cap ~8%", tintStrength: 1.4, maxLoadPct: 8, estimated: true },
    { id: "fnink-kelly-green",   name: "FN-INK Kelly Green",      hex: "#00833A", notes: "Bright kelly green", estimated: true },
  ],
  minPigmentLoadPct: 2,
  maxPigmentLoadPct: 12,
  defaultLoadPct: 8,
  estimated: true,
  available: true,
};

export const PIGMENT_SYSTEMS: Record<PigmentSystemId, PigmentSystem> = {
  "matsui-neo": MATSUI_NEO,
  "green-galaxy-fusion": GREEN_GALAXY_FUSION,
  "fn-ink": FN_INK,
};

export const SYSTEM_LIST: PigmentSystem[] = [
  MATSUI_NEO,
  GREEN_GALAXY_FUSION,
  FN_INK,
];

export function findPigment(
  system: PigmentSystem,
  pigmentId: string,
): Pigment | undefined {
  if (system.base.id === pigmentId) return system.base;
  return system.pigments.find((p) => p.id === pigmentId);
}

// Apply per-pigment HEX overrides (from shop calibration) to a system.
// Returns a fresh system; the original is untouched.
export function calibratedSystem(
  system: PigmentSystem,
  overrides: Record<string, string>,
): PigmentSystem {
  if (!overrides || Object.keys(overrides).length === 0) return system;
  const apply = (p: Pigment): Pigment =>
    overrides[p.id] ? { ...p, hex: overrides[p.id], estimated: false } : p;
  return {
    ...system,
    base: apply(system.base),
    pigments: system.pigments.map(apply),
  };
}
