"use client";

import { useState, useCallback, useEffect } from "react";
import { usePrice } from "@/hooks/usePrice";
import { SIDELINE_CA, DEXSCREENER_CHART_URL } from "@/lib/constants";

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

function formatMonth(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

// ─── Skeleton block ───────────────────────────────────────────────────────────

function Skeleton({ w, h }: { w: string; h: string }) {
  return (
    <div
      className={`${w} ${h} rounded-sm bg-[#161616] animate-pulse`}
      aria-hidden="true"
    />
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

  // Flash the live price whenever it updates
  useEffect(() => {
    if (livePrice !== null) setFlashKey((k) => k + 1);
  }, [livePrice]);

  const copyCA = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SIDELINE_CA);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — silent fail
    }
  }, []);

  const isUp = percentChange !== null && percentChange > 0;
  const isDown = percentChange !== null && percentChange < 0;
  const changeColor = isUp
    ? "text-up"
    : isDown
    ? "text-down"
    : "text-[#888]";

  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-[640px] mx-auto px-6 py-16 sm:py-24 animate-fade-in">

        {/* ── Header ── */}
        <header className="flex items-baseline justify-between mb-28 sm:mb-36">
          <span className="text-[11px] tracking-[0.35em] uppercase font-sans font-medium text-text-primary">
            Sideline
          </span>
          <span className="text-[10px] tracking-[0.25em] uppercase font-mono text-text-faint">
            {formatMonth()}
          </span>
        </header>

        {/* ── Tagline ── */}
        <p className="text-[13px] tracking-[0.15em] uppercase text-text-muted mb-20 sm:mb-24 font-sans font-light">
          Priced from the moment you arrived.
        </p>

        {/* ── Price section ── */}
        {loading ? (
          <section className="space-y-14 mb-24" aria-label="Loading prices">
            <div>
              <Skeleton w="w-24" h="h-2.5" />
              <div className="mt-4">
                <Skeleton w="w-44" h="h-10" />
              </div>
            </div>
            <div>
              <Skeleton w="w-16" h="h-2.5" />
              <div className="mt-4">
                <Skeleton w="w-44" h="h-10" />
              </div>
            </div>
          </section>
        ) : error ? (
          <section className="mb-24">
            <p className="font-mono text-sm text-text-muted leading-relaxed">
              {error}
            </p>
            <button
              onClick={resetSession}
              className="mt-5 text-[10px] tracking-[0.2em] uppercase font-mono text-text-faint hover:text-text-secondary transition-colors duration-200"
            >
              Try again
            </button>
          </section>
        ) : (
          <section className="mb-24 space-y-14" aria-label="Price data">

            {/* Entry price */}
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase font-sans text-text-muted mb-3.5">
                Entry price
              </p>
              <p className="font-mono text-[2.6rem] sm:text-[3rem] leading-none text-text-secondary tracking-tight">
                {entryPrice !== null ? formatPrice(entryPrice) : "—"}
              </p>
            </div>

            {/* Live price */}
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase font-sans text-text-muted mb-3.5 flex items-center gap-2.5">
                Live
                <span
                  className="block w-1.5 h-1.5 rounded-full bg-up animate-live-pulse"
                  aria-label="Live"
                />
              </p>
              <p
                key={flashKey}
                className="font-mono text-[2.6rem] sm:text-[3rem] leading-none text-text-primary tracking-tight animate-flash"
              >
                {livePrice !== null ? formatPrice(livePrice) : "—"}
              </p>
            </div>

            {/* Percent change */}
            {percentChange !== null && (
              <div>
                <p className={`font-mono text-2xl sm:text-3xl leading-none ${changeColor}`}>
                  {formatPercent(percentChange)}
                </p>
                <p className="text-[10px] tracking-[0.25em] uppercase font-sans text-text-faint mt-2.5">
                  since you arrived
                </p>
              </div>
            )}

          </section>
        )}

        {/* ── Divider ── */}
        <div className="border-t border-border-subtle mb-14" />

        {/* ── Contract address ── */}
        <section className="mb-14">
          <p className="text-[10px] tracking-[0.3em] uppercase font-sans text-text-muted mb-4">
            Contract
          </p>
          <div className="flex items-start justify-between gap-6">
            <p className="font-mono text-[11px] text-text-secondary leading-relaxed break-all">
              {SIDELINE_CA}
            </p>
            <button
              onClick={copyCA}
              aria-label="Copy contract address"
              className="shrink-0 font-mono text-[10px] tracking-[0.2em] uppercase border border-border-dim text-text-muted hover:text-text-primary hover:border-[#3A3A3A] transition-colors duration-200 px-3 py-1.5 mt-0.5"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="border-t border-border-subtle mb-14" />

        {/* ── Actions ── */}
        <section className="flex items-center justify-between mb-28 sm:mb-36">
          {/* Buy button — replace href="#" with your DEX link */}
          <a
            href="#"
            className="font-sans text-[11px] tracking-[0.25em] uppercase border border-border-dim text-text-primary hover:border-[#4A4A4A] px-6 py-3 transition-colors duration-200"
          >
            Buy Sideline
          </a>
          <a
            href={DEXSCREENER_CHART_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-[11px] tracking-[0.25em] uppercase text-text-muted hover:text-text-secondary transition-colors duration-200"
          >
            View Chart&nbsp;↗
          </a>
        </section>

        {/* ── Footer ── */}
        <footer className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-text-faint tracking-wider">
            {lastUpdated ? `Updated ${formatTime(lastUpdated)}` : ""}
          </span>
          <button
            onClick={resetSession}
            className="font-mono text-[10px] tracking-[0.2em] uppercase text-text-faint hover:text-text-muted transition-colors duration-200"
            title="Clears your frozen entry price and re-records it fresh"
          >
            Reset session
          </button>
        </footer>

      </div>
    </main>
  );
}
