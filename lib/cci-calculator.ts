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
