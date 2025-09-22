# Hyperliquid Markets Mini Terminal (PWA)

A **mobile-first trading terminal** built with **Next.js (App Router) + TypeScript + Tailwind CSS**.  
The app provides real-time market data (price chart, order book, trades), and supports **Progressive Web App (PWA)** installation.

---

## ✨ Features

- **Markets & Pair Selection**
    - Search and select trading pairs (spot & perps)
    - Updates the main view dynamically

- **Main View**
    - Price chart (TradingView Lightweight Charts)
    - Order book (L2 aggregated bids/asks)
    - Latest trades (recent fills list)

- **Progressive Web App (PWA)**
    - Installable (manifest + service worker)
    - Offline support (app shell + last-viewed data)
    - Passes Lighthouse PWA checks
    - Mobile-first (≤ 428px), desktop layout optional

---

## 🎁 Bonus Features (planned/optional)

- WebSocket live updates (`wss://api.hyperliquid.xyz/ws`)
- Order book price aggregation (0.1 / 1 / 10 steps)
- Correct decimal handling per market metadata
- Account lookup (wallet address → account value, PnL, positions, trades)
- Scan wallet address via QR code
- Live account streaming (`activeAssetData`, `userEvents`)
- Responsive desktop layout (≥ 1024px)

---

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TradingView Lightweight Charts](https://github.com/tradingview/lightweight-charts)
- State management: **RxJS** (or Zustand alternative)
- PWA via [next-pwa](https://github.com/shadowwalker/next-pwa)

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone git@github.com:WANGjay408/hyperliquid-terminal.git
cd hyperliquid-terminal
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run dev server
```bash
npm run dev
```

### 4. Build & start
```bash
npm run build
npm start
```
---

## 📱 PWA

- The app can be **installed to home screen** on mobile devices
- Works offline with cached app shell + last viewed data
- Passes **Lighthouse PWA checks**

---
## 📦 Deployment

### Vercel (recommended)
1. Push the repo to GitHub
2. Import into [Vercel](https://vercel.com/)
3. Deploy with 1 click 🚀

### Netlify (alternative)
```bash
npm run build
# Deploy the `.next/` output folder


