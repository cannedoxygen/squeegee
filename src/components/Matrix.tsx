import { useMemo } from "react";
import { useStore } from "../state/store";
import {
  computeTotals,
  primaryMatrix,
  additionalLocationMatrix,
  QTY_TIERS,
  COLOR_TIERS,
  money,
} from "../lib/calc";
import { Card, SectionHeader, Stamp } from "./ui";

export function Matrix() {
  const settings = useStore((s) => s.settings);
  const quote = useStore((s) => s.quote);

  const totals = useMemo(() => computeTotals(settings), [settings]);
  const primary = useMemo(
    () => primaryMatrix(totals, quote.blankCost, quote.marginPct, quote.rushPct),
    [totals, quote.blankCost, quote.marginPct, quote.rushPct],
  );
  const addl = useMemo(
    () => additionalLocationMatrix(totals, quote.marginPct, quote.rushPct),
    [totals, quote.marginPct, quote.rushPct],
  );

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-6 pb-20 pt-6 sm:pt-12">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="font-mono text-[10px] tracking-[0.24em] text-ink-700 uppercase mb-1">
            № A-1
          </div>
          <h1 className="font-poster text-4xl sm:text-7xl leading-none text-ink-950">
            Price List
          </h1>
          <p className="font-body italic text-sm sm:text-base text-ink-700 mt-2">
            Per-shirt sale prices · live, from your current shop costs
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Stamp color="ink">Blank {money(quote.blankCost)}</Stamp>
          <Stamp color="pink">Margin {quote.marginPct}%</Stamp>
          {quote.rushPct > 0 && <Stamp color="cyan">+{quote.rushPct}% Rush</Stamp>}
        </div>
      </div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500 mb-3 sm:hidden">
        ← swipe to see all colors →
      </p>

      <div className="ink-rise mb-8" style={{ animationDelay: "60ms" }}>
        <Card paper="50" tilt={1}>
          <div className="p-3 sm:p-7">
            <SectionHeader num="A" sub="includes garment">
              First Print Location
            </SectionHeader>
            <MatrixTable
              matrix={primary}
              corner="QTY ↓"
              headLabel="COLORS →"
              accent="pink"
            />
          </div>
        </Card>
      </div>

      <div className="ink-rise mb-8" style={{ animationDelay: "140ms" }}>
        <Card paper="50" tilt={2} accent="cyan">
          <div className="p-3 sm:p-7">
            <SectionHeader num="B" accent="cyan" sub="add-on, no garment">
              Additional Location
            </SectionHeader>
            <MatrixTable
              matrix={addl}
              corner="QTY ↓"
              headLabel="COLORS →"
              accent="cyan"
            />
          </div>
        </Card>
      </div>

      <div className="text-center mt-12">
        <span className="font-poster text-2xl text-ink-700 tracking-tight">
          ◆
        </span>
        <p className="font-body italic text-sm text-ink-700 mt-2">
          Tune line items in{" "}
          <span className="font-display font-bold uppercase not-italic text-ink-950">
            Setup
          </span>{" "}
          · this chart updates live
        </p>
      </div>
    </div>
  );
}

function MatrixTable({
  matrix,
  corner,
  headLabel,
  accent,
}: {
  matrix: { qty: number; colors: number; price: number }[][];
  corner: string;
  headLabel: string;
  accent: "pink" | "cyan";
}) {
  const accentBg = accent === "pink" ? "bg-riso-pink" : "bg-riso-cyan";
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full min-w-[480px] border-collapse">
        <thead>
          <tr>
            <th className="border-2 border-ink-950 bg-ink-950 text-paper-50 px-3 py-2 text-left">
              <div className="font-display font-black text-[10px] uppercase tracking-[0.16em]">
                {corner}
              </div>
              <div className="font-body italic text-[10px] text-ink-300 mt-0.5 normal-case">
                {headLabel}
              </div>
            </th>
            {COLOR_TIERS.map((c) => (
              <th
                key={c}
                className={`border-2 border-ink-950 ${accentBg} text-paper-50 px-3 py-3 text-right font-display font-black text-base`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {QTY_TIERS.map((qty, i) => (
            <tr key={qty}>
              <td className="border-2 border-ink-950 bg-paper-100 px-3 py-2.5 font-display font-black text-base text-ink-950 text-left">
                {qty}
              </td>
              {matrix[i].map((cell, j) => (
                <td
                  key={cell.colors}
                  className={
                    "border-2 border-ink-950 px-3 py-2.5 text-right font-mono font-medium text-sm tabular-nums " +
                    ((i + j) % 2 === 0 ? "bg-paper-50" : "bg-paper-100/60")
                  }
                >
                  {money(cell.price)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
