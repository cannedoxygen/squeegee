import { useStore } from "./state/store";
import { QuoteScreen } from "./components/QuoteScreen";
import { Matrix } from "./components/Matrix";
import { Mix } from "./components/Mix";
import { SettingsPage } from "./components/Settings";
import { Marquee } from "./components/ui";

const TICKER = [
  "Squeegee Workshop",
  "Screen Print Cost Calculator",
  "Spot color pricing engine",
  "Made for shops, by a shop",
  "EST. 2026",
  "Pull. Catch. Repeat.",
];

export default function App() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);

  return (
    <div className="min-h-full relative isolate safe-x">
      <div className="safe-top">
        <Marquee items={TICKER} />
      </div>

      <header className="sticky top-0 z-20 border-b-2 border-ink-950 bg-paper-100/95 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-3 sm:px-6 h-14 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <Wordmark />
          <Nav view={view} setView={setView} />
        </div>
      </header>

      <main className="relative z-10">
        <div key={view} className="ink-rise">
          {view === "quote" && <QuoteScreen />}
          {view === "matrix" && <Matrix />}
          {view === "mix" && <Mix />}
          {view === "settings" && <SettingsPage />}
        </div>
      </main>

      <footer className="border-t-2 border-ink-950 bg-ink-950 text-paper-50 py-4 mt-12 safe-bottom">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="font-display font-bold text-[11px] uppercase tracking-[0.2em]">
            <span className="text-riso-yellow">◆</span> Squeegee · A workshop tool
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-300">
            v1.0 · Riso Workshop edition
          </div>
        </div>
      </footer>
    </div>
  );
}

function Wordmark() {
  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      className="flex items-baseline gap-1.5 sm:gap-2 select-none min-w-0"
    >
      <PressLogo />
      <span className="ink-wear font-poster text-2xl sm:text-4xl leading-none text-ink-950">
        Squeegee
      </span>
      <span
        className="hidden sm:inline-block font-display font-black text-[10px] uppercase tracking-[0.2em] text-riso-pink"
        style={{ transform: "rotate(-4deg) translateY(-6px)" }}
      >
        ™
      </span>
    </a>
  );
}

function PressLogo() {
  return (
    <svg
      viewBox="0 0 28 28"
      className="size-7 sm:size-8 shrink-0 text-ink-950"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="square"
    >
      <rect x="3" y="5" width="22" height="5" />
      <rect x="3" y="5" width="22" height="5" fill="var(--color-riso-pink)" />
      <path d="M5 11 L23 11 L21 22 L7 22 Z" />
      <path d="M9 14 L19 14" stroke="currentColor" />
      <path d="M9 17 L19 17" stroke="currentColor" />
    </svg>
  );
}

type View = "quote" | "matrix" | "mix" | "settings";

function Nav({
  view,
  setView,
}: {
  view: View;
  setView: (v: View) => void;
}) {
  return (
    <nav className="flex items-stretch gap-0">
      <NavTab num="01" label="Quote" active={view === "quote"} onClick={() => setView("quote")} accent="pink" />
      <NavTab num="02" label="Chart" active={view === "matrix"} onClick={() => setView("matrix")} accent="cyan" />
      <NavTab num="03" label="Mix"   active={view === "mix"}    onClick={() => setView("mix")}    accent="yellow" />
      <NavTab num="04" label="Setup" active={view === "settings"} onClick={() => setView("settings")} accent="ink" />
    </nav>
  );
}

function NavTab({
  num,
  label,
  active,
  onClick,
  accent,
}: {
  num: string;
  label: string;
  active: boolean;
  onClick: () => void;
  accent: "pink" | "cyan" | "yellow" | "ink";
}) {
  const bg =
    active && accent === "pink"
      ? "bg-riso-pink text-paper-50"
      : active && accent === "cyan"
      ? "bg-riso-cyan text-paper-50"
      : active && accent === "yellow"
      ? "bg-riso-yellow text-ink-950"
      : active
      ? "bg-ink-950 text-paper-50"
      : "bg-paper-50 text-ink-950 hover:bg-paper-200";
  return (
    <button
      onClick={onClick}
      className={`border-2 border-ink-950 -ml-[2px] first:ml-0 px-2 sm:px-4 py-1.5 sm:py-2 transition ${bg}`}
    >
      <div className="hidden sm:block font-mono text-[9px] tracking-[0.2em] opacity-70">
        {num}
      </div>
      <div className="font-display font-black text-xs sm:text-base uppercase tracking-tight leading-none sm:mt-0.5">
        {label}
      </div>
    </button>
  );
}
