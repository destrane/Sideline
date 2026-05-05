// ─── CONTRACT ADDRESS ────────────────────────────────────────────────────────
// Replace the value below with your real Sideline contract address.
// This is the ONLY place you need to edit after deployment.
export const SIDELINE_CA = "PASTE_CONTRACT_ADDRESS_HERE";

// Dexscreener API — fetches live price data for the token
export const DEXSCREENER_API_URL = `https://api.dexscreener.com/latest/dex/tokens/${SIDELINE_CA}`;

// Dexscreener chart page for the token
export const DEXSCREENER_CHART_URL = `https://dexscreener.com/token/${SIDELINE_CA}`;

// Live price polling interval in milliseconds
export const PRICE_POLL_INTERVAL = 5000;

// localStorage key used to persist the visitor's frozen entry price
export const ENTRY_PRICE_KEY = "sideline_entry_price";
