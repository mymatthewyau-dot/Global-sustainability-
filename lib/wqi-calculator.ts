import { SensorReading, WQIScore, WQIParameterBreakdown } from '@/types';
import { WQI_WEIGHTS, WQI_CATEGORIES, PARAMETER_RANGES } from './wqi-config';

/**
 * Calculate sub-index (qi) for a parameter value
 * Returns a score from 0-100 based on parameter ranges
 */
function calculateSubIndex(
  value: number,
  ranges: {
    excellent: { min: number; max: number };
    good: { min: number; max: number };
    moderate: { min: number; max: number };
    poor: { min: number; max: number };
  }
): number {
  if (value >= ranges.excellent.min && value <= ranges.excellent.max) {
    return 100;
  } else if (value >= ranges.good.min && value <= ranges.good.max) {
    return 80;
  } else if (value >= ranges.moderate.min && value <= ranges.moderate.max) {
    return 50;
  } else if (value >= ranges.poor.min && value <= ranges.poor.max) {
    return 25;
  }
  
  // Handle out-of-range values
  if (value < ranges.poor.min) {
    return 0;
  }
  return 0; // For values above poor range
}

/**
 * Determine risk level based on sub-index
 */
function getRiskLevel(subIndex: number): 'low' | 'medium' | 'high' {
  if (subIndex >= 80) return 'low';
  if (subIndex >= 50) return 'medium';
  return 'high';
}

/**
 * Calculate WQI from sensor reading using NSFWQI formula
 * Formula: WQI = Σ(qi × wi) / Σwi
 */
export function calculateWQI(reading: SensorReading): WQIScore {
  // Calculate sub-indices for each parameter
  const doSubIndex = calculateSubIndex(reading.do, PARAMETER_RANGES.dissolvedOxygen);
  const phSubIndex = calculateSubIndex(reading.ph, PARAMETER_RANGES.pH);
  const turbiditySubIndex = calculateSubIndex(reading.turbidity, PARAMETER_RANGES.turbidity);
  const tempSubIndex = calculateSubIndex(reading.temperature, PARAMETER_RANGES.temperature);
  const ammoniaSubIndex = calculateSubIndex(reading.ammonia, PARAMETER_RANGES.ammonia);
  const tnSubIndex = calculateSubIndex(reading.tn, PARAMETER_RANGES.totalNitrogen);
  const tpSubIndex = calculateSubIndex(reading.tp, PARAMETER_RANGES.totalPhosphate);

  // Calculate weighted contributions
  const contributions = [
    { parameter: 'Dissolved Oxygen', value: reading.do, subIndex: doSubIndex, weight: WQI_WEIGHTS.dissolvedOxygen },
    { parameter: 'pH', value: reading.ph, subIndex: phSubIndex, weight: WQI_WEIGHTS.pH },
    { parameter: 'Turbidity', value: reading.turbidity, subIndex: turbiditySubIndex, weight: WQI_WEIGHTS.turbidity },
    { parameter: 'Temperature', value: reading.temperature, subIndex: tempSubIndex, weight: WQI_WEIGHTS.temperature },
    { parameter: 'Ammonia', value: reading.ammonia, subIndex: ammoniaSubIndex, weight: WQI_WEIGHTS.ammonia },
    { parameter: 'Total Nitrogen', value: reading.tn, subIndex: tnSubIndex, weight: WQI_WEIGHTS.totalNitrogen },
    { parameter: 'Total Phosphate', value: reading.tp, subIndex: tpSubIndex, weight: WQI_WEIGHTS.totalPhosphate },
  ];

  // Calculate weighted sum
  const weightedSum = contributions.reduce(
    (sum, item) => sum + item.subIndex * item.weight,
    0
  );

  // Calculate total weight (should be 1.0, but calculate for safety)
  const totalWeight = Object.values(WQI_WEIGHTS).reduce((sum, w) => sum + w, 0);

  // Calculate overall WQI
  const overallWQI = Math.round((weightedSum / totalWeight) * 100) / 100;

  // Determine category
  let category: 'Excellent' | 'Good' | 'Moderate' | 'Poor' = 'Poor';
  if (overallWQI >= 90) category = 'Excellent';
  else if (overallWQI >= 70) category = 'Good';
  else if (overallWQI >= 50) category = 'Moderate';

  // Create breakdown
  const breakdown: WQIParameterBreakdown[] = contributions.map((item) => ({
    parameter: item.parameter,
    value: item.value,
    subIndex: item.subIndex,
    weight: item.weight,
    contribution: Math.round((item.subIndex * item.weight / totalWeight) * 100) / 100,
    riskLevel: getRiskLevel(item.subIndex),
  }));

  // Generate trend analysis
  const worstParameter = breakdown.reduce((worst, current) =>
    current.subIndex < worst.subIndex ? current : worst
  );
  const worstContribution = (worstParameter.contribution / overallWQI) * 100;
  
  const trendAnalysis = worstParameter.subIndex < 50
    ? `${worstParameter.parameter} is driving ${Math.round(worstContribution)}% of the score drop. ${worstParameter.parameter} levels are ${worstParameter.riskLevel} risk.`
    : `All parameters are within acceptable ranges. Water quality is ${category.toLowerCase()}.`;

  return {
    overall: overallWQI,
    category,
    breakdown,
    trendAnalysis,
    lastUpdated: reading.timestamp,
  };
}

/**
 * Calculate WQI trend over time series
 */
export function calculateWQITrend(readings: SensorReading[]): {
  timestamps: string[];
  wqiScores: number[];
} {
  const timestamps: string[] = [];
  const wqiScores: number[] = [];

  readings.forEach((reading) => {
    const wqi = calculateWQI(reading);
    timestamps.push(reading.timestamp);
    wqiScores.push(wqi.overall);
  });

  return { timestamps, wqiScores };
}

