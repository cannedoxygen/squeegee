// Publicly-shared starter recipes for Matsui Neo Pigment.
//
// Source: openly-published CMYK process formulas for the Matsui Neo system
// (light-fabric and dark-fabric variants), as discussed on screen-printing
// forums and demonstrated by Matsui staff/distributors. These are educational
// examples shared in public — not Matsui's proprietary CMS database.
// Always check against your own printed swatches and cure tests.
//
// Reference thread:
//   https://www.t-shirtforums.com/water-based-ink-screen-printing/t317761.html
//
// Notes on format:
//   - Percentages are pigment-load relative to base. The forum convention
//     "100% base + 5% pigment" yields a 105-part total — when normalized to
//     100%, that's ~95.2% base + 4.8% pigment.
//   - We normalize so all ingredients sum to 100%.
//   - "Mat 301M" = matte/opaque variant; we map this to the standard 301
//     Primary Base for our system.

import type { Ingredient } from "./mixer";

export type StarterRecipe = {
  id: string;
  name: string;
  systemId: "matsui-neo";
  description: string;
  ingredients: Ingredient[];
  source: string;
};

// Helper: normalize "100% base + N% pigment" convention to summing-to-100.
function norm(parts: Array<[string, number]>): Ingredient[] {
  const total = parts.reduce((acc, [, v]) => acc + v, 0);
  return parts.map(([id, v]) => ({ pigmentId: id, pct: (v / total) * 100 }));
}

const SOURCE = "https://www.t-shirtforums.com/water-based-ink-screen-printing/t317761.html";

export const STARTER_RECIPES: StarterRecipe[] = [
  // CMYK process — light fabric (100% base + small pigment load)
  {
    id: "cmyk-light-cyan",
    name: "Process Cyan (light fabric)",
    systemId: "matsui-neo",
    description: "Public CMYK starter — Cyan for white/light-colored garments",
    ingredients: norm([
      ["neo-301-base", 100],
      ["neo-blue-mg", 5],
    ]),
    source: SOURCE,
  },
  {
    id: "cmyk-light-magenta",
    name: "Process Magenta (light fabric)",
    systemId: "matsui-neo",
    description: "Public CMYK starter — Magenta for white/light-colored garments",
    ingredients: norm([
      ["neo-301-base", 100],
      ["neo-rose-mb", 7],
    ]),
    source: SOURCE,
  },
  {
    id: "cmyk-light-yellow",
    name: "Process Yellow (light fabric)",
    systemId: "matsui-neo",
    description: "Public CMYK starter — Yellow for white/light-colored garments",
    ingredients: norm([
      ["neo-301-base", 100],
      ["neo-yellow-m3g", 7],
    ]),
    source: SOURCE,
  },
  {
    id: "cmyk-light-black",
    name: "Process Black (light fabric)",
    systemId: "matsui-neo",
    description: "Public CMYK starter — Black for white/light-colored garments",
    ingredients: norm([
      ["neo-301-base", 100],
      ["neo-black-mk", 7],
    ]),
    source: SOURCE,
  },
  // CMYK process — dark fabric (heavier pigment load + opaque base notes)
  {
    id: "cmyk-dark-cyan",
    name: "Process Cyan (dark fabric)",
    systemId: "matsui-neo",
    description:
      "Public CMYK starter — Cyan for dark cotton, print over white underbase",
    ingredients: norm([
      ["neo-301-base", 100],
      ["neo-blue-mg", 7.5],
    ]),
    source: SOURCE,
  },
  {
    id: "cmyk-dark-magenta",
    name: "Process Magenta (dark fabric)",
    systemId: "matsui-neo",
    description:
      "Public CMYK starter — Magenta for dark cotton, over white underbase",
    ingredients: norm([
      ["neo-301-base", 100],
      ["neo-rose-mb", 10.5],
    ]),
    source: SOURCE,
  },
  {
    id: "cmyk-dark-yellow",
    name: "Process Yellow (dark fabric)",
    systemId: "matsui-neo",
    description:
      "Public CMYK starter — Yellow for dark cotton, over white underbase",
    ingredients: norm([
      ["neo-301-base", 100],
      ["neo-yellow-m3g", 10.5],
    ]),
    source: SOURCE,
  },
  {
    id: "cmyk-dark-black",
    name: "Process Black (dark fabric)",
    systemId: "matsui-neo",
    description:
      "Public CMYK starter — Black for dark cotton, over white underbase",
    ingredients: norm([
      ["neo-301-base", 100],
      ["neo-black-mk", 7],
    ]),
    source: SOURCE,
  },
];
