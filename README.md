# Orchard Ledger (ऑर्चर्ड लेजर)

A cross-platform React Native / Expo application built specifically for apple growers in India (Himachal Pradesh, Jammu & Kashmir, and Uttarakhand).

Designed around the real operating conditions of Indian apple farming: catastrophic hailstorms, disease outbreaks from chemical over-mixing, volatile daily Mandi spreads, festival-driven demand peaks, and low uptake of crop insurance (PMFBY / WBCIS).

---

## Core Product Principles

1. **Offline-First**: Orchards routinely lack reliable cellular signal. All records are persisted locally via Zustand and Async Storage.
2. **Manual Triggers Everywhere**: No automation, AI diagnostic, or OCR extraction silently writes to your records or finances. AI suggests; the farmer explicitly taps "Confirm & Save".
3. **Meteorologically Honest Tiering**: No misleading 30-day hail predictions. Alerts are tiered into Seasonal Outlooks (4-5 weeks), Short-Range Forecasts (3-10 days), and High-Confidence Radar Nowcasts (0-24 hours).
4. **Full CRUD on All Entities**: Nothing generated automatically is locked from manual editing, backdating, or deletion.

---

## The 8 Core Modules

1. **Costing & Analysis Dashboard** (`src/app/(tabs)/index.tsx`): Default landing screen with live season spend, revenue, raw net margin, and **PMFBY / WBCIS insurance-adjusted net margin**. Includes unit economics (cost/tree, cost/kg, margin/kg), 2x2 mobile KPI grid, and consolidated dismissible alerts.
2. **Crop & Pesticide Log** (`src/app/(tabs)/log.tsx`): Spray log with automatic chemical conflict and overuse warnings (e.g. HMO + Captan phytotoxicity). Includes a manual-trigger "Identify from photo" advisory draft that pre-fills entries for farmer confirmation. Confirmed entries link stock deductions and expenses.
3. **Weather & Hail Risk Alert System** (`src/app/(tabs)/weather.tsx`): Hyperlocal GPS/micro-elevation setting (e.g., **Shahoon, Kotkhai at 2,234m MSL [3HVR+H2C]**, Kiari, Gumma, Kotgarh), winter chilling hour accumulation tracker, and 3-tier risk warnings (Seasonal, Short-range, IMD Radar Nowcast) with direct action triggers.
4. **Inventory & Stock Management** (`src/app/(tabs)/stock.tsx`): Full CRUD stock register for fungicides, fertilizers, packaging, and anti-hail nets. Tracks chemical expiration dates, reorder thresholds, and in/out audit history.
5. **Finance & Crop Insurance** (`src/app/(tabs)/finance.tsx`): Categorized expenses, revenue logging by Grade (A/B/C), category budget tracking with over-budget alerts, and a PMFBY / WBCIS insurance tracker with enrollment deadline reminders.
6. **Market Intelligence & 15-Min Cron** (`src/app/(tabs)/market.tsx`): Daily spot rates from reference mandis (Azadpur, Gumma & Chhaila Kotkhai, Bhattakuffer Shimla, Dhalli, Narwal Jammu) showing modal prices and spreads, automated 15-minute intraday price sync cron job, user-configurable target price alerts, and an Indian Festival Demand Calendar (Navratri, Diwali, Winter Wedding season).
7. **Stock, Stats & Document Management** (`src/app/(tabs)/documents.tsx`): Photograph paper receipts, run OCR to generate an editable draft with manual "Confirm & Save", and maintain an audit trail for bank loan or insurance submissions.
8. **Listings & Sales** (`src/app/(tabs)/listing.tsx`): Record graded harvest output per batch (Grade A/B/C in kg) and generate WhatsApp-ready marketing listings with market-informed asking prices.

---

## Handheld & Mobile UI Architecture

- **Ergonomic 5-Tab Mobile Navigation**: On mobile screens (`<768px`), renders a 5-button bottom bar (`Home`, `Sprays`, `Weather`, `Mandi`, `⋯ More`) with generous thumb targets and dynamic 5th-tab module highlighting, while keeping the full 8-tab bar on desktop.
- **Top Thumb-Swipeable Quick Switcher**: 1-tap horizontal scrolling between all 8 modules directly below the header on handheld devices.
- **Native Mobile Bottom Sheets**: All modals render as drag-handle bottom sheets with sticky 48px action buttons on mobile, and centered cards on desktop.
- **High-Contrast Outdoor Readability**: Tailored border contrast and bold typography for bright orchard sunlight.

---

## Clean Project Structure

```
src/
├── app/
│   ├── _layout.tsx           # Root stack layout (initializes store & mounts tabs)
│   └── (tabs)/
│       ├── _layout.tsx       # Bottom tab bar with universal navigation
│       ├── index.tsx         # Module 8: Costing & Analysis Dashboard
│       ├── log.tsx           # Module 1: Crop & Pesticide Log
│       ├── weather.tsx       # Module 2: Weather & Hail Risk Alert System
│       ├── stock.tsx         # Module 3: Inventory / Stock Management
│       ├── finance.tsx       # Module 4: Finance & Crop Insurance
│       ├── market.tsx        # Module 5: Market Intelligence & Festival Calendar
│       ├── documents.tsx     # Module 6: Documents & OCR Bills
│       └── listing.tsx       # Module 7: Harvest Listings & Sales
├── components/
│   ├── AlertBanner.tsx       # 3-tier risk banners with manual dismiss
│   ├── Card.tsx              # Styled responsive card component
│   ├── ConfirmModal.tsx      # Modal enforcing the "Manual Trigger" principle
│   ├── ExportCsvModal.tsx    # CSV download and clipboard export modal
│   ├── Header.tsx            # Top header with location & micro-elevation selector
│   ├── ModuleQuickSwitcher.tsx # Swipeable top pill bar for mobile quick navigation
│   ├── MoreModulesModal.tsx  # Bottom sheet for secondary modules on mobile
│   └── ResponsiveTabBar.tsx  # 5-tab mobile / 8-tab desktop navigation bar
├── constants/
│   ├── locations.ts          # Precise coordinates and micro-elevations (Kotkhai belt, Shimla, etc.)
│   └── theme.ts              # Theme tokens & typography
├── hooks/
│   └── use-theme.ts          # Color scheme hook
├── models/
│   └── types.ts              # Normalized TypeScript schemas for all 8 modules
└── store/
│   └── useStore.ts           # Offline-first Zustand store with Himachal seed data
```

---

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run in Desktop Browser**
   ```bash
   npm run web
   ```

3. **Run on Mobile Device (Android / iOS)**
   ```bash
   npm run android
   npm run ios
   ```
