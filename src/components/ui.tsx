import type { InputHTMLAttributes, ReactNode } from "react";

/* ─── CARD: paper stock with brutal shadow + reg marks ───────────── */

type CardProps = {
  children: ReactNode;
  className?: string;
  accent?: "ink" | "pink" | "cyan";
  regMarks?: boolean;
  paper?: "50" | "100" | "200";
  tilt?: 1 | 2 | 3 | 4 | 0;
};

export function Card({
  children,
  className = "",
  accent = "ink",
  regMarks = true,
  paper = "50",
  tilt = 0,
}: CardProps) {
  const shadow =
    accent === "pink" ? "brut-pink" : accent === "cyan" ? "brut-cyan" : "";
  const paperClass =
    paper === "200" ? "bg-paper-200" : paper === "100" ? "bg-paper-100" : "bg-paper-50";
  const tiltClass = tilt > 0 ? `tilt-${tilt}` : "";

  return (
    <div
      className={`brut ${shadow} ${paperClass} ${tiltClass} ${className}`}
    >
      {regMarks && (
        <>
          <span className="reg-mark" style={{ top: 6, left: 6 }} />
          <span className="reg-mark" style={{ top: 6, right: 6 }} />
          <span className="reg-mark" style={{ bottom: 6, left: 6 }} />
          <span className="reg-mark" style={{ bottom: 6, right: 6 }} />
        </>
      )}
      {children}
    </div>
  );
}

/* ─── SECTION HEADER ───────────────────────── */

export function SectionHeader({
  children,
  sub,
  num,
  accent = "ink",
}: {
  children: ReactNode;
  sub?: string;
  num?: string;
  accent?: "ink" | "pink" | "cyan";
}) {
  const accentColor =
    accent === "pink"
      ? "text-riso-pink"
      : accent === "cyan"
      ? "text-riso-cyan"
      : "text-ink-950";
  return (
    <div className="mb-4">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          {num && (
            <span className="font-mono text-[10px] tracking-[0.2em] text-ink-500">
              {num}
            </span>
          )}
          <h2
            className={`font-display font-black text-2xl uppercase leading-none tracking-tight ${accentColor}`}
          >
            {children}
          </h2>
        </div>
        {sub && (
          <span className="font-body italic text-sm text-ink-700">{sub}</span>
        )}
      </div>
      <div className="mt-2 press-rule" />
    </div>
  );
}

/* ─── FIELD: label above input ───────────────────────── */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-display font-bold text-[11px] uppercase tracking-[0.16em] text-ink-950">
        {label}
      </span>
      {children}
      {hint && (
        <span className="font-body italic text-xs text-ink-700">{hint}</span>
      )}
    </label>
  );
}

/* ─── NUMBER INPUT: paper-stock plate ───────────────────────── */

type NumberInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> & {
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
  prefix?: string;
  suffix?: string;
};

export function NumberInput({
  value,
  onChange,
  step = 1,
  min,
  prefix,
  suffix,
  className = "",
  ...rest
}: NumberInputProps) {
  return (
    <div
      className={
        "flex items-center gap-2 border-2 border-ink-950 bg-paper-50 px-3 py-2 transition focus-within:bg-riso-yellow/20 focus-within:shadow-[2px_2px_0_var(--color-ink-950)] " +
        className
      }
    >
      {prefix && (
        <span className="font-body italic text-ink-700 text-sm">{prefix}</span>
      )}
      <input
        type="number"
        inputMode="decimal"
        value={Number.isFinite(value) ? value : 0}
        step={step}
        min={min}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? 0 : Number(v));
        }}
        className="w-full bg-transparent font-mono text-base font-medium text-ink-950 outline-none placeholder:text-ink-400 tabular-nums"
        {...rest}
      />
      {suffix && (
        <span className="font-display font-bold text-ink-700 text-xs uppercase tracking-wider">
          {suffix}
        </span>
      )}
    </div>
  );
}

/* ─── TEXT INPUT (rare) ───────────────────────── */

export function TextInput(
  props: InputHTMLAttributes<HTMLInputElement> & { value: string }
) {
  return (
    <input
      {...props}
      className={
        "border-2 border-ink-950 bg-paper-50 px-3 py-2 font-mono text-sm text-ink-950 outline-none focus:bg-riso-yellow/20 focus:shadow-[2px_2px_0_var(--color-ink-950)] " +
        (props.className ?? "")
      }
    />
  );
}

/* ─── STEPPER: chunky brutal buttons ───────────────────────── */

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {label && (
        <span className="font-display font-bold text-xs uppercase text-ink-950 mr-2">
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="brut-button w-11 h-11 sm:w-10 sm:h-10 text-xl font-bold flex items-center justify-center"
        aria-label="decrease"
      >
        −
      </button>
      <div className="w-12 h-11 sm:h-10 flex items-center justify-center border-2 border-ink-950 bg-paper-50 font-mono text-lg font-bold tabular-nums">
        {value}
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="brut-button brut-button-pink w-11 h-11 sm:w-10 sm:h-10 text-xl font-bold flex items-center justify-center"
        aria-label="increase"
      >
        +
      </button>
    </div>
  );
}

/* ─── SWATCH: Pantone-style color chip ───────────────────────── */

export function Swatch({
  label,
  value,
  color = "pink",
  big = false,
}: {
  label: string;
  value: string;
  color?: "pink" | "cyan" | "yellow" | "ink";
  big?: boolean;
}) {
  const bg =
    color === "pink"
      ? "bg-riso-pink"
      : color === "cyan"
      ? "bg-riso-cyan"
      : color === "yellow"
      ? "bg-riso-yellow"
      : "bg-ink-950";
  const textColor =
    color === "yellow" ? "text-ink-950" : "text-paper-50";

  return (
    <div className={`border-2 border-ink-950 ${big ? "" : "min-w-[8rem]"}`}>
      <div className={`${bg} px-3 ${big ? "py-3" : "py-2"} ${textColor}`}>
        <div
          className={`font-display font-bold uppercase tracking-[0.18em] ${
            big ? "text-xs" : "text-[10px]"
          }`}
        >
          {label}
        </div>
        <div
          className={`font-mono font-bold tabular-nums ${
            big ? "text-3xl" : "text-xl"
          } leading-none mt-1`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

/* ─── OFFSET TEXT: the off-register hero ───────────────────────── */

export function OffsetText({
  children,
  className = "",
  tight = false,
}: {
  children: string;
  className?: string;
  tight?: boolean;
}) {
  return (
    <span
      className={`off-register ${tight ? "off-register-tight" : ""} ${className}`}
      data-text={children}
    >
      {children}
    </span>
  );
}

/* ─── TAPE ───────────────────────── */

export function Tape({
  className = "",
  rotate = -4,
}: {
  className?: string;
  rotate?: number;
}) {
  return (
    <span
      className={`tape ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    />
  );
}

/* ─── MARQUEE ───────────────────────── */

export function Marquee({ items }: { items: string[] }) {
  // duplicate for seamless loop
  const loop = [...items, ...items];
  return (
    <div className="overflow-hidden border-y-2 border-ink-950 bg-ink-950 text-paper-50 py-1.5 select-none">
      <div className="marquee-track font-display font-bold text-xs uppercase tracking-[0.24em]">
        {loop.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3">
            <span className="text-riso-yellow">◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── TOGGLE ───────────────────────── */

export function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (b: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={
        "w-full text-left border-2 border-ink-950 px-3 py-2.5 flex items-center gap-3 font-display font-bold uppercase tracking-wider text-sm transition " +
        (on
          ? "bg-riso-pink text-paper-50 shadow-[3px_3px_0_var(--color-ink-950)]"
          : "bg-paper-50 text-ink-950 hover:bg-paper-100")
      }
    >
      <span
        className={
          "w-4 h-4 border-2 border-ink-950 " +
          (on ? "bg-paper-50" : "bg-transparent")
        }
      />
      {label}
    </button>
  );
}

/* ─── STAMP: decorative print-shop stamp ───────────────────────── */

export function Stamp({
  children,
  color = "pink",
  className = "",
}: {
  children: ReactNode;
  color?: "pink" | "cyan" | "ink";
  className?: string;
}) {
  const c =
    color === "pink"
      ? "border-riso-pink text-riso-pink"
      : color === "cyan"
      ? "border-riso-cyan text-riso-cyan"
      : "border-ink-950 text-ink-950";
  return (
    <span
      className={`inline-flex items-center border-2 ${c} px-2 py-0.5 font-display font-black text-[10px] uppercase tracking-[0.16em] ${className}`}
      style={{ transform: "rotate(-3deg)" }}
    >
      {children}
    </span>
  );
}
