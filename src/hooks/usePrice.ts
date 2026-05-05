"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  SIDELINE_CA,
  DEXSCREENER_API_URL,
  ENTRY_PRICE_KEY,
  PRICE_POLL_INTERVAL,
} from "@/lib/constants";

export interface PriceState {
  livePrice: number | null;
  entryPrice: number | null;
  percentChange: number | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  resetSession: () => void;
}

interface DexPair {
  priceUsd: string;
  liquidity?: { usd: number };
}

// Demo mode: returns a slowly drifting price so the UI is visible before the
// real CA is added. Remove this block (or just replace the CA) to go live.
const DEMO_BASE = 0.00000142;
let _demoPrice = DEMO_BASE;
function fetchDemoPrice(): number {
  _demoPrice = _demoPrice * (1 + (Math.random() - 0.48) * 0.004);
  return _demoPrice;
}

async function fetchLivePrice(): Promise<number> {
  if (SIDELINE_CA === "PASTE_CONTRACT_ADDRESS_HERE") {
    return fetchDemoPrice();
  }

  const res = await fetch(DEXSCREENER_API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error (${res.status})`);

  const data = await res.json();
  const pairs: DexPair[] = data.pairs ?? [];

  if (pairs.length === 0) {
    throw new Error("No trading pairs found — check the contract address.");
  }

  // Use the pair with the highest liquidity
  const best = [...pairs].sort(
    (a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0)
  )[0];

  const price = parseFloat(best.priceUsd);
  if (isNaN(price) || price <= 0) throw new Error("Price data unavailable.");

  return price;
}

export function usePrice(): PriceState {
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [entryPrice, setEntryPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      if (!mountedRef.current) return;
      try {
        const price = await fetchLivePrice();
        if (!mountedRef.current) return;
        setLivePrice(price);
        setLastUpdated(new Date());
        setError(null);
      } catch {
        // Keep showing stale price on poll failure; don't disrupt the UI
      }
    }, PRICE_POLL_INTERVAL);
  }, []);

  const initPrice = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const price = await fetchLivePrice();
      if (!mountedRef.current) return;

      const stored = localStorage.getItem(ENTRY_PRICE_KEY);
      const entry = stored ? parseFloat(stored) : price;

      if (!stored) {
        localStorage.setItem(ENTRY_PRICE_KEY, String(price));
      }

      setEntryPrice(isNaN(entry) ? price : entry);
      setLivePrice(price);
      setLastUpdated(new Date());
      startPolling();
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Could not load price.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [startPolling]);

  const resetSession = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    localStorage.removeItem(ENTRY_PRICE_KEY);
    setLivePrice(null);
    setEntryPrice(null);
    setLastUpdated(null);
    initPrice();
  }, [initPrice]);

  useEffect(() => {
    mountedRef.current = true;
    initPrice();
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // initPrice is stable; run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const percentChange =
    entryPrice !== null && livePrice !== null && entryPrice !== 0
      ? ((livePrice - entryPrice) / entryPrice) * 100
      : null;

  return {
    livePrice,
    entryPrice,
    percentChange,
    loading,
    error,
    lastUpdated,
    resetSession,
  };
}
