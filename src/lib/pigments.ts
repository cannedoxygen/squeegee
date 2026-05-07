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

export type PigmentSystem = {
  id: PigmentSystemId;
  name: string;
  brand: string;
  notes: string;
  base: Pigment;                // mixing white / 301 / Opaque Core
  pigments: Pigment[];          // concentrates that load INTO the base
  minPigmentLoadPct: number;    // typical lower bound for total pigment load
  maxPigmentLoadPct: number;    // typical upper bound
  defaultLoadPct: number;       // sensible default starting point
  estimated: boolean;           // overall flag — UI shows a disclaimer when true
  available: boolean;           // false = data still being researched
};

export type PigmentSystemId =
  | "matsui-neo"
  | "green-galaxy-fusion";

// ─── MATSUI NEO PIGMENT (CMS) ───────────────────────────────────
// 13 concentrates loaded INTO 301 Primary Base (an opaque mixing white).
// Source: Matsui product naming convention + trade-knowledge estimates.
// All HEX values are estimated until the user calibrates against their shop's
// actual swatches.

export const MATSUI_NEO: PigmentSystem = {
  id: "matsui-neo",
  name: "Neo Pigment",
  brand: "Matsui",
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
// Stub for now — exact pigment names + swatches still being researched.
// 11 pigments loaded into Opaque Core / Clear Core base (~80/20 typical).

export const GREEN_GALAXY_FUSION: PigmentSystem = {
  id: "green-galaxy-fusion",
  name: "Fusion HSA",
  brand: "Green Galaxy / Ryonet",
  notes:
    "11 HSA pigments loaded into Opaque Core + Clear Core base (typically 80/20). " +
    "Coming soon — pigment data still being assembled.",
  base: {
    id: "fusion-opaque-core",
    name: "Opaque Core Base",
    hex: "#F8F8F6",
    notes: "Opaque mixing base. Typically combined 80/20 with Clear Core.",
  },
  pigments: [],
  minPigmentLoadPct: 2,
  maxPigmentLoadPct: 12,
  defaultLoadPct: 8,
  estimated: true,
  available: false,
};

export const PIGMENT_SYSTEMS: Record<PigmentSystemId, PigmentSystem> = {
  "matsui-neo": MATSUI_NEO,
  "green-galaxy-fusion": GREEN_GALAXY_FUSION,
};

export const SYSTEM_LIST: PigmentSystem[] = [
  MATSUI_NEO,
  GREEN_GALAXY_FUSION,
];

export function findPigment(
  system: PigmentSystem,
  pigmentId: string,
): Pigment | undefined {
  if (system.base.id === pigmentId) return system.base;
  return system.pigments.find((p) => p.id === pigmentId);
}
