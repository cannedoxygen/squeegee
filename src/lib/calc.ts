// Pure math. No React, no state. Faithful port of Sheet1 formulas.
import type {
  Settings,
  Totals,
  QuoteInput,
  QuoteResult,
  SizeRow,
  MaterialPerScreen,
  MaterialPerJob,
  LaborItem,
  FlatCostItem,
} from "./types";

// row-level cost helpers ------------------------------------------------------

export const materialPerScreenCost = (m: MaterialPerScreen) =>
  m.packQty > 0 ? ((m.cost + m.shipping) / m.packQty) * m.usage : 0;

export const materialPerJobCost = (m: MaterialPerJob) => m.qty * m.costPerUnit;

export const laborCost = (l: LaborItem) => (l.rate / 60) * l.minutes;

export const flatCost = (f: FlatCostItem) => f.cost;

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

// section totals — these are the building blocks B130..B134 -----------------

export function computeTotals(s: Settings): Totals {
  const perScreenMaterial = sum(s.materialsPerScreen.map(materialPerScreenCost));
  const perScreenLabor = sum(s.laborPerScreen.map(laborCost));

  const perJobMaterial =
    sum(s.materialsPerJob.map(materialPerJobCost)) +
    sum(s.flatMaterialsPerJob.map(flatCost));
  const perJobLabor = sum(s.laborPerJob.map(laborCost));

  const perImpressionMaterial = sum(s.flatMaterialsPerImpression.map(flatCost));
  const perImpressionLabor = sum(s.laborPerImpression.map(laborCost));

  const perUnitMaterial = sum(s.flatMaterialsPerUnit.map(flatCost));
  const perUnitLabor = sum(s.laborPerUnit.map(laborCost));

  const perScreenPerImpression = sum(s.laborPerScreenPerImpression.map(laborCost));

  return {
    perUnit: perUnitMaterial + perUnitLabor,                       // B130
    perImpression: perImpressionMaterial + perImpressionLabor,     // B131
    perScreen: perScreenMaterial + perScreenLabor,                 // B132
    perOrder: perJobMaterial + perJobLabor,                        // B133
    perScreenPerImpression,                                        // B134
  };
}

// quote -----------------------------------------------------------------------

export function computeQuote(q: QuoteInput, t: Totals): QuoteResult {
  const totalScreens = q.screensLoc1 + q.screensLoc2;
  const locations = (q.screensLoc1 > 0 ? 1 : 0) + (q.screensLoc2 > 0 ? 1 : 0) || 1;
  const qty = Math.max(1, q.qty);

  // E2 formula expanded into named pieces
  const perUnit = t.perUnit;
  const perImpression = t.perImpression * locations;
  const perScreen = (t.perScreen * totalScreens) / qty;
  const perOrder = t.perOrder / qty;
  const perScreenPerImpression = t.perScreenPerImpression * totalScreens;

  const unitCost =
    perUnit + perImpression + perScreen + perOrder + perScreenPerImpression;

  const marginFactor = 1 - q.marginPct / 100;
  const rushFactor = 1 + q.rushPct / 100;

  const blankPriced = q.blankCost / Math.max(0.01, marginFactor);
  const printPriced = (unitCost / Math.max(0.01, marginFactor)) * rushFactor;
  const pricePerShirt = blankPriced + printPriced;

  // size mix — clamp oversized total to qty so user can't oversell
  const rawOversize =
    Math.max(0, q.qty2X) +
    Math.max(0, q.qty3X) +
    Math.max(0, q.qty4X) +
    Math.max(0, q.qty5X);
  const oversizeCount = Math.min(rawOversize, qty);
  const standardCount = Math.max(0, qty - oversizeCount);

  const ups = {
    "2X": oversizeUpcharge(q.blank2X, q.blankCost, q.marginPct),
    "3X": oversizeUpcharge(q.blank3X, q.blankCost, q.marginPct),
    "4X": oversizeUpcharge(q.blank4X, q.blankCost, q.marginPct),
    "5X": oversizeUpcharge(q.blank5X, q.blankCost, q.marginPct),
  };
  const counts = {
    "2X": Math.max(0, q.qty2X),
    "3X": Math.max(0, q.qty3X),
    "4X": Math.max(0, q.qty4X),
    "5X": Math.max(0, q.qty5X),
  };

  const sizes: SizeRow[] = [
    { label: "Standard", count: standardCount, pricePerShirt, upcharge: 0 },
    ...(["2X", "3X", "4X", "5X"] as const).map<SizeRow>((k) => ({
      label: k,
      count: counts[k],
      pricePerShirt: pricePerShirt + ups[k],
      upcharge: ups[k],
    })),
  ];

  const total = sizes.reduce((acc, r) => acc + r.count * r.pricePerShirt, 0);

  // size-aware cost basis (oversized shirts cost more blank, same print)
  const blankDiffCost =
    counts["2X"] * Math.max(0, q.blank2X - q.blankCost) +
    counts["3X"] * Math.max(0, q.blank3X - q.blankCost) +
    counts["4X"] * Math.max(0, q.blank4X - q.blankCost) +
    counts["5X"] * Math.max(0, q.blank5X - q.blankCost);
  const totalCost = qty * (q.blankCost + unitCost) + blankDiffCost;
  const profitTotal = total - totalCost;
  const profitPerShirt = pricePerShirt - (q.blankCost + unitCost);

  return {
    unitCost,
    pricePerShirt,
    total,
    profitPerShirt,
    profitTotal,
    sizes,
    oversizeCount,
    breakdown: {
      perUnit,
      perImpression,
      perScreen,
      perOrder,
      perScreenPerImpression,
      blank: q.blankCost,
    },
  };
}

// oversized garment upcharge --------------------------------------------------
// Mirrors E3-E6: (sized_blank - base_blank) / (1 - margin), rush NOT applied.

export function oversizeUpcharge(
  sizedBlank: number,
  baseBlank: number,
  marginPct: number,
): number {
  if (sizedBlank <= 0 || sizedBlank <= baseBlank) return 0;
  const m = 1 - marginPct / 100;
  return (sizedBlank - baseBlank) / Math.max(0.01, m);
}

// pricing matrix --------------------------------------------------------------

export const QTY_TIERS = [12, 24, 48, 72, 144, 288] as const;
export const COLOR_TIERS = [1, 2, 3, 4, 5] as const;

export type MatrixCell = { qty: number; colors: number; cost: number; price: number };

export function primaryMatrix(
  t: Totals,
  blankCost: number,
  marginPct: number,
  rushPct: number,
): MatrixCell[][] {
  const m = 1 - marginPct / 100;
  const r = 1 + rushPct / 100;
  return QTY_TIERS.map((qty) =>
    COLOR_TIERS.map((colors) => {
      const cost =
        t.perUnit +
        t.perImpression +
        (t.perScreen * colors) / qty +
        t.perOrder / qty +
        t.perScreenPerImpression * colors;
      const price = (cost / Math.max(0.01, m)) * r + blankCost / Math.max(0.01, m);
      return { qty, colors, cost, price };
    }),
  );
}

export function additionalLocationMatrix(
  t: Totals,
  marginPct: number,
  rushPct: number,
): MatrixCell[][] {
  const m = 1 - marginPct / 100;
  const r = 1 + rushPct / 100;
  return QTY_TIERS.map((qty) =>
    COLOR_TIERS.map((colors) => {
      const cost =
        t.perImpression +
        (t.perScreen * colors) / qty +
        t.perScreenPerImpression * colors;
      const price = (cost / Math.max(0.01, m)) * r;
      return { qty, colors, cost, price };
    }),
  );
}

// formatting ------------------------------------------------------------------

export const money = (n: number) =>
  isFinite(n)
    ? n.toLocaleString("en-US", { style: "currency", currency: "USD" })
    : "—";

export const money4 = (n: number) =>
  isFinite(n)
    ? n.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      })
    : "—";
