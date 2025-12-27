import { SensorReading, Recommendation, WQIScore } from '@/types';
import { RECOMMENDATION_RULES } from './recommendation-rules';

/**
 * Generate recommendations based on sensor reading and WQI score
 * Uses rule-based logic from recommendation-rules.ts
 */
export function generateRecommendations(
  reading: SensorReading,
  wqi: WQIScore
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Evaluate each rule
  RECOMMENDATION_RULES.forEach((rule) => {
    if (rule.condition(reading, wqi.overall)) {
      recommendations.push({
        category: rule.category,
        action: rule.action,
        reason: rule.reason,
        priority: rule.priority,
        dataLink: rule.dataLink,
      });
    }
  });

  // Sort by priority (High first, then Medium, then Low)
  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  recommendations.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  // Limit to top 5 recommendations to avoid overwhelming the farmer
  return recommendations.slice(0, 5);
}

/**
 * Get recommendations for a specific WQI score (used by API)
 */
export function getRecommendationsByWQI(wqiScore: number): Recommendation[] {
  // This is a simplified version - in practice, you'd need the full sensor reading
  // For API endpoint that only receives WQI, we'll use basic rules
  const recommendations: Recommendation[] = [];

  if (wqiScore < 50) {
    recommendations.push({
      category: 'Maintenance',
      action: 'Immediate water quality intervention required',
      reason: `WQI score of ${wqiScore.toFixed(1)} indicates poor water quality. Review all sensor parameters and take corrective action.`,
      priority: 'High',
    });
  } else if (wqiScore < 70) {
    recommendations.push({
      category: 'Maintenance',
      action: 'Monitor water quality closely and consider preventive measures',
      reason: `WQI score of ${wqiScore.toFixed(1)} indicates moderate water quality. Review sensor breakdown for specific issues.`,
      priority: 'Medium',
    });
  }

  return recommendations;
}

