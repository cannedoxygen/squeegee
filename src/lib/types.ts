// All cost-model types. Mirrors Sheet1 of the source xlsx.

export type MaterialPerScreen = {
  id: string;
  name: string;
  cost: number;       // pack price ($)
  shipping: number;   // shipping for the pack ($)
  packQty: number;    // how many units in the pack
  packUnit: string;   // ml, Sheets, Gal, Feet, Pc., Pair, Inches, Each
  usage: number;      // units consumed per screen
};

export type MaterialPerJob = {
  id: string;
  name: string;
  unitType: string;     // Pc., Feet
  qty: number;          // units used per job
  costPerUnit: number;  // $ per unit
};

export type FlatCostItem = {
  id: string;
  name: string;
  cost: number;         // $ per unit / per job / per impression
};

export type LaborItem = {
  id: string;
  name: string;
  minutes: number;      // time per X
  rate: number;         // $ / hour
};

export type Settings = {
  materialsPerScreen: MaterialPerScreen[];
  laborPerScreen: LaborItem[];

  materialsPerJob: MaterialPerJob[];
  flatMaterialsPerJob: FlatCostItem[];   // e.g. incoming shipping
  laborPerJob: LaborItem[];

  flatMaterialsPerImpression: FlatCostItem[];
  laborPerImpression: LaborItem[];

  flatMaterialsPerUnit: FlatCostItem[];
  laborPerUnit: LaborItem[];

  laborPerScreenPerImpression: LaborItem[];
};

export type QuoteInput = {
  qty: number;           // TOTAL shirts (standard + oversized)
  blankCost: number;     // standard blank cost
  marginPct: number;     // 0-99, percent
  rushPct: number;       // 0+, percent
  // Up to 2 locations (matches the spreadsheet model). Phase 2 will generalize.
  screensLoc1: number;
  screensLoc2: number;
  // Oversized counts (subset of qty) and their blank costs.
  qty2X: number;
  qty3X: number;
  qty4X: number;
  qty5X: number;
  blank2X: number;
  blank3X: number;
  blank4X: number;
  blank5X: number;
};

export type OversizeKey = "2X" | "3X" | "4X" | "5X";

export type Totals = {
  perUnit: number;                 // B130
  perImpression: number;           // B131
  perScreen: number;               // B132
  perOrder: number;                // B133
  perScreenPerImpression: number;  // B134
};

export type SizeRow = {
  label: "Standard" | OversizeKey;
  count: number;
  pricePerShirt: number;   // includes any upcharge
  upcharge: number;        // 0 for Standard
};

export type QuoteResult = {
  unitCost: number;          // print cost per shirt, no blank
  pricePerShirt: number;     // standard sale price per shirt
  // size-aware totals
  total: number;
  profitPerShirt: number;    // standard
  profitTotal: number;       // actual, mix-adjusted
  // size mix
  sizes: SizeRow[];
  oversizeCount: number;     // sum of qty2X..5X (clamped to <= qty)
  // breakdown (per shirt, cost basis)
  breakdown: {
    perUnit: number;
    perImpression: number;
    perScreen: number;
    perOrder: number;
    perScreenPerImpression: number;
    blank: number;
  };
};
