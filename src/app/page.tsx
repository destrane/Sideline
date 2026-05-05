"use client";

import { useState, useCallback, useEffect } from "react";
import { usePrice } from "@/hooks/usePrice";
import { SIDELINE_CA } from "@/lib/constants";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  if (price <= 0) return "$0.00";
  if (price >= 1000)
    return `$${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
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
  value,
  live,
  flashKey,
  loading,
}: {
  label: string;
  value: string | null;
  live?: boolean;
  flashKey?: number;
  loading?: boolean;
}) {
  return (
    <div
      className="flex-1 px-5 py-5 border border-white/10"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(12px)" }}
    >
      <p className="text-[9px] tracking-[0.4em] uppercase font-mono text-white/40 mb-4 flex items-center gap-2">
        {label}
        {live && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#5CAF72] animate-live-pulse" />
        )}
      </p>

      {loading ? (
        <div className="h-8 w-32 bg-white/5 rounded-sm animate-pulse" />
      ) : (
        <p
          key={flashKey}
          className={`font-mono text-[1.55rem] sm:text-[1.8rem] leading-none ${
            live ? "text-white animate-flash" : "text-white/40"
          }`}
        >
          {value ?? "—"}
        </p>
      )}
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
      // silent
    }
  }, []);

  const isUp = percentChange !== null && percentChange > 0;
  const isDown = percentChange !== null && percentChange < 0;
  const changeHex = isUp ? "#5CAF72" : isDown ? "#CF5050" : "#aaa";

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/stadium.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#0a1a08",
      }}
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.78) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen px-5 sm:px-10">

        {/* Header */}
        <header className="flex items-center justify-between pt-7">
          <span className="text-[11px] tracking-[0.4em] uppercase font-sans font-medium text-white/80">
            Sideline
          </span>
          <span className="text-[10px] tracking-[0.25em] uppercase font-mono text-white/30">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </header>

        <div className="flex-1" />

        {/* Price boxes */}
        <div className="max-w-xl mx-auto w-full mb-5">
          {error ? (
            <div
              className="px-5 py-5 border border-white/10"
              style={{
                background: "rgba(0,0,0,0.72)",
                backdropFilter: "blur(12px)",
              }}
            >
              <p className="font-mono text-sm text-white/40 mb-3">{error}</p>
              <button
                onClick={resetSession}
                className="text-[9px] tracking-widest uppercase font-mono text-white/25 hover:text-white/60 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <PriceBox
                label="Where you saw it"
                value={entryPrice !== null ? formatPrice(entryPrice) : null}
                loading={loading}
              />
              <PriceBox
                label="Where it's at now"
                value={livePrice !== null ? formatPrice(livePrice) : null}
                live
                flashKey={flashKey}
                loading={loading}
              />
            </div>
          )}
        </div>

        {/* % change */}
        {!loading && !error && percentChange !== null && (
          <div className="max-w-xl mx-auto w-full mb-6 text-center">
            <span
              className="font-mono text-2xl font-bold"
              style={{ color: changeHex }}
            >
              {formatPercent(percentChange)}
            </span>
            <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-white/25 ml-3">
              since you arrived
            </span>
          </div>
        )}

        {/* Contract */}
        <div className="max-w-xl mx-auto w-full mb-5">
          <div
            className="px-4 py-3 border border-white/10 flex items-center justify-between gap-4"
            style={{
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(12px)",
            }}
          >
            <p className="font-mono text-[10px] text-white/30 break-all leading-relaxed">
              {SIDELINE_CA}
            </p>
            <button
              onClick={copyCA}
              aria-label="Copy contract address"
              className="shrink-0 font-mono text-[9px] tracking-[0.2em] uppercase border border-white/10 text-white/30 hover:text-white/80 hover:border-white/30 transition-colors duration-200 px-3 py-1.5"
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
