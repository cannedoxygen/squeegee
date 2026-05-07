import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Settings, QuoteInput } from "../lib/types";
import { DEFAULT_SETTINGS } from "../lib/defaults";
import type { PigmentSystemId } from "../lib/pigments";
import type { Recipe } from "../lib/mixer";

type View = "quote" | "matrix" | "mix" | "settings";

export type SavedRecipe = Recipe & {
  id: string;
  name: string;
  customer?: string;
  targetHex: string;
  batchLabel: string;
  createdAt: number;
};

export type MixerState = {
  systemId: PigmentSystemId;
  targetHex: string;
  batchLabel: string;
  maxComponents: 1 | 2 | 3;
  recipeBook: SavedRecipe[];
  // Per-pigment HEX overrides keyed by pigmentId. Lets a shop calibrate
  // estimated swatches to their actual measured pigment colors.
  pigmentOverrides: Record<string, string>;
};

type Store = {
  view: View;
  setView: (v: View) => void;

  settings: Settings;
  updateSettings: (patch: (s: Settings) => Settings) => void;
  resetSettings: () => void;

  quote: QuoteInput;
  setQuote: (patch: Partial<QuoteInput>) => void;

  mixer: MixerState;
  setMixer: (patch: Partial<MixerState>) => void;
  saveRecipe: (r: Omit<SavedRecipe, "id" | "createdAt">) => void;
  deleteRecipe: (id: string) => void;
  setPigmentOverride: (pigmentId: string, hex: string | null) => void;
  resetPigmentOverrides: () => void;
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

const defaultMixer: MixerState = {
  systemId: "matsui-neo",
  targetHex: "#FF3E5A",
  batchLabel: "8 oz",
  maxComponents: 3,
  recipeBook: [],
  pigmentOverrides: {},
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

      mixer: defaultMixer,
      setMixer: (patch) =>
        set((s) => ({ mixer: { ...s.mixer, ...patch } })),
      saveRecipe: (r) =>
        set((s) => ({
          mixer: {
            ...s.mixer,
            recipeBook: [
              {
                ...r,
                id:
                  typeof crypto !== "undefined" && "randomUUID" in crypto
                    ? crypto.randomUUID()
                    : Math.random().toString(36).slice(2),
                createdAt: Date.now(),
              },
              ...s.mixer.recipeBook,
            ],
          },
        })),
      deleteRecipe: (id) =>
        set((s) => ({
          mixer: {
            ...s.mixer,
            recipeBook: s.mixer.recipeBook.filter((r) => r.id !== id),
          },
        })),
      setPigmentOverride: (pigmentId, hex) =>
        set((s) => {
          const next = { ...s.mixer.pigmentOverrides };
          if (hex === null) delete next[pigmentId];
          else next[pigmentId] = hex;
          return { mixer: { ...s.mixer, pigmentOverrides: next } };
        }),
      resetPigmentOverrides: () =>
        set((s) => ({ mixer: { ...s.mixer, pigmentOverrides: {} } })),
    }),
    {
      name: "squeegee-v3",
      partialize: (s) => ({
        settings: s.settings,
        quote: s.quote,
        mixer: s.mixer,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<typeof current>;
        return {
          ...current,
          settings: p.settings ?? current.settings,
          quote: { ...current.quote, ...(p.quote ?? {}) },
          mixer: { ...current.mixer, ...(p.mixer ?? {}) },
        };
      },
    },
  ),
);
