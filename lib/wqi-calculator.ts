import { SensorReading, WQIScore, WQIParameterBreakdown } from '@/types';
import { WQI_WEIGHTS, PARAMETER_RANGES } from './wqi-config';

function calculateSubIndex(
  value: number,
  ranges: { excellent: { min: number; max: number }; good: { min: number; max: number }; moderate: { min: number; max: number }; poor: { min: number; max: number } },
  inverted = false
): number {
  if (!inverted) {
    if (value >= ranges.excellent.min && value <= ranges.excellent.max) return 100;
    if (value >= ranges.good.min && value <= ranges.good.max) return 80;
    if (value >= ranges.moderate.min && value <= ranges.moderate.max) return 50;
    return 25;
  } else {
    // For inverted params (phosphorus, nitrogen): lower value = better score
    if (value >= ranges.excellent.min && value <= ranges.excellent.max) return 100;
    if (value >= ranges.good.min && value <= ranges.good.max) return 80;
    if (value >= ranges.moderate.min && value <= ranges.moderate.max) return 50;
    return 25;
  }
}

function getRiskLevel(subIndex: number): 'low' | 'medium' | 'high' {
  if (subIndex >= 80) return 'low';
  if (subIndex >= 50) return 'medium';
  return 'high';
}

export function calculateWQI(reading: SensorReading): WQIScore {
  const doSubIndex = calculateSubIndex(reading.dissolvedOxygen, PARAMETER_RANGES.dissolvedOxygen);
  const pSubIndex  = calculateSubIndex(reading.phosphorus, PARAMETER_RANGES.phosphorus, true);
  const nSubIndex  = calculateSubIndex(reading.nitrogen, PARAMETER_RANGES.nitrogen, true);

  const contributions = [
    { parameter: 'Dissolved Oxygen', value: reading.dissolvedOxygen, subIndex: doSubIndex, weight: WQI_WEIGHTS.dissolvedOxygen, unit: 'mg/L' },
    { parameter: 'Phosphorus',        value: reading.phosphorus,      subIndex: pSubIndex,  weight: WQI_WEIGHTS.phosphorus,      unit: 'mg/L' },
    { parameter: 'Nitrogen',          value: reading.nitrogen,         subIndex: nSubIndex,  weight: WQI_WEIGHTS.nitrogen,         unit: 'mg/L' },
  ];

  const totalWeight = WQI_WEIGHTS.dissolvedOxygen + WQI_WEIGHTS.phosphorus + WQI_WEIGHTS.nitrogen;
  const weightedSum = contributions.reduce((sum, item) => sum + item.subIndex * item.weight, 0);
  const overallWQI = Math.round((weightedSum / totalWeight) * 100) / 100;

  let category: 'Excellent' | 'Good' | 'Moderate' | 'Poor' = 'Poor';
  if (overallWQI >= 90) category = 'Excellent';
  else if (overallWQI >= 70) category = 'Good';
  else if (overallWQI >= 50) category = 'Moderate';

  const breakdown: WQIParameterBreakdown[] = contributions.map((item) => ({
    parameter: item.parameter,
    value: item.value,
    subIndex: item.subIndex,
    weight: item.weight,
    contribution: Math.round((item.subIndex * item.weight / totalWeight) * 100) / 100,
    riskLevel: getRiskLevel(item.subIndex),
  }));

  return {
    overall: overallWQI,
    category,
    breakdown,
    lastUpdated: reading.timestamp,
  };
}
