# Implementation Prompt — Aquaculture Dashboard Rebuild

## Context

This is a Next.js 14 + TypeScript + Tailwind CSS + InstantDB project: an aquaculture farm monitoring dashboard. The project is being redesigned. A new UI prototype already exists as a static HTML file at:

```
.superpowers/brainstorm/merged-dashboard.html
```

**Read that file first.** It is the source of truth for all UI/layout/styling. The goal is to convert that HTML prototype into a working React/Next.js app wired to the real backend.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + inline styles (match the dark theme in the HTML prototype exactly)
- **Database:** InstantDB (`@instantdb/react`) — real-time, client-side
- **Auth:** InstantDB built-in auth
- **Package manager:** npm

---

## Goal

Replace the current multi-page dashboard with a **single-page, 3-tab dashboard** that exactly matches `merged-dashboard.html`, wired to the live InstantDB backend and a simplified WQI calculator.

The three tabs are:
1. **Risk** — Water quality monitoring (3 parameters), eutrophication risk, alerts
2. **Stocking** — Stocking density analysis and recommendations
3. **Eco-label** — Eco-label progress tracker (static UI for now)

---

## What to Keep (do NOT touch these)

| File | Why |
|------|-----|
| `lib/instant.ts` | InstantDB client init |
| `lib/instantdb.ts` | InstantDB + admin setup |
| `lib/farm-context.tsx` | Farm state provider |
| `lib/auth-context.tsx` | Auth context |
| `lib/auth-helper.ts` | Auth utilities |
| `app/auth/page.tsx` | Auth page |
| `app/signin/page.tsx` | Sign-in page |
| `app/signup/page.tsx` | Sign-up page |
| `app/layout.tsx` | Root layout |
| `app/globals.css` | Global styles |
| `components/AuthProvider.tsx` | Auth wrapper |
| `components/ProtectedRoute.tsx` | Route guard |
| `components/SignInForm.tsx` | Sign-in form |
| `components/SignUpForm.tsx` | Sign-up form |
| `components/AuthButton.tsx` | Auth button |
| `app/api/auth/signin/route.ts` | Auth API |
| `app/api/auth/signup/route.ts` | Auth API |

---

## What to Delete

Delete every file **not** in the "keep" list above, except for the new files you create. Specifically delete:

**Pages:**
- `app/activities/page.tsx`
- `app/milestones/page.tsx`
- `app/trends/page.tsx`
- `app/page-new.tsx`
- `app/page.old.tsx`

**Components (all of these):**
- `components/ActivityHistory.tsx`
- `components/ActivityLogger.tsx`
- `components/EutrophicationRisk.tsx`
- `components/FarmSetupForm.tsx`
- `components/FeedHistoryForm.tsx`
- `components/FeedHistoryList.tsx`
- `components/GeneralRecommendations.tsx`
- `components/HexagonalRadarChart.tsx`
- `components/HistoricalTrendChart.tsx`
- `components/ImpactSummary.tsx`
- `components/MilestoneCard.tsx`
- `components/MilestoneDashboard.tsx`
- `components/MilestoneDisplay.tsx`
- `components/Navigation.tsx`
- `components/RecommendationsList.tsx`
- `components/SensorDataLogger.tsx`
- `components/SensorDataTable.tsx`
- `components/SpeciesForm.tsx`
- `components/SpeciesList.tsx`
- `components/SpeciesSuitabilityTab.tsx`
- `components/TrendAnalysis.tsx`
- `components/WaterQualityChart.tsx`
- `components/WQIBreakdown.tsx`
- `components/WQIGauge.tsx`

**Lib files:**
- `lib/baseline-calculator.ts`
- `lib/db-service.ts`
- `lib/eutrophication-risk.ts`
- `lib/milestone-calculator.ts`
- `lib/milestone-detector.ts`
- `lib/recommendation-rules.ts`
- `lib/recommendations.ts`
- `lib/sensor-data.ts`
- `lib/species-suggestions.ts`
- `lib/species-suitability-calculator.ts`
- `lib/species-suitability-config.ts`

**API routes:**
- `app/api/aquafarm/route.ts`
- `app/api/feed-history/route.ts`
- `app/api/milestones/route.ts`
- `app/api/recommendations/route.ts`
- `app/api/sensor-data/route.ts`
- `app/api/species/route.ts`
- `app/api/trends/route.ts`
- `app/api/wqi/route.ts`

---

## What to Modify

### 1. `types/index.ts` — Replace entirely

New types:

```typescript
export interface SensorReading {
  id?: string;
  farmId?: string;
  timestamp: string;
  dissolvedOxygen: number;   // mg/L — DO
  phosphorus: number;         // mg/L — Total Phosphorus
  nitrogen: number;           // mg/L — Total Nitrogen
  stockingDensity: number;    // fish/m³
  wqiScore?: number;
}

export interface WQIScore {
  overall: number;
  category: 'Excellent' | 'Good' | 'Moderate' | 'Poor';
  breakdown: WQIParameterBreakdown[];
  lastUpdated: string;
}

export interface WQIParameterBreakdown {
  parameter: string;
  value: number;
  subIndex: number;
  weight: number;
  contribution: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface StockingRecommendation {
  action: string;
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
  direction: 'reduce' | 'increase' | 'maintain';
  percentChange?: number;
}

export interface Farm {
  id: string;
  name: string;
  location?: string;
  imtaStartDate: string;
  createdAt: string;
  ownerId: string;
  initialStockingDensity: number; // fish/m³, rough estimate from onboarding
}
```

### 2. `lib/sensor-data-instant.ts` — Update converter

Update `convertToSensorReading` to map InstantDB record fields to the new `SensorReading` type (dissolvedOxygen, phosphorus, nitrogen, stockingDensity). Remove all old fields (temperature, ph, tss, salinity, ammonia, alkalinity).

### 3. `lib/instantdb-schema.ts` — Update schema

Add `initialStockingDensity` to the `farms` entity. Update `sensorReadings` entity to use the new 4 fields (dissolvedOxygen, phosphorus, nitrogen, stockingDensity). Remove old fields.

### 4. `app/onboarding/page.tsx` — Add stocking density field

Add a new field to the onboarding form:

```
Label: "Initial Stocking Density (rough estimate)"
Input: number, placeholder "e.g. 25"
Helper text: "Fish per cubic metre (m³) — a rough estimate is fine"
Required: yes
```

Save `initialStockingDensity` as a number to the `farms` record in InstantDB alongside the existing fields. Keep all other existing onboarding logic (auth check, farm exists check, redirect to `/`) unchanged.

### 5. `lib/wqi-config.ts` — Replace entirely

```typescript
export const WQI_WEIGHTS = {
  dissolvedOxygen: 0.50,
  phosphorus: 0.25,
  nitrogen: 0.25,
} as const;

export const WQI_CATEGORIES = {
  Excellent: { min: 90, max: 100, color: '#00C896' },
  Good:      { min: 70, max: 90,  color: '#3B82F6' },
  Moderate:  { min: 50, max: 70,  color: '#F59E0B' },
  Poor:      { min: 0,  max: 50,  color: '#EF4444' },
} as const;

export const PARAMETER_RANGES = {
  dissolvedOxygen: {
    excellent: { min: 5.0, max: 10.0 },
    good:      { min: 4.0, max: 5.0  },
    moderate:  { min: 3.0, max: 4.0  },
    poor:      { min: 0,   max: 3.0  },
  },
  phosphorus: {
    // Lower is better — inverted scale
    excellent: { min: 0,    max: 0.05 },
    good:      { min: 0.05, max: 0.10 },
    moderate:  { min: 0.10, max: 0.20 },
    poor:      { min: 0.20, max: 999  },
  },
  nitrogen: {
    // Lower is better — inverted scale
    excellent: { min: 0, max: 1.0 },
    good:      { min: 1.0, max: 2.0 },
    moderate:  { min: 2.0, max: 5.0 },
    poor:      { min: 5.0, max: 999 },
  },
} as const;
```

### 6. `lib/wqi-calculator.ts` — Replace entirely

Rewrite to work with only the 3 new parameters. The logic structure is the same as before (sub-index → weighted sum → category), but:
- Only calculate sub-indices for `dissolvedOxygen`, `phosphorus`, `nitrogen`
- For phosphorus and nitrogen: lower value = higher sub-index (inverted — the excellent range is the lowest values)
- Export `calculateWQI(reading: SensorReading): WQIScore`

---

## What to Create

### 7. `lib/stocking-recommendations.ts` — New file

```typescript
import { SensorReading, StockingRecommendation } from '@/types';

export function generateStockingRecommendations(
  reading: SensorReading
): StockingRecommendation[] {
  const { dissolvedOxygen: doVal, phosphorus, nitrogen, stockingDensity } = reading;
  const recs: StockingRecommendation[] = [];

  if (doVal < 3.0) {
    recs.push({ action: 'Reduce stocking density by ~30%', reason: 'Critically low dissolved oxygen — fish are likely stressed. Immediate reduction required.', priority: 'High', direction: 'reduce', percentChange: 30 });
  } else if (doVal < 4.0) {
    recs.push({ action: 'Reduce stocking density by ~15%', reason: 'Low dissolved oxygen. High stocking density is worsening oxygen depletion.', priority: 'High', direction: 'reduce', percentChange: 15 });
  }

  if (phosphorus > 0.2) {
    recs.push({ action: 'Reduce stocking density by ~20%', reason: 'High phosphorus indicates excess waste load. Reducing density will lower nutrient output.', priority: 'High', direction: 'reduce', percentChange: 20 });
  } else if (phosphorus > 0.1) {
    recs.push({ action: 'Reduce stocking density by ~10%', reason: 'Elevated phosphorus. A moderate density reduction will help restore water quality.', priority: 'Medium', direction: 'reduce', percentChange: 10 });
  }

  if (nitrogen > 5.0) {
    recs.push({ action: 'Reduce stocking density by ~20%', reason: 'High total nitrogen. Excess nitrogen from fish waste is accumulating.', priority: 'High', direction: 'reduce', percentChange: 20 });
  } else if (nitrogen > 2.0) {
    recs.push({ action: 'Reduce stocking density by ~10%', reason: 'Elevated nitrogen levels. A small reduction in density will ease the nutrient load.', priority: 'Medium', direction: 'reduce', percentChange: 10 });
  }

  if (recs.length === 0) {
    if (doVal >= 5.0 && phosphorus < 0.05 && nitrogen < 1.0) {
      recs.push({ action: 'Water quality is excellent. Consider increasing stocking density by up to 10%.', reason: 'All parameters are in the optimal range. There is headroom to increase density if desired.', priority: 'Low', direction: 'increase', percentChange: 10 });
    } else {
      recs.push({ action: 'Maintain current stocking density.', reason: 'Parameters are within acceptable range. Continue monitoring.', priority: 'Low', direction: 'maintain' });
    }
  }

  return recs;
}
```

### 8. `app/page.tsx` — Replace entirely (main dashboard)

This is the 3-tab dashboard shell. It should:

1. Be a `'use client'` component wrapped in `<ProtectedRoute>`
2. Query InstantDB for `sensorReadings` filtered by `farmId` (copy this pattern from the existing `page.tsx` before you delete it — it uses `db.useQuery`)
3. Compute `readings`, `latestReading` via `useMemo` (copy from existing `page.tsx`)
4. Calculate `wqi` using the new `calculateWQI` from `lib/wqi-calculator.ts`
5. Calculate `stockingRecs` using `generateStockingRecommendations` from `lib/stocking-recommendations.ts`
6. Render the WQI persistent header (always visible, matches the header in the HTML prototype)
7. Render 3 tab buttons: Risk / Stocking / Eco-label
8. Conditionally render `<RiskTab>`, `<StockingTab>`, or `<EcoLabelTab>` based on active tab

**Dark theme colour tokens** (use these as inline styles or Tailwind arbitrary values to match the prototype):
```
Background:         #071A2E
Card background:    #0D2440
Border:             #163455
Hover border:       #1E4A6E
Text muted:         #6B8FAF
Text body:          #CBD5E1
Text white:         #FFFFFF
Accent green:       #00C896
Accent amber:       #F59E0B
Accent red:         #EF4444
Accent blue:        #3B82F6
```

### 9. `components/tabs/RiskTab.tsx`

Convert Tab 1 from the HTML prototype into a React component. Wire to real data:

**Props:**
```typescript
interface RiskTabProps {
  latestReading: SensorReading | null;
  readings: SensorReading[];
  wqi: WQIScore | null;
  farmId: string;
}
```

**Sections to implement (in order, matching the HTML):**
1. **Farm summary card** — farm name, IMTA start date (use `useFarm()` hook)
2. **Eutrophication risk card** — derive risk level from phosphorus + nitrogen values:
   - High: phosphorus > 0.2 OR nitrogen > 5
   - Moderate: phosphorus > 0.1 OR nitrogen > 2
   - Low: otherwise
   - Show the risk bar and thumb positioned accordingly
3. **Parameters grid** — 3 rows: Dissolved Oxygen (mg/L), Phosphorus (mg/L), Nitrogen (mg/L). For each row show: current value, status label (Optimal/Elevated/Critical), and a progress bar coloured green/amber/red
4. **Manual entry form** — 4 inputs: DO, Phosphorus, Nitrogen, Stocking Density. On submit, call `db.transact` to write a new `sensorReadings` record with the farm's ID and current timestamp (use `id()` from InstantDB)
5. **Readings history list** — last 5 entries from `readings`, showing timestamp and the 3 values
6. **Alerts section** — generate alerts based on `wqi` and latest reading: show a danger alert if any parameter is in the poor range, show a success alert if WQI ≥ 90

### 10. `components/tabs/StockingTab.tsx`

Convert Tab 2 from the HTML prototype into a React component. Wire to real data:

**Props:**
```typescript
interface StockingTabProps {
  latestReading: SensorReading | null;
  recommendations: StockingRecommendation[];
  initialStockingDensity: number;
}
```

**Sections to implement:**
1. **Stats row** — 4 stat cards: Current Stocking Density (from latestReading.stockingDensity), Initial Density (from farm.initialStockingDensity), DO (from latestReading), Phosphorus+Nitrogen combined status
2. **Analysis grid** — left column: show each of the 3 parameters with a bar visualising where the value sits within the risk range; right column: the stocking recommendations list from `recommendations` prop
3. Style matches the `.s2-panel`, `.trophic-card`, `.stats-row`, `.analysis-grid` CSS in the HTML prototype

### 11. `components/tabs/EcoLabelTab.tsx`

Convert Tab 3 from the HTML prototype into a React component. **This tab is static UI only — no backend wiring needed.** Convert the HTML exactly as-is, with hardcoded data. Use the same structure, colours, and layout from the prototype.

Includes:
- Discover panel (toggleable, shows ASC/GlobalG.A.P./Friend of the Sea cards)
- Active labels row (ASC + GlobalG.A.P. chips + "Add label" chip)
- Overall progress bar
- Two-column layout: Certification Journey (step list) + Financial Return card

---

## Final File Structure

After the rebuild, the relevant files should be:

```
app/
  layout.tsx                    (unchanged)
  globals.css                   (unchanged)
  page.tsx                      (new — 3-tab dashboard shell)
  auth/page.tsx                 (unchanged)
  signin/page.tsx               (unchanged)
  signup/page.tsx               (unchanged)
  onboarding/page.tsx           (modified — add stocking density field)
  api/auth/signin/route.ts      (unchanged)
  api/auth/signup/route.ts      (unchanged)

components/
  AuthButton.tsx                (unchanged)
  AuthProvider.tsx              (unchanged)
  ProtectedRoute.tsx            (unchanged)
  SignInForm.tsx                 (unchanged)
  SignUpForm.tsx                 (unchanged)
  tabs/
    RiskTab.tsx                 (new)
    StockingTab.tsx             (new)
    EcoLabelTab.tsx             (new)

lib/
  instant.ts                    (unchanged)
  instantdb.ts                  (unchanged)
  instantdb-schema.ts           (modified — new fields)
  farm-context.tsx              (unchanged)
  auth-context.tsx              (unchanged)
  auth-helper.ts                (unchanged)
  sensor-data-instant.ts        (modified — new fields)
  wqi-calculator.ts             (replaced)
  wqi-config.ts                 (replaced)
  stocking-recommendations.ts   (new)

types/
  index.ts                      (replaced)
```

---

## Implementation Order

Follow this order to avoid broken imports at each step:

1. Update `types/index.ts`
2. Replace `lib/wqi-config.ts`
3. Replace `lib/wqi-calculator.ts`
4. Create `lib/stocking-recommendations.ts`
5. Update `lib/instantdb-schema.ts`
6. Update `lib/sensor-data-instant.ts`
7. Update `app/onboarding/page.tsx`
8. Delete all the files listed in the "What to Delete" section
9. Create `components/tabs/EcoLabelTab.tsx` (static, easiest)
10. Create `components/tabs/RiskTab.tsx`
11. Create `components/tabs/StockingTab.tsx`
12. Replace `app/page.tsx` with the new dashboard shell
13. Run `npm run build` and fix any TypeScript errors
