import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Settings, QuoteInput } from "../lib/types";
import { DEFAULT_SETTINGS } from "../lib/defaults";

type View = "quote" | "matrix" | "settings";

type Store = {
  view: View;
  setView: (v: View) => void;

  settings: Settings;
  updateSettings: (patch: (s: Settings) => Settings) => void;
  resetSettings: () => void;

  quote: QuoteInput;
  setQuote: (patch: Partial<QuoteInput>) => void;
};

const defaultQuote: QuoteInput = {
  qty: 48,
  blankCost: 5,
  marginPct: 50,
  rushPct: 0,
  screensLoc1: 1,
  screensLoc2: 0,
  qty2X: 0,
  qty3X: 0,
  qty4X: 0,
  qty5X: 0,
  blank2X: 0,
  blank3X: 0,
  blank4X: 0,
  blank5X: 0,
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      view: "quote",
      setView: (view) => set({ view }),

      settings: DEFAULT_SETTINGS,
      updateSettings: (patch) => set((s) => ({ settings: patch(s.settings) })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),

      quote: defaultQuote,
      setQuote: (patch) => set((s) => ({ quote: { ...s.quote, ...patch } })),
    }),
    {
      name: "squeegee-v2",
      partialize: (s) => ({ settings: s.settings, quote: s.quote }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<typeof current>;
        return {
          ...current,
          settings: p.settings ?? current.settings,
          quote: { ...current.quote, ...(p.quote ?? {}) },
        };
      },
    },
  ),
);
