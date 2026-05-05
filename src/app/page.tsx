"use client";

import { useState, useCallback, useEffect } from "react";
import { usePrice } from "@/hooks/usePrice";
import { SIDELINE_CA } from "@/lib/constants";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  if (price <= 0) return "$0.00";
  if (price >= 1000) return `$${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(4)}`;
  if (price >= 0.01) return `$${price.toFixed(6)}`;
  if (price >= 0.0001) return `$${price.toFixed(8)}`;
  return `$${price.toFixed(10)}`;
}

function formatPercent(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ─── Bench SVG ───────────────────────────────────────────────────────────────

function BenchIcon() {
  return (
    <svg width="36" height="24" viewBox="0 0 36 24" fill="none" aria-hidden="true">
      {/* Back rest */}
      <rect x="2" y="1" width="32" height="5" rx="2" fill="#7A5C18" />
      {/* Back supports */}
      <rect x="6"  y="6" width="3" height="4" rx="1" fill="#5E4510" />
      <rect x="27" y="6" width="3" height="4" rx="1" fill="#5E4510" />
      {/* Seat */}
      <rect x="0" y="10" width="36" height="5" rx="2" fill="#8B6820" />
      {/* Legs */}
      <rect x="5"  y="15" width="4" height="8" rx="1.5" fill="#5E4510" />
      <rect x="27" y="15" width="4" height="8" rx="1.5" fill="#5E4510" />
    </svg>
  );
}

// ─── Sideline field ───────────────────────────────────────────────────────────
// Shows a top-down strip of a sports field.
// Entry (bench) is anchored at the sideline boundary.
// The live price ball moves along the field based on % change.

function SidelineField({
  entryPrice,
  livePrice,
  percentChange,
}: {
  entryPrice: number | null;
  livePrice: number | null;
  percentChange: number | null;
}) {
  const BENCH_POS = 19; // % from left — the sideline boundary

  // 1% price change → ~0.45% movement on the track, with a +5% nudge so the
  // ball starts just inside the field at 0% change.
  const rawChange = percentChange ?? 0;
  const livePos = Math.max(6, Math.min(92, BENCH_POS + rawChange * 0.45 + 5));

  const isUp = rawChange > 0;
  const isDown = rawChange < 0;
  const ballColor = isUp ? "#5CAF72" : isDown ? "#CF5050" : "#888";
  const ballGlow = isUp ? "#5CAF7240" : isDown ? "#CF505040" : "#88888830";

  // Labels only show when the markers aren't crowding each other
  const markersApart = Math.abs(livePos - BENCH_POS) > 12;

  const yardLines = [30, 40, 50, 60, 70, 80, 90];

  return (
    <div className="mb-8">
      {/* Field strip */}
      <div className="relative h-[88px] overflow-hidden rounded-sm border border-[#162A11] bg-[#0C1A09]">

        {/* Sideline zone (left of bench) */}
        <div
          className="absolute top-0 bottom-0 bg-[#0A1508] border-r border-[#1E3A18]"
          style={{ width: `${BENCH_POS}%` }}
        >
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[7px] tracking-[0.25em] uppercase font-mono text-[#1D2E18] whitespace-nowrap select-none">
            Sideline
          </span>
        </div>

        {/* Yard lines on the field */}
        {yardLines.map((pos) => (
          <div
            key={pos}
            className="absolute top-3 bottom-3 w-px bg-[#163012] opacity-70"
            style={{ left: `${pos}%` }}
          />
        ))}

        {/* Dotted trail between bench and ball */}
        {Math.abs(livePos - BENCH_POS) > 3 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 h-px border-t border-dashed opacity-20"
            style={{
              left: `${Math.min(BENCH_POS, livePos) + 1}%`,
              width: `${Math.abs(livePos - BENCH_POS) - 1}%`,
              borderColor: ballColor,
            }}
          />
        )}

        {/* Entry — bench icon pinned at the boundary */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center gap-[3px]"
          style={{ left: `${BENCH_POS}%` }}
        >
          <BenchIcon />
          <div className="w-3 h-3 rounded-full border-2 border-[#3A3A3A] bg-[#1C1C1C]" />
        </div>

        {/* Live price ball — moves across the field */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-700 ease-out"
          style={{ left: `${livePos}%` }}
        >
          <div
            className="w-6 h-6 rounded-full border-2 animate-live-pulse"
            style={{
              backgroundColor: ballColor,
              borderColor: ballColor,
              boxShadow: `0 0 14px ${ballGlow}`,
            }}
          />
        </div>
      </div>

      {/* Price labels below the field */}
      <div className="relative h-9 mt-1 overflow-hidden">
        {/* Entry label */}
        <div
          className="absolute -translate-x-1/2 text-center"
          style={{ left: `${BENCH_POS}%` }}
        >
          <span className="block text-[7px] tracking-[0.3em] uppercase font-mono text-[#333]">
            {markersApart ? "Entry" : ""}
          </span>
          <span className="block text-[9px] font-mono text-[#444]">
            {markersApart && entryPrice !== null ? formatPrice(entryPrice) : ""}
          </span>
        </div>

        {/* Live label */}
        <div
          className="absolute -translate-x-1/2 text-center transition-all duration-700 ease-out"
          style={{ left: `${livePos}%` }}
        >
          <span
            className="block text-[7px] tracking-[0.3em] uppercase font-mono"
            style={{ color: ballColor }}
          >
            Now
          </span>
          <span
            className="block text-[9px] font-mono"
            style={{ color: ballColor }}
          >
            {livePrice !== null ? formatPrice(livePrice) : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ w, h }: { w: string; h: string }) {
  return <div className={`${w} ${h} rounded-sm bg-[#161616] animate-pulse`} aria-hidden />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const {
    livePrice,
    entryPrice,
    percentChange,
    loading,
    error,
    lastUpdated,
    resetSession,
  } = usePrice();

  const [copied, setCopied] = useState(false);
  const [flashKey, setFlashKey] = useState(0);

  useEffect(() => {
    if (livePrice !== null) setFlashKey((k) => k + 1);
  }, [livePrice]);

  const copyCA = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SIDELINE_CA);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — silent fail
    }
  }, []);

  const isUp = percentChange !== null && percentChange > 0;
  const isDown = percentChange !== null && percentChange < 0;
  const changeHex = isUp ? "#5CAF72" : isDown ? "#CF5050" : "#888";

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#EBEBEB]">
      <div className="max-w-[580px] mx-auto px-6 py-14 sm:py-20 animate-fade-in">

        {/* ── Header ── */}
        <header className="flex items-baseline justify-between mb-10">
          <span className="text-[11px] tracking-[0.35em] uppercase font-sans font-medium">
            Sideline
          </span>
          <span className="text-[10px] tracking-[0.25em] uppercase font-mono text-[#333]">
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
        </header>

        {/* ── Scoreboard ── */}
        <div className="border border-[#202020] mb-2 bg-[#0D0D0D]">

          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-[#181818] px-4 py-2.5">
            <span className="text-[9px] tracking-[0.35em] uppercase font-mono text-[#3A3A3A]">
              Scoreboard
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5CAF72] animate-live-pulse" />
              <span className="text-[8px] tracking-widest font-mono text-[#3A3A3A] uppercase">Live</span>
            </span>
          </div>

          {/* Price columns */}
          {loading ? (
            <div className="p-5 space-y-3">
              <Skeleton w="w-28" h="h-2.5" />
              <Skeleton w="w-44" h="h-9" />
            </div>
          ) : error ? (
            <div className="p-5 font-mono text-sm text-[#555]">
              {error}
              <button
                onClick={resetSession}
                className="block mt-3 text-[9px] tracking-widest uppercase text-[#3A3A3A] hover:text-[#666] transition-colors"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 divide-x divide-[#181818]">

              {/* Saw it at */}
              <div className="px-4 py-5">
                <p className="text-[8px] tracking-[0.35em] uppercase font-mono text-[#3A3A3A] mb-2.5">
                  Saw it at
                </p>
                <p className="font-mono text-[1.7rem] sm:text-[2rem] text-[#5A5A5A] leading-none">
                  {entryPrice !== null ? formatPrice(entryPrice) : "—"}
                </p>
              </div>

              {/* Now at */}
              <div className="px-4 py-5">
                <p className="text-[8px] tracking-[0.35em] uppercase font-mono text-[#3A3A3A] mb-2.5">
                  Now at
                </p>
                <p
                  key={flashKey}
                  className="font-mono text-[1.7rem] sm:text-[2rem] text-[#EBEBEB] leading-none animate-flash"
                >
                  {livePrice !== null ? formatPrice(livePrice) : "—"}
                </p>
              </div>
            </div>
          )}

          {/* Change footer */}
          {!loading && !error && percentChange !== null && (
            <div className="border-t border-[#181818] px-4 py-3 flex items-center gap-3">
              <span
                className="font-mono text-xl font-bold"
                style={{ color: changeHex }}
              >
                {formatPercent(percentChange)}
              </span>
              <span className="text-[8px] tracking-[0.25em] uppercase font-mono text-[#333]">
                since you sat down
              </span>
            </div>
          )}
        </div>

        {/* ── Sideline field ── */}
        {!loading && !error && (
          <SidelineField
            entryPrice={entryPrice}
            livePrice={livePrice}
            percentChange={percentChange}
          />
        )}

        {/* ── Divider ── */}
        <div className="border-t border-[#1A1A1A] mb-10" />

        {/* ── Contract ── */}
        <section className="mb-10">
          <p className="text-[9px] tracking-[0.3em] uppercase font-mono text-[#3A3A3A] mb-3.5">
            Contract
          </p>
          <div className="flex items-start justify-between gap-4">
            <p className="font-mono text-[11px] text-[#777] break-all leading-relaxed">
              {SIDELINE_CA}
            </p>
            <button
              onClick={copyCA}
              aria-label="Copy contract address"
              className="shrink-0 font-mono text-[9px] tracking-[0.2em] uppercase border border-[#252525] text-[#444] hover:text-[#EBEBEB] hover:border-[#3A3A3A] transition-colors duration-200 px-3 py-1.5"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="border-t border-[#1A1A1A] mb-8" />

        {/* ── Footer ── */}
        <footer className="flex items-center justify-between">
          <span className="font-mono text-[9px] text-[#2A2A2A] tracking-wider">
            {lastUpdated ? `Updated ${formatTime(lastUpdated)}` : ""}
          </span>
          <button
            onClick={resetSession}
            className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#2A2A2A] hover:text-[#555] transition-colors duration-200"
            title="Clears your frozen entry price and re-records fresh"
          >
            Reset session
          </button>
        </footer>

      </div>
    </main>
  );
}
