"use client";

import Image from "next/image";
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

// ─── Price box ────────────────────────────────────────────────────────────────

function PriceBox({
  label,
  price,
  live,
  flashKey,
}: {
  label: string;
  price: number | null;
  live?: boolean;
  flashKey?: number;
}) {
  return (
    <div className="flex-1 bg-black/70 backdrop-blur-md border border-white/[0.08] px-5 py-5">
      <p className="text-[9px] tracking-[0.35em] uppercase font-mono text-white/40 mb-3 flex items-center gap-2">
        {label}
        {live && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#5CAF72] animate-live-pulse" />
        )}
      </p>
      <p
        key={flashKey}
        className={`font-mono leading-none ${
          live
            ? "text-[1.6rem] sm:text-[1.85rem] text-white animate-flash"
            : "text-[1.6rem] sm:text-[1.85rem] text-white/45"
        }`}
      >
        {price !== null ? formatPrice(price) : "—"}
      </p>
    </div>
  );
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
  const changeHex = isUp ? "#5CAF72" : isDown ? "#CF5050" : "#aaaaaa";

  return (
    <main className="min-h-screen relative flex flex-col overflow-hidden">

      {/* ── Background ── */}
      <Image
        src="/stadium.png"
        alt="Sideline stadium"
        fill
        className="object-cover object-center"
        priority
      />

      {/* ── Overlay — lighter at top so the sky shows, darker at bottom for readability ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/25 to-black/80" />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col min-h-screen px-5 sm:px-10">

        {/* Header */}
        <header className="flex items-center justify-between pt-7">
          <span className="text-[11px] tracking-[0.4em] uppercase font-sans font-medium text-white/75">
            Sideline
          </span>
          <span className="text-[10px] tracking-[0.25em] uppercase font-mono text-white/25">
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
        </header>

        {/* Push content to the lower field area */}
        <div className="flex-1" />

        {/* Price boxes */}
        <div className="max-w-xl mx-auto w-full mb-5">
          {loading ? (
            <div className="flex gap-3">
              <div className="flex-1 h-28 bg-black/60 backdrop-blur-md border border-white/[0.06] animate-pulse" />
              <div className="flex-1 h-28 bg-black/60 backdrop-blur-md border border-white/[0.06] animate-pulse" />
            </div>
          ) : error ? (
            <div className="bg-black/70 backdrop-blur-md border border-white/[0.08] px-5 py-5">
              <p className="font-mono text-sm text-white/40">{error}</p>
              <button
                onClick={resetSession}
                className="mt-3 text-[9px] tracking-widest uppercase font-mono text-white/25 hover:text-white/60 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <PriceBox label="Where you saw it" price={entryPrice} />
              <PriceBox
                label="Where it's at now"
                price={livePrice}
                live
                flashKey={flashKey}
              />
            </div>
          )}
        </div>

        {/* % change */}
        {!loading && !error && percentChange !== null && (
          <div className="max-w-xl mx-auto w-full mb-6 text-center">
            <span className="font-mono text-2xl font-bold" style={{ color: changeHex }}>
              {formatPercent(percentChange)}
            </span>
            <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-white/25 ml-3">
              since you arrived
            </span>
          </div>
        )}

        {/* Contract */}
        <div className="max-w-xl mx-auto w-full mb-5">
          <div className="bg-black/60 backdrop-blur-md border border-white/[0.07] px-4 py-3 flex items-center justify-between gap-4">
            <p className="font-mono text-[10px] text-white/30 break-all leading-relaxed">
              {SIDELINE_CA}
            </p>
            <button
              onClick={copyCA}
              aria-label="Copy contract address"
              className="shrink-0 font-mono text-[9px] tracking-[0.2em] uppercase border border-white/[0.1] text-white/30 hover:text-white/75 hover:border-white/25 transition-colors duration-200 px-3 py-1.5"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-xl mx-auto w-full pb-7 flex items-center justify-between">
          <span className="font-mono text-[9px] text-white/20 tracking-wider">
            {lastUpdated ? `Updated ${formatTime(lastUpdated)}` : ""}
          </span>
          <button
            onClick={resetSession}
            className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/20 hover:text-white/50 transition-colors duration-200"
          >
            Reset session
          </button>
        </div>

      </div>
    </main>
  );
}
