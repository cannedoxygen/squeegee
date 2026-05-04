// Default cost model — transcribed from Sheet1 of the source xlsx.
import type { Settings } from "./types";

export const DEFAULT_SETTINGS: Settings = {
  // rows 43-55
  materialsPerScreen: [
    { id: "inkjet-ink",       name: "Inkjet Ink",        cost: 160,   shipping: 0,    packQty: 1000, packUnit: "ml",     usage: 3 },
    { id: "transparency",     name: "Transparency Film", cost: 58,    shipping: 0,    packQty: 100,  packUnit: "Sheets", usage: 1 },
    { id: "emulsion",         name: "Emulsion",          cost: 76.99, shipping: 0,    packQty: 1,    packUnit: "Gal",    usage: 0.00862 },
    { id: "screen-tape",      name: "Screen Tape",       cost: 7.55,  shipping: 0,    packQty: 180,  packUnit: "Feet",   usage: 6.83 },
    { id: "gloves",           name: "Gloves",            cost: 6.55,  shipping: 0.75, packQty: 50,   packUnit: "Pair",   usage: 2 },
    { id: "shop-towels",      name: "Shop Towels",       cost: 9.62,  shipping: 0,    packQty: 200,  packUnit: "Pc.",    usage: 5 },
    { id: "emulsion-remover", name: "Emulsion Remover",  cost: 149,   shipping: 0,    packQty: 5,    packUnit: "Gal",    usage: 0.0017 },
    { id: "ink-remover",      name: "Ink Remover",       cost: 34.95, shipping: 0,    packQty: 1,    packUnit: "Gal",    usage: 0.006 },
    { id: "haze-remover",     name: "Haze Remover 701",  cost: 45.55, shipping: 0,    packQty: 1,    packUnit: "Gal",    usage: 0.004 },
    { id: "degreaser",        name: "Degreaser",         cost: 16.95, shipping: 0,    packQty: 1,    packUnit: "Gal",    usage: 0.005 },
    { id: "scotch-tape",      name: "Scotch Tape",       cost: 6.10,  shipping: 0.79, packQty: 2592, packUnit: "Inches", usage: 5 },
    { id: "ink-cups",         name: "Ink Cups",          cost: 1.25,  shipping: 0,    packQty: 1,    packUnit: "Pc.",    usage: 1 },
    { id: "clean-up-cards",   name: "Clean Up Cards",    cost: 44.95, shipping: 0,    packQty: 1500, packUnit: "Pc.",    usage: 4 },
  ],

  // rows 60-68
  laborPerScreen: [
    { id: "reclaim",        name: "Reclaim Screen",                    minutes: 10,   rate: 12 },
    { id: "coat",           name: "Coat Screen",                       minutes: 3,    rate: 15 },
    { id: "burn",           name: "Burn Screen",                       minutes: 8.84, rate: 15 },
    { id: "pre-register",   name: "Pre-Register Screen",               minutes: 3.8,  rate: 15 },
    { id: "load-ink",       name: "Loading Ink",                       minutes: 2.18, rate: 15 },
    { id: "reg-test-print", name: "Registration Adjustment / Test",    minutes: 8.79, rate: 15 },
    { id: "clean-squeegee", name: "Clean Squeegee / Spatula",          minutes: 5,    rate: 12 },
    { id: "tape-screen",    name: "Taping Screens",                    minutes: 2.82, rate: 12 },
    { id: "ink-return",     name: "Ink Return",                        minutes: 3.6,  rate: 15 },
  ],

  // rows 73-74
  materialsPerJob: [
    { id: "pellons",     name: "Pellons",            unitType: "Pc.",  qty: 5, costPerUnit: 0.35 },
    { id: "packing-tape", name: "Custom Packing Tape", unitType: "Feet", qty: 5, costPerUnit: 0.10 },
  ],
  // row 75 (flat shipping cost)
  flatMaterialsPerJob: [
    { id: "incoming-shipping", name: "Incoming Shipping of Boxes", cost: 0.75 },
  ],

  // rows 79-81
  laborPerJob: [
    { id: "art-sep",     name: "Artwork Separation",    minutes: 30, rate: 20 },
    { id: "mockup",      name: "Mock-up / Art Conversion", minutes: 40, rate: 20 },
    { id: "ordering",    name: "Ordering Garments",     minutes: 10, rate: 15 },
  ],

  // rows 86-89
  flatMaterialsPerImpression: [
    { id: "ink",             name: "Ink",             cost: 0.50 },
    { id: "pallet-adhesive", name: "Pallet Adhesive", cost: 0.01 },
    { id: "pallet-tape",     name: "Pallet Tape",     cost: 0.02 },
    { id: "spoilage",        name: "Garment Spoilage",cost: 0.10 },
  ],

  // rows 95-100
  laborPerImpression: [
    { id: "load",       name: "Load",                                minutes: 0.30,  rate: 15 },
    { id: "pull",       name: "Pull",                                minutes: 0.23,  rate: 15 },
    { id: "scrub",      name: "Scrub Pallets",                       minutes: 0.05,  rate: 15 },
    { id: "glueing",    name: "Glueing",                             minutes: 0.022, rate: 15 },
    { id: "tape-pallet",name: "Pallet Tape Removal/Application",     minutes: 0.133, rate: 15 },
    { id: "catch",      name: "Equal Catch Time",                    minutes: 0.75,  rate: 12 },
  ],

  // rows 106-108
  flatMaterialsPerUnit: [
    { id: "boxes",    name: "Boxes",    cost: 0.10 },
    { id: "shipping", name: "Shipping", cost: 0.00 },
  ],

  // rows 112-116
  laborPerUnit: [
    { id: "unboxing",  name: "Unboxing",   minutes: 0,    rate: 0 },
    { id: "count-in",  name: "Count In",   minutes: 0.10, rate: 12 },
    { id: "count-out", name: "Count Out",  minutes: 0.10, rate: 12 },
    { id: "boxing",    name: "Boxing",     minutes: 0.10, rate: 12 },
    { id: "fold",      name: "Retail Fold",minutes: 0,    rate: 0 },
  ],

  // rows 124-125
  laborPerScreenPerImpression: [
    { id: "print",        name: "Print",                  minutes: 0.375, rate: 15 },
    { id: "match-catch",  name: "Matched Catching Time",  minutes: 0.375, rate: 12 },
  ],
};
