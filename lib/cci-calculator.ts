// lib/cci-calculator.ts

export const CCI_WEIGHTS = { n: 0.40, p: 0.35, do: 0.25 } as const;
export const ASC_THRESHOLD = 48;

export interface CCIResult {
  nComponent: number;   // 0.40 × nScore
  pComponent: number;   // 0.35 × pScore
  doComponent: number;  // 0.25 × doScore
  total: number;        // sum, rounded to 1 decimal
  exceedsASC: boolean;
}

export function calculateCCI(nScore: number, pScore: number, doScore: number): CCIResult {
  const nComponent  = parseFloat((CCI_WEIGHTS.n  * nScore).toFixed(1));
  const pComponent  = parseFloat((CCI_WEIGHTS.p  * pScore).toFixed(1));
  const doComponent = parseFloat((CCI_WEIGHTS.do * doScore).toFixed(1));
  const total       = parseFloat((nComponent + pComponent + doComponent).toFixed(1));
  return { nComponent, pComponent, doComponent, total, exceedsASC: total > ASC_THRESHOLD };
}

export type TrophicState = 'Oligotrophic' | 'Mesotrophic' | 'Eutrophic' | 'Hyper-eutrophic';

// N and P scores are 0-100 "goodness" (higher = less eutrophic)
export function getTrophicState(nScore: number, pScore: number): TrophicState {
  const nState = nScore >= 70 ? 'Oligotrophic' : nScore >= 50 ? 'Mesotrophic' : nScore >= 30 ? 'Eutrophic' : 'Hyper-eutrophic';
  const pState = pScore >= 66 ? 'Oligotrophic' : pScore >= 45 ? 'Mesotrophic' : pScore >= 20 ? 'Eutrophic' : 'Hyper-eutrophic';
  const order: TrophicState[] = ['Oligotrophic', 'Mesotrophic', 'Eutrophic', 'Hyper-eutrophic'];
  return order[Math.max(order.indexOf(nState), order.indexOf(pState))];
}

export function getTrophicColor(state: TrophicState): string {
  if (state === 'Oligotrophic')    return '#00C896';
  if (state === 'Mesotrophic')     return '#3B82F6';
  if (state === 'Eutrophic')       return '#F59E0B';
  return '#EF4444';
}

export type DOStatus = 'Normal' | 'Moderate stress' | 'Hypoxic' | 'Anoxic';

// DO score 0-100 where higher = better (more oxygen)
export function getDOStatus(doScore: number): DOStatus {
  if (doScore >= 65) return 'Normal';
  if (doScore >= 45) return 'Moderate stress';
  if (doScore >= 20) return 'Hypoxic';
  return 'Anoxic';
}

export function getDOStatusColor(status: DOStatus): string {
  if (status === 'Normal')          return '#00C896';
  if (status === 'Moderate stress') return '#F59E0B';
  if (status === 'Hypoxic')         return '#EF4444';
  return '#6B0000';
}

export function getTrophicRiskLabel(state: TrophicState): string {
  if (state === 'Oligotrophic')    return 'LOW RISK';
  if (state === 'Mesotrophic')     return 'LOW-MODERATE RISK';
  if (state === 'Eutrophic')       return 'MODERATE-HIGH RISK';
  return 'HIGH RISK — ALGAL BLOOM LIKELY';
}

// Eutrophication risk weights: P primary (limiting nutrient), N secondary, DO consequence
export const EUTROPHICATION_WEIGHTS = { p: 0.40, n: 0.35, do: 0.25 } as const;

// Raw NO₃-N mg/L → 0-100 goodness score (higher = less eutrophic)
// Thresholds: Oligotrophic <0.3 · Mesotrophic 0.3-0.5 · Eutrophic 0.5-1.5 · Hyper >1.5
export function nMgLToScore(n: number): number {
  if (n <= 0)   return 100;
  if (n <= 0.3) return Math.round(100 - (n / 0.3) * 30);
  if (n <= 0.5) return Math.round(70  - ((n - 0.3) / 0.2) * 20);
  if (n <= 1.5) return Math.round(50  - ((n - 0.5) / 1.0) * 30);
  if (n <= 3.0) return Math.round(20  - ((n - 1.5) / 1.5) * 20);
  return 0;
}

// Raw TP mg/L → 0-100 goodness score
// Thresholds: Oligotrophic <0.008 · Mesotrophic 0.008-0.027 · Eutrophic 0.027-0.1 · Hyper >0.1
export function pMgLToScore(p: number): number {
  if (p <= 0)     return 100;
  if (p <= 0.008) return Math.round(100 - (p / 0.008) * 30);
  if (p <= 0.027) return Math.round(70  - ((p - 0.008) / 0.019) * 20);
  if (p <= 0.084) return Math.round(50  - ((p - 0.027) / 0.057) * 20);
  if (p <= 0.1)   return Math.round(30  - ((p - 0.084) / 0.016) * 10);
  if (p <= 0.3)   return Math.round(20  - ((p - 0.1)   / 0.2)   * 20);
  return 0;
}

// Raw DO mg/L → 0-100 goodness score
// Thresholds: Normal >6-8 mg/L · Hypoxia <2 mg/L · Anoxia <0.5 mg/L
export function doMgLToScore(doVal: number): number {
  if (doVal >= 8)   return 100;
  if (doVal >= 6)   return Math.round(75 + ((doVal - 6)   / 2)   * 25);
  if (doVal >= 4)   return Math.round(50 + ((doVal - 4)   / 2)   * 25);
  if (doVal >= 2)   return Math.round(25 + ((doVal - 2)   / 2)   * 25);
  if (doVal >= 0.5) return Math.round(5  + ((doVal - 0.5) / 1.5) * 20);
  return Math.round((doVal / 0.5) * 5);
}
