import { useStore } from "../state/store";
import type {
  Settings,
  MaterialPerScreen,
  MaterialPerJob,
  LaborItem,
  FlatCostItem,
} from "../lib/types";
import {
  computeTotals,
  materialPerScreenCost,
  materialPerJobCost,
  laborCost,
  flatCost,
  money4,
} from "../lib/calc";
import { Card, NumberInput, SectionHeader, TextInput, Swatch } from "./ui";
import { useMemo } from "react";

export function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const reset = useStore((s) => s.resetSettings);

  const totals = useMemo(() => computeTotals(settings), [settings]);

  const setKey =
    <K extends keyof Settings>(key: K) =>
    (val: Settings[K]) =>
      update((s) => ({ ...s, [key]: val }));

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 pb-20 pt-6 sm:pt-12">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex items-end justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] tracking-[0.24em] text-ink-700 uppercase mb-1">
            № L-3 · Ledger
          </div>
          <h1 className="font-poster text-4xl sm:text-7xl leading-none text-ink-950">
            Cost Model
          </h1>
          <p className="font-body italic text-sm sm:text-base text-ink-700 mt-2 max-w-md">
            Tune your shop's costs once. Every change saves automatically and
            cascades through every quote.
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm("Reset all line items to spreadsheet defaults?"))
              reset();
          }}
          className="brut-button brut-button-pink px-3 sm:px-4 py-2 text-[10px] sm:text-xs uppercase shrink-0"
        >
          Reset
        </button>
      </div>

      {/* Section totals strip */}
      <div className="ink-rise mb-6 sm:mb-8" style={{ animationDelay: "40ms" }}>
        <Card paper="100" tilt={3}>
          <div className="p-3 sm:p-6">
            <div className="font-display font-black text-[11px] uppercase tracking-[0.18em] text-ink-700 mb-3 sm:mb-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span><span className="text-riso-pink">▣</span> The Five Buckets</span>
              <span className="font-body italic font-normal normal-case text-ink-500">
                everything reduces to these
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
              <Swatch
                label="Per Unit"
                value={money4(totals.perUnit)}
                color="ink"
              />
              <Swatch
                label="Per Imp."
                value={money4(totals.perImpression)}
                color="pink"
              />
              <Swatch
                label="Per Screen"
                value={money4(totals.perScreen)}
                color="cyan"
              />
              <Swatch
                label="Per Order"
                value={money4(totals.perOrder)}
                color="ink"
              />
              <Swatch
                label="Print Lbr"
                value={money4(totals.perScreenPerImpression)}
                color="yellow"
              />
            </div>
          </div>
        </Card>
      </div>

      <SettingsSection num="01" title="Materials per Screen" tilt={1}>
        {settings.materialsPerScreen.map((m, i) => (
          <PerScreenRow
            key={m.id}
            m={m}
            onChange={(updated) => {
              const arr = [...settings.materialsPerScreen];
              arr[i] = updated;
              setKey("materialsPerScreen")(arr);
            }}
          />
        ))}
      </SettingsSection>

      <LaborSection
        num="02"
        title="Labor per Screen"
        items={settings.laborPerScreen}
        onChange={setKey("laborPerScreen")}
        tilt={2}
      />

      <SettingsSection num="03" title="Materials per Job" tilt={3}>
        {settings.materialsPerJob.map((m, i) => (
          <PerJobRow
            key={m.id}
            m={m}
            onChange={(updated) => {
              const arr = [...settings.materialsPerJob];
              arr[i] = updated;
              setKey("materialsPerJob")(arr);
            }}
          />
        ))}
        {settings.flatMaterialsPerJob.map((f, i) => (
          <FlatRow
            key={f.id}
            f={f}
            onChange={(updated) => {
              const arr = [...settings.flatMaterialsPerJob];
              arr[i] = updated;
              setKey("flatMaterialsPerJob")(arr);
            }}
          />
        ))}
      </SettingsSection>

      <LaborSection
        num="04"
        title="Labor per Job"
        items={settings.laborPerJob}
        onChange={setKey("laborPerJob")}
        tilt={4}
      />

      <SettingsSection num="05" title="Materials per Impression" tilt={1}>
        {settings.flatMaterialsPerImpression.map((f, i) => (
          <FlatRow
            key={f.id}
            f={f}
            onChange={(updated) => {
              const arr = [...settings.flatMaterialsPerImpression];
              arr[i] = updated;
              setKey("flatMaterialsPerImpression")(arr);
            }}
          />
        ))}
      </SettingsSection>

      <LaborSection
        num="06"
        title="Labor per Impression"
        items={settings.laborPerImpression}
        onChange={setKey("laborPerImpression")}
        tilt={2}
      />

      <SettingsSection num="07" title="Materials per Unit" tilt={3}>
        {settings.flatMaterialsPerUnit.map((f, i) => (
          <FlatRow
            key={f.id}
            f={f}
            onChange={(updated) => {
              const arr = [...settings.flatMaterialsPerUnit];
              arr[i] = updated;
              setKey("flatMaterialsPerUnit")(arr);
            }}
          />
        ))}
      </SettingsSection>

      <LaborSection
        num="08"
        title="Labor per Unit"
        items={settings.laborPerUnit}
        onChange={setKey("laborPerUnit")}
        tilt={4}
      />

      <LaborSection
        num="09"
        title="Print Labor (per screen × per impression)"
        items={settings.laborPerScreenPerImpression}
        onChange={setKey("laborPerScreenPerImpression")}
        tilt={1}
      />
    </div>
  );
}

/* ─── SHARED SECTION SHELL ───────────────────────── */

function SettingsSection({
  num,
  title,
  children,
  tilt,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
  tilt?: 1 | 2 | 3 | 4;
}) {
  return (
    <div className="ink-rise mb-6">
      <Card paper="50" tilt={tilt}>
        <div className="p-3 sm:p-7">
          <SectionHeader num={num}>{title}</SectionHeader>
          <div className="space-y-3">{children}</div>
        </div>
      </Card>
    </div>
  );
}

function LaborSection({
  num,
  title,
  items,
  onChange,
  tilt,
}: {
  num: string;
  title: string;
  items: LaborItem[];
  onChange: (a: LaborItem[]) => void;
  tilt?: 1 | 2 | 3 | 4;
}) {
  return (
    <SettingsSection num={num} title={title} tilt={tilt}>
      {items.map((l, i) => (
        <LaborRow
          key={l.id}
          l={l}
          onChange={(updated) => {
            const arr = [...items];
            arr[i] = updated;
            onChange(arr);
          }}
        />
      ))}
    </SettingsSection>
  );
}

/* ─── ROW STYLES ───────────────────────── */

function RowShell({
  children,
  name,
  badge,
}: {
  children: React.ReactNode;
  name: string;
  badge: string;
}) {
  return (
    <div className="border-2 border-ink-950 bg-paper-100 p-3 sm:p-4">
      <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
        <span className="font-display font-bold text-base uppercase tracking-tight text-ink-950">
          {name}
        </span>
        <span className="font-mono text-xs font-bold text-riso-pink tabular-nums">
          {badge}
        </span>
      </div>
      {children}
    </div>
  );
}

function PerScreenRow({
  m,
  onChange,
}: {
  m: MaterialPerScreen;
  onChange: (m: MaterialPerScreen) => void;
}) {
  const cost = materialPerScreenCost(m);
  return (
    <RowShell name={m.name} badge={`${money4(cost)}/screen`}>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <Mini label="Cost">
          <NumberInput
            value={m.cost}
            onChange={(n) => onChange({ ...m, cost: n })}
            step={0.01}
            prefix="$"
          />
        </Mini>
        <Mini label="Shipping">
          <NumberInput
            value={m.shipping}
            onChange={(n) => onChange({ ...m, shipping: n })}
            step={0.01}
            prefix="$"
          />
        </Mini>
        <Mini label="Pack qty">
          <NumberInput
            value={m.packQty}
            onChange={(n) => onChange({ ...m, packQty: n })}
            step={1}
          />
        </Mini>
        <Mini label="Unit">
          <TextInput
            value={m.packUnit}
            onChange={(e) => onChange({ ...m, packUnit: e.target.value })}
          />
        </Mini>
        <Mini label="Per screen">
          <NumberInput
            value={m.usage}
            onChange={(n) => onChange({ ...m, usage: n })}
            step={0.001}
          />
        </Mini>
      </div>
    </RowShell>
  );
}

function PerJobRow({
  m,
  onChange,
}: {
  m: MaterialPerJob;
  onChange: (m: MaterialPerJob) => void;
}) {
  return (
    <RowShell name={m.name} badge={`${money4(materialPerJobCost(m))}/job`}>
      <div className="grid grid-cols-3 gap-2">
        <Mini label="Qty">
          <NumberInput
            value={m.qty}
            onChange={(n) => onChange({ ...m, qty: n })}
            step={0.5}
          />
        </Mini>
        <Mini label="Unit">
          <TextInput
            value={m.unitType}
            onChange={(e) => onChange({ ...m, unitType: e.target.value })}
          />
        </Mini>
        <Mini label="$/unit">
          <NumberInput
            value={m.costPerUnit}
            onChange={(n) => onChange({ ...m, costPerUnit: n })}
            step={0.01}
            prefix="$"
          />
        </Mini>
      </div>
    </RowShell>
  );
}

function FlatRow({
  f,
  onChange,
}: {
  f: FlatCostItem;
  onChange: (f: FlatCostItem) => void;
}) {
  return (
    <div className="flex items-center gap-3 border-2 border-ink-950 bg-paper-100 p-3 sm:p-4">
      <span className="font-display font-bold text-base uppercase tracking-tight text-ink-950 flex-1">
        {f.name}
      </span>
      <span className="font-mono text-xs font-bold text-riso-pink tabular-nums hidden sm:inline">
        {money4(flatCost(f))}
      </span>
      <div className="w-32">
        <NumberInput
          value={f.cost}
          onChange={(n) => onChange({ ...f, cost: n })}
          step={0.01}
          prefix="$"
        />
      </div>
    </div>
  );
}

function LaborRow({
  l,
  onChange,
}: {
  l: LaborItem;
  onChange: (l: LaborItem) => void;
}) {
  return (
    <RowShell name={l.name} badge={money4(laborCost(l))}>
      <div className="grid grid-cols-2 gap-2">
        <Mini label="Minutes">
          <NumberInput
            value={l.minutes}
            onChange={(n) => onChange({ ...l, minutes: n })}
            step={0.1}
          />
        </Mini>
        <Mini label="$/hour">
          <NumberInput
            value={l.rate}
            onChange={(n) => onChange({ ...l, rate: n })}
            step={0.5}
            prefix="$"
          />
        </Mini>
      </div>
    </RowShell>
  );
}

function Mini({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-display font-bold text-[10px] uppercase tracking-[0.14em] text-ink-700">
        {label}
      </span>
      {children}
    </label>
  );
}
