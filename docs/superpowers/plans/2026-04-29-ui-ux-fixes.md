# UI/UX Fixes — Data Consistency & Audit Issues

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all critical data inconsistencies, replace WQI with eutrophication risk score, wire CCI to live data, remove onboarding form, and address high-priority UI issues from the audit.

**Architecture:** Option B (struggling farm narrative). Demo values: DO=5 mg/L, P=0.175 mg/L, N=0.4 mg/L. These produce eutrophication composite=42 (CRITICAL RISK) and CCI=44.3% (below ASC 48% threshold) — consistent across all tabs. The CCI disconnect is fixed by computing it from live sensor scores instead of static history.

**Tech Stack:** Next.js 14 (App Router), React, TypeScript, InstantDB, inline styles (no CSS modules), date-fns

---

## Demo Values Reference (lock these in everywhere)

| Parameter | Value | Score | Status |
|-----------|-------|-------|--------|
| DO | 5 mg/L | 63/100 | Moderate stress |
| Phosphorus (P) | 0.175 mg/L | 13/100 | Hyper-eutrophic |
| Nitrogen (N) | 0.4 mg/L | 60/100 | Mesotrophic |
| Stocking density | 4 fish/m³ | — | — |
| Eutrophication composite | — | **42/100** | CRITICAL RISK |
| CCI | — | **44.3%** | Below ASC threshold (48%) |

Farm: **"Barangay Lucap IMTA Site"** · Location: **"Lingayen Gulf, Philippines"** · IMTA start: **2026-04-01**

---

## File Map

| File | Change |
|------|--------|
| `app/page.tsx` | Replace WQI header with eutrophication risk score; compute composite; remove wqi from header |
| `app/onboarding/page.tsx` | Remove form — auto-create demo farm + seed initial reading silently, then redirect |
| `lib/cci-data.ts` | Rewrite 6-month history with declining trend (Apr–Oct 2025, historical); update LATEST_READING |
| `lib/eco-label-scoring.ts` | Replace `wqiScore` criteria with eutrophication composite score; import score functions |
| `components/tabs/EcoLabelTab.tsx` | Pass `latestReading` to CCIEligibilityWidget; compute CCI from live scores |
| `components/tabs/StockingTab.tsx` | Fix hardcoded DO 4.2 → use `latestReading.dissolvedOxygen` |
| `components/tabs/RiskTab.tsx` | Move Alerts to top; fix trend chart label to "Historical — Apr to Oct 2025"; fix "ghost arc" label; remove WQI reference in alerts |
| `components/AuthButton.tsx` | De-emphasize Sign Out (small text link, not primary button) |

---

## Task 1 — Fix Stocking Tab Hardcoded DO Value

**Files:**
- Modify: `components/tabs/StockingTab.tsx` (line ~293–296)

The Stocking tab hardcodes DO as `4.2` in the stats row. It must use `latestReading.dissolvedOxygen` to match the Eutrophication tab.

- [ ] **Step 1: Find all hardcoded water quality values in StockingTab**

Search for hardcoded 4.2 at line ~293. The component receives `latestReading` as a prop.

- [ ] **Step 2: Replace hardcoded DO stat card with live value**

Find this block (around line 292–297):
```tsx
<div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, marginBottom: 2, color: '#EF4444' }}>4.2</div>
<div style={{ fontSize: 10, color: '#8BA3B8' }}>mg/L — DO</div>
<div style={{ fontSize: 9, color: '#6B8FAF', marginTop: 1 }}>Target ≥ 6.0</div>
{paramBar(4.2, 10, '#EF4444')}
<span style={{ display: 'inline-block', fontSize: 9, padding: '2px 6px', borderRadius: 5, marginTop: 2, fontWeight: 600, background: '#EF444422', color: '#EF4444' }}>Critical</span>
```

Replace with (note: the component must receive `latestReading` — check the function signature, it already receives it as a prop):
```tsx
<div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, marginBottom: 2, color: '#EF4444' }}>
  {latestReading?.dissolvedOxygen ?? 5}
</div>
<div style={{ fontSize: 10, color: '#8BA3B8' }}>mg/L — DO</div>
<div style={{ fontSize: 9, color: '#6B8FAF', marginTop: 1 }}>Target ≥ 6.0</div>
{paramBar(latestReading?.dissolvedOxygen ?? 5, 10, '#EF4444')}
<span style={{ display: 'inline-block', fontSize: 9, padding: '2px 6px', borderRadius: 5, marginTop: 2, fontWeight: 600, background: '#EF444422', color: '#EF4444' }}>Critical</span>
```

- [ ] **Step 3: Verify in browser**

Open Stocking tab. DO stat card should now show **5 mg/L** (same as Eutrophication tab). Status "Critical" remains appropriate since 5 < 6.

- [ ] **Step 4: Commit**

```bash
git add components/tabs/StockingTab.tsx
git commit -m "fix: use live DO reading in Stocking tab stat card instead of hardcoded 4.2"
```

---

## Task 2 — Fix CCI Widget to Use Live Sensor Data

**Files:**
- Modify: `components/tabs/EcoLabelTab.tsx`

Currently `CCIEligibilityWidget` is a zero-prop component that reads `LATEST_READING` from the static `cci-data.ts` (nScore=58, pScore=24, doScore=78 → CCI=51.1%, above threshold). It must instead use the live sensor reading scores.

With live values (DO=5, P=0.175, N=0.4):
- nScore=60, pScore=13, doScore=63
- CCI = 0.40×60 + 0.35×13 + 0.25×63 = 24.0 + 4.6 + 15.8 = **44.4%** → Below ASC threshold ✓

- [ ] **Step 1: Add props to CCIEligibilityWidget**

Find the `CCIEligibilityWidget` function definition (around line 31). Change its signature from:
```tsx
function CCIEligibilityWidget() {
  const { nScore, pScore, doScore } = LATEST_READING;
```
To:
```tsx
interface CCIWidgetProps {
  nScore: number;
  pScore: number;
  doScore: number;
}

function CCIEligibilityWidget({ nScore, pScore, doScore }: CCIWidgetProps) {
```

- [ ] **Step 2: Remove the LATEST_READING import from EcoLabelTab**

Find the import line:
```tsx
import { LATEST_READING } from '@/lib/cci-data';
```
Delete it entirely. (The import may also pull in other things — check if `SIX_MONTH_HISTORY` is imported separately for the trend chart in RiskTab, not EcoLabelTab.)

- [ ] **Step 3: Compute live scores in the parent EcoLabelTab component**

At the top of the `EcoLabelTab` function body, add:
```tsx
import { nMgLToScore, pMgLToScore, doMgLToScore } from '@/lib/cci-calculator';

// inside EcoLabelTab function, before the return:
const liveNScore  = latestReading ? nMgLToScore(latestReading.nitrogen)         : 0;
const livePScore  = latestReading ? pMgLToScore(latestReading.phosphorus)       : 0;
const liveDOScore = latestReading ? doMgLToScore(latestReading.dissolvedOxygen) : 0;
```

- [ ] **Step 4: Pass live scores to CCIEligibilityWidget**

Find where `CCIEligibilityWidget` is rendered (search for `<CCIEligibilityWidget`). Change:
```tsx
<CCIEligibilityWidget />
```
To:
```tsx
<CCIEligibilityWidget nScore={liveNScore} pScore={livePScore} doScore={liveDOScore} />
```

- [ ] **Step 5: Verify in browser**

Open Eco-label tab. The CCI widget should now show:
- N: 40% × 60 = 24.0
- P: 35% × 13 = 4.6
- DO: 25% × 63 = 15.8
- Total: **44.4%**
- Badge: "Below ASC Threshold" (red/amber, no green border)

- [ ] **Step 6: Commit**

```bash
git add components/tabs/EcoLabelTab.tsx
git commit -m "fix: CCI widget now uses live sensor scores instead of static history — CCI 44.4% correctly below ASC 48% threshold"
```

---

## Task 3 — Replace WQI Header with Eutrophication Risk Score

**Files:**
- Modify: `app/page.tsx`

The persistent header shows "Overall Water Quality Index" with `wqi.overall` (87.5) and a "Good" badge. Replace with the eutrophication composite risk score (42) and "Critical Risk" badge.

- [ ] **Step 1: Add eutrophication score calculation to page.tsx**

Add these imports at the top of `app/page.tsx`:
```tsx
import { nMgLToScore, pMgLToScore, doMgLToScore, EUTROPHICATION_WEIGHTS, getTrophicRiskLabel, getTrophicState, getTrophicColor } from '@/lib/cci-calculator';
```

Inside `DashboardContent`, after the `wqi` useMemo, add:
```tsx
const eutrScore = useMemo(() => {
  if (!latestReading) return null;
  const nScore  = nMgLToScore(latestReading.nitrogen);
  const pScore  = pMgLToScore(latestReading.phosphorus);
  const doScore = doMgLToScore(latestReading.dissolvedOxygen);
  const composite = Math.round(
    EUTROPHICATION_WEIGHTS.p * pScore +
    EUTROPHICATION_WEIGHTS.n * nScore +
    EUTROPHICATION_WEIGHTS.do * doScore,
  );
  const trophicState = getTrophicState(nScore, pScore);
  return {
    composite,
    trophicState,
    color: getTrophicColor(trophicState),
    riskLabel: getTrophicRiskLabel(trophicState),
  };
}, [latestReading]);
```

- [ ] **Step 2: Replace header label and score display**

Find the header div in `DashboardContent` (the WQI persistent header, around line 86). Replace:
```tsx
<div style={{ color: MUTED, fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 3 }}>Overall Water Quality Index</div>
<div style={{ color: wqi ? wqiColor(wqi.overall) : MUTED, fontSize: 28, fontWeight: 700 }}>
  {wqi ? wqi.overall : '—'} <span style={{ fontSize: 13, color: MUTED, fontWeight: 400 }}>/ 100</span>
</div>
```
With:
```tsx
<div style={{ color: MUTED, fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 3 }}>Eutrophication Risk Score</div>
<div style={{ color: eutrScore ? eutrScore.color : MUTED, fontSize: 28, fontWeight: 700 }}>
  {eutrScore ? eutrScore.composite : '—'} <span style={{ fontSize: 13, color: MUTED, fontWeight: 400 }}>/ 100</span>
</div>
```

- [ ] **Step 3: Replace the "Good" badge with risk level badge**

Find the badge that shows `wqi.category`:
```tsx
{wqi && (
  <div style={{ background: '#0A3320', borderRadius: 8, padding: '7px 14px', border: `1px solid ${GREEN}` }}>
    <span style={{ color: GREEN, fontSize: 13, fontWeight: 600 }}>{wqi.category}</span>
  </div>
)}
```
Replace with:
```tsx
{eutrScore && (
  <div style={{ background: eutrScore.color + '22', borderRadius: 8, padding: '7px 14px', border: `1px solid ${eutrScore.color}` }}>
    <span style={{ color: eutrScore.color, fontSize: 13, fontWeight: 600 }}>{eutrScore.trophicState}</span>
  </div>
)}
```

- [ ] **Step 4: Remove wqiColor function and unused wqi import in header context**

The `wqiColor` function (lines 28–33) is no longer used in the header. Delete it.
The `wqi` prop is still passed to RiskTab and EcoLabelTab — keep those.

- [ ] **Step 5: Verify in browser**

Header should now show:
- Label: "EUTROPHICATION RISK SCORE"
- Score: **42 / 100** (in red)
- Badge: **"Hyper-eutrophic"** (red border)

This matches what RiskTab shows. No more contradiction between header and tab content.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx
git commit -m "fix: replace WQI header with eutrophication risk score — header now shows 42/100 Hyper-eutrophic consistent with risk tab"
```

---

## Task 4 — Update Eco-label Criteria: Replace WQI with Eutrophication Score

**Files:**
- Modify: `lib/eco-label-scoring.ts`

Currently three criteria reference `wqiScore`. These must be replaced with the eutrophication composite score so the failing farm correctly fails eco-label criteria.

With eutrophication composite = 42:
- ASC "Eutrophication Score ≥ 55" → NOT MET (42 < 55) ✓
- GlobalG.A.P. "Eutrophication Score ≥ 45" → NOT MET (42 < 45) ✓
- Friend of the Sea "Eutrophication Score ≥ 65" → NOT MET (42 < 65) ✓

- [ ] **Step 1: Add eutrophication score imports and parameter to scoreEcoLabels**

At top of `lib/eco-label-scoring.ts`, add:
```ts
import { nMgLToScore, pMgLToScore, doMgLToScore, EUTROPHICATION_WEIGHTS } from './cci-calculator';
```

Change the function signature from:
```ts
export function scoreEcoLabels(
  reading: SensorReading | null,
  wqi: WQIScore | null,
  farm: Farm,
): LabelScore[]
```
To:
```ts
export function scoreEcoLabels(
  reading: SensorReading | null,
  farm: Farm,
): LabelScore[]
```

Inside the function body, add after the existing destructuring:
```ts
const eutrComposite = (() => {
  if (!reading) return 0;
  const nScore  = nMgLToScore(reading.nitrogen);
  const pScore  = pMgLToScore(reading.phosphorus);
  const doScore = doMgLToScore(reading.dissolvedOxygen);
  return Math.round(
    EUTROPHICATION_WEIGHTS.p * pScore +
    EUTROPHICATION_WEIGHTS.n * nScore +
    EUTROPHICATION_WEIGHTS.do * doScore,
  );
})();
```

Remove the `const wqiScore = wqi?.overall ?? 0;` line.

- [ ] **Step 2: Replace ASC "Water Quality Baseline" criterion**

Find:
```ts
{
  name: 'Water Quality Baseline',
  met: wqiScore >= 70,
  detail: wqiScore >= 70
    ? `WQI ${wqiScore} ≥ 70 — sustained baseline confirmed`
    : `WQI ${wqiScore} below required 70`,
},
```
Replace with:
```ts
{
  name: 'Eutrophication Score ≥ 55',
  met: eutrComposite >= 55,
  detail: eutrComposite >= 55
    ? `Eutrophication score ${eutrComposite} — low-to-medium risk confirmed`
    : `Eutrophication score ${eutrComposite} — below required 55 (current: Critical Risk)`,
},
```

- [ ] **Step 3: Replace GlobalG.A.P. "WQI ≥ 60" criterion**

Find:
```ts
{
  name: 'WQI ≥ 60',
  met: wqiScore >= 60,
  detail: wqiScore >= 60
    ? `WQI ${wqiScore} meets minimum`
    : `WQI ${wqiScore} below required 60`,
},
```
Replace with:
```ts
{
  name: 'Eutrophication Score ≥ 45',
  met: eutrComposite >= 45,
  detail: eutrComposite >= 45
    ? `Eutrophication score ${eutrComposite} — meets minimum threshold`
    : `Eutrophication score ${eutrComposite} — below required 45`,
},
```

- [ ] **Step 4: Replace Friend of the Sea "WQI ≥ 80" criterion**

Find:
```ts
{
  name: 'WQI ≥ 80',
  met: wqiScore >= 80,
  detail: wqiScore >= 80
    ? `WQI ${wqiScore} meets high standard`
    : `WQI ${wqiScore} below required 80`,
},
```
Replace with:
```ts
{
  name: 'Eutrophication Score ≥ 65',
  met: eutrComposite >= 65,
  detail: eutrComposite >= 65
    ? `Eutrophication score ${eutrComposite} — meets high standard`
    : `Eutrophication score ${eutrComposite} — below required 65 (high-standard farms only)`,
},
```

- [ ] **Step 5: Fix the call site in EcoLabelTab.tsx**

Find in `components/tabs/EcoLabelTab.tsx` where `scoreEcoLabels` is called:
```tsx
const labels = useMemo(() => scoreEcoLabels(latestReading, wqi, farm), [latestReading, wqi, farm]);
```
Change to:
```tsx
const labels = useMemo(() => scoreEcoLabels(latestReading, farm), [latestReading, farm]);
```

Also remove `wqi` from the `Props` interface and from EcoLabelTab's prop destructuring if it is no longer needed elsewhere in that file. (Check first — `wqi` may still be used for something else in EcoLabelTab. If not, remove it from Props and the parent call in `app/page.tsx`.)

- [ ] **Step 6: Verify in browser**

Open Eco-label tab. ASC should now show ~2/6 criteria met (~33%). GlobalG.A.P. ~3/7 (~43%). Friend of the Sea ~2/5 (~40%). All eutrophication-based criteria show as failing. "Certification Journey" for ASC should show "Eutrophication Score ≥ 55" as In Progress (not Activated).

- [ ] **Step 7: Commit**

```bash
git add lib/eco-label-scoring.ts components/tabs/EcoLabelTab.tsx
git commit -m "fix: eco-label criteria now use eutrophication composite score instead of WQI — failing farm correctly fails certification criteria"
```

---

## Task 5 — Update 6-Month History Data (Historical Label + Declining Trend)

**Files:**
- Modify: `lib/cci-data.ts`
- Modify: `components/tabs/RiskTab.tsx` (chart title label only)

The chart title currently says "6-Month Trend — Apr to Oct (Weekly)" — ambiguous about which year. Data must clearly be historical (Apr–Oct 2025). The trend should show gradual deterioration, ending close to current crisis values.

Target end values (Oct 2025, consistent with the crisis that has worsened by Apr 2026):
- nScore: 62 (from ~65 in Apr 2025)
- pScore: 18 (from ~32 in Apr 2025 — P declining most sharply)
- doScore: 65 (from ~73 in Apr 2025)

- [ ] **Step 1: Replace SIX_MONTH_HISTORY in cci-data.ts**

Replace the entire `SIX_MONTH_HISTORY` array with:
```ts
export const SIX_MONTH_HISTORY: WeeklyReading[] = [
  { week: 1,  date: '2025-04-07', label: 'Apr 7',  nScore: 65, pScore: 32, doScore: 73 },
  { week: 2,  date: '2025-04-14', label: 'Apr 14', nScore: 65, pScore: 31, doScore: 73 },
  { week: 3,  date: '2025-04-21', label: 'Apr 21', nScore: 64, pScore: 30, doScore: 72 },
  { week: 4,  date: '2025-04-28', label: 'Apr 28', nScore: 64, pScore: 29, doScore: 72 },
  { week: 5,  date: '2025-05-05', label: 'May 5',  nScore: 64, pScore: 28, doScore: 72 },
  { week: 6,  date: '2025-05-12', label: 'May 12', nScore: 63, pScore: 27, doScore: 71 },
  { week: 7,  date: '2025-05-19', label: 'May 19', nScore: 63, pScore: 27, doScore: 71 },
  { week: 8,  date: '2025-05-26', label: 'May 26', nScore: 63, pScore: 26, doScore: 70 },
  { week: 9,  date: '2025-06-02', label: 'Jun 2',  nScore: 63, pScore: 25, doScore: 70 },
  { week: 10, date: '2025-06-09', label: 'Jun 9',  nScore: 63, pScore: 25, doScore: 70 },
  { week: 11, date: '2025-06-16', label: 'Jun 16', nScore: 63, pScore: 24, doScore: 69 },
  { week: 12, date: '2025-06-23', label: 'Jun 23', nScore: 62, pScore: 24, doScore: 69 },
  { week: 13, date: '2025-06-30', label: 'Jun 30', nScore: 62, pScore: 23, doScore: 68 },
  { week: 14, date: '2025-07-07', label: 'Jul 7',  nScore: 62, pScore: 23, doScore: 68 },
  { week: 15, date: '2025-07-14', label: 'Jul 14', nScore: 62, pScore: 22, doScore: 68 },
  { week: 16, date: '2025-07-21', label: 'Jul 21', nScore: 62, pScore: 22, doScore: 67 },
  { week: 17, date: '2025-07-28', label: 'Jul 28', nScore: 62, pScore: 21, doScore: 67 },
  { week: 18, date: '2025-08-04', label: 'Aug 4',  nScore: 62, pScore: 21, doScore: 67 },
  { week: 19, date: '2025-08-11', label: 'Aug 11', nScore: 62, pScore: 20, doScore: 66 },
  { week: 20, date: '2025-08-18', label: 'Aug 18', nScore: 62, pScore: 20, doScore: 66 },
  { week: 21, date: '2025-08-25', label: 'Aug 25', nScore: 62, pScore: 19, doScore: 66 },
  { week: 22, date: '2025-09-01', label: 'Sep 1',  nScore: 62, pScore: 19, doScore: 66 },
  { week: 23, date: '2025-09-08', label: 'Sep 8',  nScore: 62, pScore: 19, doScore: 65 },
  { week: 24, date: '2025-09-15', label: 'Sep 15', nScore: 62, pScore: 18, doScore: 65 },
  { week: 25, date: '2025-09-22', label: 'Sep 22', nScore: 62, pScore: 18, doScore: 65 },
  { week: 26, date: '2025-10-06', label: 'Oct 6',  nScore: 62, pScore: 18, doScore: 65 },
];
```

This tells the story: P score declining from 32 → 18 (steady phosphorus accumulation), DO declining from 73 → 65, N stable. The farm was borderline passing CCI in April (CCI ≈ 0.40×65+0.35×32+0.25×73 = 26+11.2+18.25 = 55.45%) and by October had deteriorated to below threshold (CCI ≈ 0.40×62+0.35×18+0.25×65 = 24.8+6.3+16.25 = 47.35%).

- [ ] **Step 2: Update LATEST_READING to match Oct 2025 end values**

```ts
export const LATEST_READING = SIX_MONTH_HISTORY[SIX_MONTH_HISTORY.length - 1];
```
This line stays as-is — it will automatically reflect the new last row (nScore=62, pScore=18, doScore=65).

- [ ] **Step 3: Update chart title in RiskTab.tsx**

Find in `components/tabs/RiskTab.tsx` inside `SixMonthTrendChart`:
```tsx
<div style={{ color: '#6B8FAF', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>
  6-Month Trend — Apr to Oct (Weekly)
</div>
```
Replace with:
```tsx
<div style={{ color: '#6B8FAF', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>
  Historical Trend — Apr to Oct 2025 (Weekly)
</div>
```

- [ ] **Step 4: Verify in browser**

Open Eutrophication tab → scroll to trend chart. Title reads "Historical Trend — Apr to Oct 2025 (Weekly)". P score line should show a clear downward slope. DO line slightly declining. N line nearly flat.

- [ ] **Step 5: Commit**

```bash
git add lib/cci-data.ts components/tabs/RiskTab.tsx
git commit -m "fix: 6-month history now shows declining historical trend (Apr-Oct 2025) with chart labelled as historical"
```

---

## Task 6 — Remove Onboarding Form: Auto-Seed Demo Farm

**Files:**
- Modify: `app/onboarding/page.tsx`

Currently onboarding shows a form asking for farm name, location, IMTA date, stocking density. For the prototype, this form is removed. Instead, when a new user lands on onboarding, the demo farm is created silently and the user is sent straight to the dashboard.

Demo farm values:
- name: `"Barangay Lucap IMTA Site"`
- location: `"Lingayen Gulf, Philippines"`
- imtaStartDate: `new Date('2026-04-01').getTime()` (1 April 2026)
- initialStockingDensity: `4`

After creating the farm, also seed one initial sensor reading with the demo values (DO=5, P=0.175, N=0.4, stocking=4) so the dashboard has data immediately.

- [ ] **Step 1: Replace onboarding/page.tsx with auto-seed version**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, id } from '@/lib/instant';

const DEMO_FARM = {
  name: 'Barangay Lucap IMTA Site',
  location: 'Lingayen Gulf, Philippines',
  imtaStartDate: new Date('2026-04-01').getTime(),
  initialStockingDensity: 4,
};

const DEMO_READING = {
  dissolvedOxygen: 5,
  phosphorus: 0.175,
  nitrogen: 0.4,
  stockingDensity: 4,
};

export default function OnboardingPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const { isLoading: authLoading, user } = db.useAuth();

  const farmQuery = user ? { farms: { $: { where: { ownerId: user.id } } } } : null;
  const { data: farmData, isLoading: farmLoading } = db.useQuery(farmQuery as any) as {
    data?: { farms?: any[] };
    isLoading: boolean;
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }
    if (farmData?.farms && farmData.farms.length > 0) {
      router.push('/');
      return;
    }
    if (!user || farmLoading || farmData === undefined) return;

    // No farm exists — auto-create demo farm + seed reading
    const farmId = id();
    const readingId = id();
    db.transact([
      (db.tx as any).farms[farmId].update({
        ...DEMO_FARM,
        createdAt: Date.now(),
        ownerId: user.id,
      }),
      (db.tx as any).sensorReadings[readingId].update({
        farmId,
        timestamp: Date.now(),
        ...DEMO_READING,
        wqiScore: 0,
      }),
    ])
      .then(() => router.push('/'))
      .catch((err: any) => setError(err.message || 'Failed to set up demo farm.'));
  }, [user, authLoading, farmData, farmLoading, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button onClick={() => router.push('/auth')} className="mt-4 text-blue-600 underline text-sm">
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 text-sm">Setting up your dashboard…</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the flow**

Sign out, sign back in with the magic code. After auth, should see a brief spinner ("Setting up your dashboard…") then land directly on the dashboard showing "Barangay Lucap IMTA Site · Lingayen Gulf, Philippines · IMTA since Apr 2026" in Farm Summary — no form shown.

**Note:** If you already have a farm in the DB from previous testing, the `farmData.farms.length > 0` check will skip creation and redirect immediately to the dashboard. If you need to test the auto-create flow, sign in with a fresh email.

- [ ] **Step 3: Commit**

```bash
git add app/onboarding/page.tsx
git commit -m "fix: remove onboarding form — auto-create demo farm and seed initial reading on first sign-in"
```

---

## Task 7 — Move Alerts to Top of Eutrophication Tab

**Files:**
- Modify: `components/tabs/RiskTab.tsx`

Currently Alerts are at the bottom of RiskTab (after trend chart and circularity widgets). Critical alerts must appear at the top — right after Farm Summary, before the Eutrophication Risk section. This is the highest-priority UX fix from the audit.

- [ ] **Step 1: Extract the Alerts JSX block**

In `components/tabs/RiskTab.tsx`, find the Alerts section (around line 513–540):
```tsx
{/* Alerts */}
<div>
  <div style={{ color: '#6B8FAF', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>Alerts</div>
  {dangerAlerts.map((a) => ( ... ))}
  ...
</div>
```

Cut this entire block.

- [ ] **Step 2: Paste Alerts immediately after Farm Summary**

Find the Farm Summary card (around line 374). Paste the Alerts block immediately after its closing `</div>` tag, so the order becomes:

1. Farm Summary card
2. **Alerts** ← moved here
3. Eutrophication Risk card
4. Parameters section
5. Manual Entry
6. Trend chart
7. Circularity widgets

- [ ] **Step 3: Only show alerts block if there are dangerAlerts (clean up the no-alerts states)**

When alerts are at the top, only show the block if there are actual danger alerts. The green "✓ No Critical Alerts" and "✓ DO Levels Normal" positive messages can be removed entirely — they are noise when there are real alerts. Remove those two green "all good" blocks from the JSX.

- [ ] **Step 4: Verify in browser**

Open Eutrophication tab. The first things visible below Farm Summary should be the red alert cards (Phosphorus Elevated, Low DO). Users see the problem immediately on page load.

- [ ] **Step 5: Commit**

```bash
git add components/tabs/RiskTab.tsx
git commit -m "fix: move critical alerts to top of Eutrophication tab so users see warnings immediately"
```

---

## Task 8 — UI Polish: Sign Out Button, Ghost Arc Label

**Files:**
- Modify: `components/AuthButton.tsx`
- Modify: `components/tabs/RiskTab.tsx`

### 8a: De-emphasize Sign Out button

- [ ] **Step 1: Read AuthButton.tsx**

```bash
cat components/AuthButton.tsx
```

- [ ] **Step 2: Change Sign Out from primary button to small text link**

Find the Sign Out button. Change from whatever primary button style it has to:
```tsx
<button
  onClick={handleSignOut}
  style={{
    background: 'transparent',
    border: 'none',
    color: '#6B8FAF',
    fontSize: 11,
    cursor: 'pointer',
    padding: '4px 8px',
    textDecoration: 'underline',
  }}
>
  Sign Out
</button>
```

### 8b: Fix "ghost arc" label

- [ ] **Step 3: Update circularity widget subtitle in RiskTab.tsx**

Find:
```tsx
Parameter Circularity — weighted 0-100 · ghost arc = next target
```
Replace with:
```tsx
Parameter Scores — weighted 0-100 · faded arc = improvement target
```

- [ ] **Step 4: Verify in browser**

Header area: Sign Out should be a small grey underlined link, not a big white button.
Eutrophication tab: circularity subtitle reads "Parameter Scores — weighted 0-100 · faded arc = improvement target".

- [ ] **Step 5: Commit**

```bash
git add components/AuthButton.tsx components/tabs/RiskTab.tsx
git commit -m "fix: de-emphasize Sign Out button; clarify circularity widget subtitle"
```

---

## Self-Review

### Spec Coverage

| Audit finding | Task |
|---|---|
| DO value 5 vs 4.2 across tabs | Task 1 |
| CCI 51.1% contradicts HIGH RISK | Task 2 |
| WQI "Good" 87.5 vs risk score 42 | Task 3 |
| Eco-label criteria reference WQI | Task 4 |
| 6-month chart labelled ambiguously / future data | Task 5 |
| Onboarding form shown to new users | Task 6 |
| Alerts buried at bottom | Task 7 |
| Sign Out too prominent | Task 8a |
| "Ghost arc" jargon | Task 8b |

### Intentionally deferred (not in scope)
- DO criterion label in eco-label (issue #6 — user said ignore)
- Daily N Budget math (stocking tab case study — case study specific, not a code bug)
- Mobile responsiveness
- Tooltips / glossary
- Favicon 404

### Type consistency check
- `scoreEcoLabels` signature change (remove `wqi` param) must be updated at the call site in `EcoLabelTab.tsx` (covered in Task 4, Step 5)
- `CCIEligibilityWidget` now requires `nScore`, `pScore`, `doScore` props — covered in Task 2
- `eutrScore` object in `page.tsx` contains `composite`, `trophicState`, `color`, `riskLabel` — all used in Task 3 replacements
