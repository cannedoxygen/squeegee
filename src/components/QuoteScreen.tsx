import { useMemo } from "react";
import { useStore } from "../state/store";
import { computeTotals, computeQuote, money, money4 } from "../lib/calc";
import type { OversizeKey, QuoteInput } from "../lib/types";
import {
  Card,
  Field,
  NumberInput,
  SectionHeader,
  Stepper,
  Swatch,
  Tape,
  OffsetText,
  Stamp,
} from "./ui";

const SIZES: Array<{
  label: OversizeKey;
  qtyKey: keyof QuoteInput;
  blankKey: keyof QuoteInput;
}> = [
  { label: "2X", qtyKey: "qty2X", blankKey: "blank2X" },
  { label: "3X", qtyKey: "qty3X", blankKey: "blank3X" },
  { label: "4X", qtyKey: "qty4X", blankKey: "blank4X" },
  { label: "5X", qtyKey: "qty5X", blankKey: "blank5X" },
];

export function QuoteScreen() {
  const settings = useStore((s) => s.settings);
  const quote = useStore((s) => s.quote);
  const setQuote = useStore((s) => s.setQuote);

  const totals = useMemo(() => computeTotals(settings), [settings]);
  const result = useMemo(() => computeQuote(quote, totals), [quote, totals]);

  const totalScreens = quote.screensLoc1 + quote.screensLoc2;
  const isRush = quote.rushPct > 0;
  const standardCount = result.sizes[0].count;
  const overflowed =
    quote.qty2X + quote.qty3X + quote.qty4X + quote.qty5X > quote.qty;
  const usedSizes = result.sizes.filter((s) => s.count > 0);

  // money4 returns "$14.32" — strip the dollar sign for the hero off-register text
  const priceStr = money4(result.pricePerShirt).replace("$", "");

  return (
    <div className="mx-auto max-w-3xl px-3 sm:px-6 pb-20 pt-6 sm:pt-12">
      {/* ────────── HERO PRICE CARD ────────── */}
      <div
        className="ink-down relative mb-10 sm:mb-16"
        style={{ animationDelay: "0ms" }}
      >
        <Card paper="50" tilt={1} className="relative overflow-visible">
          <Tape className="-top-3 left-6 sm:left-8" rotate={-6} />
          <Tape className="-top-3 right-6 sm:right-12" rotate={5} />

          <div className="px-4 sm:px-10 pt-7 sm:pt-8 pb-5 sm:pb-6">
            {/* Top strip: meta */}
            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
              <div className="flex items-baseline gap-2 sm:gap-3">
                <span className="font-mono text-[10px] tracking-[0.22em] text-ink-700">
                  №
                </span>
                <span className="font-display font-black text-[11px] sm:text-xs uppercase tracking-[0.2em] text-ink-950">
                  Per Shirt · Standard
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {isRush && <Stamp color="pink">Rush +{quote.rushPct}%</Stamp>}
                <Stamp color="ink">QTY {quote.qty}</Stamp>
              </div>
            </div>

            {/* HERO NUMBER — off-register, huge */}
            <div className="relative py-2 sm:py-4">
              <div className="font-display font-black leading-[0.85] tracking-[-0.04em] flex items-baseline justify-center">
                <span className="font-display font-black text-riso-pink mr-1 sm:mr-2 text-3xl sm:text-5xl self-start mt-1 sm:mt-3">
                  $
                </span>
                <OffsetText className="block text-center text-[18vw] sm:text-[10rem]">
                  {priceStr}
                </OffsetText>
              </div>
            </div>

            {/* Halftone divider */}
            <div className="halftone-divider my-6" />

            {/* Pantone swatches: total + profit */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Swatch
                label="Job Total"
                value={money(result.total)}
                color="ink"
                big
              />
              <Swatch
                label="Profit"
                value={money(result.profitTotal)}
                color={result.profitTotal >= 0 ? "cyan" : "pink"}
                big
              />
            </div>

            {/* Size mix receipt */}
            {usedSizes.length > 1 && (
              <div className="mt-5 border-2 border-dashed border-ink-700 bg-paper-100 p-3">
                <div className="font-mono text-[9px] tracking-[0.2em] text-ink-700 uppercase mb-2 flex items-center gap-2">
                  <span className="text-riso-pink">▣</span> Size Breakdown
                </div>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
                  {usedSizes.map((s) => (
                    <li
                      key={s.label}
                      className="flex items-center justify-between font-mono text-sm"
                    >
                      <span className="font-bold tabular-nums">
                        {String(s.count).padStart(2, "0")}× {s.label}
                      </span>
                      <span className="tabular-nums text-ink-700">
                        {money(s.pricePerShirt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Meta row */}
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-700">
              <span className="flex items-center gap-1.5">
                <span className="size-2 bg-ink-950" />
                Cost {money4(result.unitCost + quote.blankCost)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 bg-riso-pink" />
                Margin {quote.marginPct}%
              </span>
              {isRush && (
                <span className="flex items-center gap-1.5">
                  <span className="size-2 bg-riso-cyan" />
                  Rush +{quote.rushPct}%
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* ────────── JOB CARD (qty + sizes) ────────── */}
      <div
        className="ink-down mb-8"
        style={{ animationDelay: "120ms" }}
      >
        <Card paper="50" tilt={2}>
          <div className="p-4 sm:p-8">
            <SectionHeader num="01" sub="customer order">
              The Job
            </SectionHeader>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Total Quantity">
                <NumberInput
                  value={quote.qty}
                  onChange={(n) => setQuote({ qty: n })}
                  min={1}
                  step={1}
                  suffix="pcs"
                />
              </Field>
              <Field label="Standard Blank" hint="cost per shirt">
                <NumberInput
                  value={quote.blankCost}
                  onChange={(n) => setQuote({ blankCost: n })}
                  min={0}
                  step={0.25}
                  prefix="$"
                />
              </Field>
            </div>

            {/* Size mix */}
            <div className="mt-7">
              <div className="flex items-baseline justify-between mb-3 gap-3">
                <span className="font-display font-bold text-[11px] uppercase tracking-[0.16em] text-ink-950">
                  Larger Sizes{" "}
                  <span className="font-body italic font-normal normal-case text-ink-700">
                    optional
                  </span>
                </span>
                <span
                  className={
                    "font-mono text-xs tabular-nums " +
                    (overflowed ? "text-riso-pink font-bold" : "text-ink-700")
                  }
                >
                  {standardCount} std + {result.oversizeCount} large = {quote.qty}
                </span>
              </div>

              <div className="space-y-2">
                {SIZES.map(({ label, qtyKey, blankKey }) => {
                  const count = quote[qtyKey] as number;
                  const blank = quote[blankKey] as number;
                  const sizeData = result.sizes.find((s) => s.label === label)!;
                  const active = count > 0 || blank > 0;
                  return (
                    <div
                      key={label}
                      className={
                        "border-2 p-2 transition " +
                        (active
                          ? "border-ink-950 bg-paper-50 shadow-[2px_2px_0_var(--color-ink-950)]"
                          : "border-ink-300 bg-paper-100/50")
                      }
                    >
                      <div className="grid grid-cols-[36px_1fr_1fr] sm:grid-cols-[40px_1fr_1fr_auto] items-center gap-2 sm:gap-3">
                        <span
                          className={
                            "font-display font-black text-base text-center " +
                            (active ? "text-riso-pink" : "text-ink-400")
                          }
                        >
                          {label}L
                        </span>
                        <NumberInput
                          value={count}
                          onChange={(n) =>
                            setQuote({
                              [qtyKey]: Math.max(0, n),
                            } as Partial<QuoteInput>)
                          }
                          min={0}
                          step={1}
                          suffix="qty"
                        />
                        <NumberInput
                          value={blank}
                          onChange={(n) =>
                            setQuote({
                              [blankKey]: Math.max(0, n),
                            } as Partial<QuoteInput>)
                          }
                          min={0}
                          step={0.25}
                          prefix="$"
                        />
                        <div className="hidden sm:block w-24 text-right pr-1">
                          {active ? (
                            <>
                              <div className="font-mono text-xs font-bold text-riso-pink tabular-nums">
                                +{money4(sizeData.upcharge)}
                              </div>
                              <div className="font-mono text-[10px] text-ink-700 tabular-nums">
                                = {money(sizeData.pricePerShirt)}
                              </div>
                            </>
                          ) : (
                            <span className="text-ink-400 text-xs">—</span>
                          )}
                        </div>
                      </div>
                      {/* Mobile-only price summary row, full width */}
                      {active && (
                        <div className="sm:hidden mt-2 pt-2 border-t border-dashed border-ink-300 flex items-center justify-between font-mono text-[11px] tabular-nums">
                          <span className="font-bold text-riso-pink">
                            +{money4(sizeData.upcharge)}
                          </span>
                          <span className="text-ink-700">
                            = {money(sizeData.pricePerShirt)} ea
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {overflowed && (
                <p className="mt-3 font-display font-bold text-xs uppercase tracking-wider text-riso-pink">
                  ⚠ Oversized counts exceed total qty — bump it up
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* ────────── PRINT CARD ────────── */}
      <div
        className="ink-down mb-8"
        style={{ animationDelay: "200ms" }}
      >
        <Card paper="50" tilt={3} accent="cyan">
          <div className="p-4 sm:p-8">
            <SectionHeader
              num="02"
              accent="cyan"
              sub={`${totalScreens} screen${totalScreens === 1 ? "" : "s"} on press`}
            >
              The Print
            </SectionHeader>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-display font-bold text-base uppercase tracking-tight text-ink-950">
                    Front
                  </div>
                  <div className="font-body italic text-xs text-ink-700">
                    primary location
                  </div>
                </div>
                <Stepper
                  value={quote.screensLoc1}
                  onChange={(n) => setQuote({ screensLoc1: n })}
                  max={8}
                />
              </div>
              <div className="halftone-divider" />
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-display font-bold text-base uppercase tracking-tight text-ink-950">
                    Back
                  </div>
                  <div className="font-body italic text-xs text-ink-700">
                    additional location
                  </div>
                </div>
                <Stepper
                  value={quote.screensLoc2}
                  onChange={(n) => setQuote({ screensLoc2: n })}
                  max={8}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ────────── PRICING CARD ────────── */}
      <div
        className="ink-down mb-8"
        style={{ animationDelay: "280ms" }}
      >
        <Card paper="50" tilt={4} accent="pink">
          <div className="p-4 sm:p-8">
            <SectionHeader num="03" accent="pink" sub="margin & rush">
              The Markup
            </SectionHeader>

            <div className="mb-6">
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-display font-bold text-[11px] uppercase tracking-[0.16em] text-ink-950">
                  Margin
                </span>
                <span className="font-display font-black text-2xl text-riso-pink leading-none tabular-nums">
                  {quote.marginPct}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={80}
                step={1}
                value={quote.marginPct}
                onChange={(e) =>
                  setQuote({ marginPct: Number(e.target.value) })
                }
              />
              <div className="flex justify-between mt-1 font-mono text-[9px] tracking-widest text-ink-500">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
              </div>
            </div>

            <Field label="Rush Fee" hint="adds to printing cost only, not blank">
              <NumberInput
                value={quote.rushPct}
                onChange={(n) => setQuote({ rushPct: Math.max(0, n) })}
                min={0}
                step={5}
                suffix="%"
              />
            </Field>
          </div>
        </Card>
      </div>

      {/* ────────── BREAKDOWN CARD ────────── */}
      <div
        className="ink-down mb-8"
        style={{ animationDelay: "360ms" }}
      >
        <Card paper="50" tilt={1}>
          <div className="p-4 sm:p-8">
            <SectionHeader num="04" sub="cost basis, per shirt">
              The Numbers
            </SectionHeader>

            <ul className="font-mono text-sm">
              <BreakdownRow
                label="Blank Garment"
                value={money4(result.breakdown.blank)}
              />
              <BreakdownRow
                label="Per-Unit Cost"
                value={money4(result.breakdown.perUnit)}
              />
              <BreakdownRow
                label="Per-Impression"
                value={money4(result.breakdown.perImpression)}
              />
              <BreakdownRow
                label={`Screen Setup ÷ ${quote.qty}`}
                value={money4(
                  result.breakdown.perScreen + result.breakdown.perOrder,
                )}
              />
              <BreakdownRow
                label="Print Labor"
                value={money4(result.breakdown.perScreenPerImpression)}
              />
              <li className="press-rule mt-2 mb-2" />
              <BreakdownRow
                label="Your Cost"
                value={money4(result.unitCost + quote.blankCost)}
                bold
              />
            </ul>
          </div>
        </Card>
      </div>

      {/* ────────── BOTTOM TAG ────────── */}
      <div className="text-center mt-12 mb-4">
        <span className="font-poster text-2xl text-ink-700 tracking-tight">
          ◆
        </span>
        <p className="font-body italic text-sm text-ink-700 mt-2">
          Live updates · auto-saves · tune costs in{" "}
          <span className="font-display font-bold uppercase not-italic text-riso-pink">
            Setup
          </span>
        </p>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <li
      className={
        "flex items-center justify-between py-2 " +
        (bold ? "" : "border-b border-dotted border-ink-300 last:border-0")
      }
    >
      <span
        className={
          bold
            ? "font-display font-black text-base uppercase tracking-tight text-ink-950"
            : "font-body text-ink-800"
        }
      >
        {label}
      </span>
      <span
        className={
          "tabular-nums " +
          (bold
            ? "font-mono font-bold text-lg text-ink-950"
            : "font-mono text-ink-800")
        }
      >
        {value}
      </span>
    </li>
  );
}
