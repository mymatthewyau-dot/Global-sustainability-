import { SensorReading, StockingRecommendation } from '@/types';

export function generateStockingRecommendations(
  reading: SensorReading
): StockingRecommendation[] {
  const { dissolvedOxygen: doVal, phosphorus, nitrogen } = reading;
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
