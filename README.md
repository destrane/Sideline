# Sideline

Minimal crypto website for the Sideline token. Freezes your entry price on first visit, shows live price updates every 5 seconds, and displays your gain/loss since arrival.

---

## How to paste the contract address

Open `src/lib/constants.ts` and replace the placeholder on line 5:

```ts
export const SIDELINE_CA = "PASTE_CONTRACT_ADDRESS_HERE";
//                          ↑ replace this with your real CA
```

That file is the single source of truth. The CA flows automatically to the API call, the chart link, and the copy button.

---

## How to change the Buy button link

Open `src/app/page.tsx` and find the Buy Sideline anchor tag (search for `href="#"`). Replace `#` with your DEX link.

---

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To test the entry price behavior: open the site, note your entry price, then reload — it should stay frozen. Hit **Reset session** to clear it and re-record fresh.

---

## Building for production

```bash
npm run build
npm start
```

---

## Deploying to Vercel via GitHub

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Framework preset will auto-detect as **Next.js**
4. Click **Deploy** — no environment variables needed

Every push to `main` auto-deploys.

---

## File map

| File | Purpose |
|---|---|
| `src/lib/constants.ts` | **Contract address lives here.** Also controls poll interval. |
| `src/hooks/usePrice.ts` | Fetches live price, manages localStorage entry price, polls every 5s |
| `src/app/page.tsx` | UI — layout, prices, copy button, buy/chart links |
| `src/app/layout.tsx` | Fonts, metadata |
| `src/app/globals.css` | Base styles |
| `tailwind.config.ts` | Custom colors, fonts, animations |
