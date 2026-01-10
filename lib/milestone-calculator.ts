import {
  getHistoricalReadings,
  getFeedHistory,
  getSpeciesAdded,
  getAquafarm,
  getMilestones,
} from './db-service';
import { calculateWQI } from './wqi-calculator';
import { Milestone } from '@/types';

interface MilestoneMetrics {
  ecoFriendlinessScore: number;
  yieldImprovement: number;
  wqiImprovement: number;
  feedEfficiency: number;
  speciesDiversity: number;
  nutrientReduction: number;
}

/**
 * Calculate eco-friendliness score based on WQI improvements, reduced feed waste, nutrient cycling
 */
export async function calculateEcoFriendlinessScore(userId: string): Promise<number> {
  const aquafarm = await getAquafarm(userId);
  const imtaStartDate = aquafarm?.imtaStartDate ? new Date(aquafarm.imtaStartDate) : null;

  // Get historical readings
  const readings = await getHistoricalReadings(userId, 90); // Last 90 days
  if (readings.length === 0) return 0;

  // Calculate WQI improvements
  let wqiImprovement = 0;
  if (imtaStartDate && readings.length > 0) {
    const beforeReadings = readings.filter((r) => new Date(r.timestamp) < imtaStartDate);
    const afterReadings = readings.filter((r) => new Date(r.timestamp) >= imtaStartDate);

    if (beforeReadings.length > 0 && afterReadings.length > 0) {
      const beforeAvg =
        beforeReadings.reduce((sum, r) => sum + calculateWQI(r).overall, 0) /
        beforeReadings.length;
      const afterAvg =
        afterReadings.reduce((sum, r) => sum + calculateWQI(r).overall, 0) / afterReadings.length;
      wqiImprovement = ((afterAvg - beforeAvg) / beforeAvg) * 100;
    }
  } else {
    // Compare first half vs second half
    const midpoint = Math.floor(readings.length / 2);
    const firstHalf = readings.slice(0, midpoint);
    const secondHalf = readings.slice(midpoint);

    if (firstHalf.length > 0 && secondHalf.length > 0) {
      const firstAvg =
        firstHalf.reduce((sum, r) => sum + calculateWQI(r).overall, 0) / firstHalf.length;
      const secondAvg =
        secondHalf.reduce((sum, r) => sum + calculateWQI(r).overall, 0) / secondHalf.length;
      wqiImprovement = ((secondAvg - firstAvg) / firstAvg) * 100;
    }
  }

  // Calculate nutrient reduction (based on WQI parameters)
  const latestReading = readings[readings.length - 1];
  const firstReading = readings[0];
  const nutrientReduction =
    ((firstReading.ammonia + firstReading.tn + firstReading.tp) -
      (latestReading.ammonia + latestReading.tn + latestReading.tp)) /
    (firstReading.ammonia + firstReading.tn + firstReading.tp);

  // Feed efficiency (based on feed history and water quality)
  const feedHistory = await getFeedHistory(userId);
  const feedEfficiency = feedHistory.length > 0 ? Math.min(100, (feedHistory.length / 30) * 100) : 0; // Normalize to 0-100

  // Combine metrics (weighted)
  const ecoScore =
    wqiImprovement * 0.4 + // 40% weight on WQI improvement
    Math.max(0, nutrientReduction * 100) * 0.3 + // 30% weight on nutrient reduction
    feedEfficiency * 0.3; // 30% weight on feed efficiency

  return Math.max(0, Math.min(100, ecoScore));
}

/**
 * Calculate yield improvement based on species diversity, feed efficiency, water quality
 */
export async function calculateYieldImprovement(userId: string): Promise<number> {
  const species = await getSpeciesAdded(userId);
  const feedHistory = await getFeedHistory(userId);
  const readings = await getHistoricalReadings(userId, 90);

  // Species diversity score (0-100)
  const uniqueSpecies = new Set(species.map((s) => s.speciesName)).size;
  const speciesDiversity = Math.min(100, (uniqueSpecies.size * 20)); // Max 5 species = 100

  // Feed efficiency (based on consistency)
  const feedEfficiency = feedHistory.length > 0 ? Math.min(100, (feedHistory.length / 30) * 100) : 0;

  // Water quality stability (based on WQI variance)
  let wqiStability = 0;
  if (readings.length > 1) {
    const wqiScores = readings.map((r) => calculateWQI(r).overall);
    const avg = wqiScores.reduce((a, b) => a + b, 0) / wqiScores.length;
    const variance =
      wqiScores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / wqiScores.length;
    const stdDev = Math.sqrt(variance);
    wqiStability = Math.max(0, 100 - stdDev * 2); // Lower variance = higher stability
  }

  // Combine metrics
  const yieldScore =
    speciesDiversity * 0.4 + // 40% weight on diversity
    feedEfficiency * 0.3 + // 30% weight on feed efficiency
    wqiStability * 0.3; // 30% weight on water quality stability

  return Math.max(0, Math.min(100, yieldScore));
}

/**
 * Detect milestones automatically based on activity data and improvements
 */
export async function detectMilestones(userId: string): Promise<Milestone[]> {
  const milestones: Milestone[] = [];
  const now = new Date().toISOString();

  // Get data
  const aquafarm = await getAquafarm(userId);
  const imtaStartDate = aquafarm?.imtaStartDate ? new Date(aquafarm.imtaStartDate) : null;
  const readings = await getHistoricalReadings(userId, 365);
  const feedHistory = await getFeedHistory(userId);
  const species = await getSpeciesAdded(userId);
  const existingMilestones = await getMilestones(userId);

  // Check for existing milestones to avoid duplicates
  const existingTypes = new Set(existingMilestones.map((m) => m.milestoneType + m.description));

  // Eco-Friendliness Milestones

  // WQI Improvement milestones
  if (readings.length >= 10) {
    const firstWQI = calculateWQI(readings[0]).overall;
    const recentReadings = readings.slice(-10);
    const recentAvg =
      recentReadings.reduce((sum, r) => sum + calculateWQI(r).overall, 0) / recentReadings.length;
    const improvement = ((recentAvg - firstWQI) / firstWQI) * 100;

    if (improvement >= 50 && !existingTypes.has('eco-friendliness50% WQI Improvement')) {
      milestones.push({
        id: '',
        userId,
        milestoneType: 'eco-friendliness',
        description: '50% WQI Improvement',
        dateAchieved: now,
        metrics: JSON.stringify({ improvement: improvement.toFixed(2) + '%' }),
        createdAt: Date.now(),
      });
    } else if (improvement >= 25 && !existingTypes.has('eco-friendliness25% WQI Improvement')) {
      milestones.push({
        id: '',
        userId,
        milestoneType: 'eco-friendliness',
        description: '25% WQI Improvement',
        dateAchieved: now,
        metrics: JSON.stringify({ improvement: improvement.toFixed(2) + '%' }),
        createdAt: Date.now(),
      });
    } else if (improvement >= 10 && !existingTypes.has('eco-friendliness10% WQI Improvement')) {
      milestones.push({
        id: '',
        userId,
        milestoneType: 'eco-friendliness',
        description: '10% WQI Improvement',
        dateAchieved: now,
        metrics: JSON.stringify({ improvement: improvement.toFixed(2) + '%' }),
        createdAt: Date.now(),
      });
    }
  }

  // Water quality category upgrades
  if (readings.length > 0) {
    const latestWQI = calculateWQI(readings[readings.length - 1]);
    const firstWQI = calculateWQI(readings[0]);

    if (
      latestWQI.category === 'Excellent' &&
      firstWQI.category !== 'Excellent' &&
      !existingTypes.has('eco-friendlinessExcellent Water Quality')
    ) {
      milestones.push({
        id: '',
        userId,
        milestoneType: 'eco-friendliness',
        description: 'Excellent Water Quality',
        dateAchieved: now,
        metrics: JSON.stringify({ wqi: latestWQI.overall.toFixed(2) }),
        createdAt: Date.now(),
      });
    } else if (
      latestWQI.category === 'Good' &&
      (firstWQI.category === 'Moderate' || firstWQI.category === 'Poor') &&
      !existingTypes.has('eco-friendlinessGood Water Quality')
    ) {
      milestones.push({
        id: '',
        userId,
        milestoneType: 'eco-friendliness',
        description: 'Good Water Quality',
        dateAchieved: now,
        metrics: JSON.stringify({ wqi: latestWQI.overall.toFixed(2) }),
        createdAt: Date.now(),
      });
    }
  }

  // Feed efficiency milestones
  if (feedHistory.length >= 30 && !existingTypes.has('eco-friendliness30 Days of Feeding')) {
    milestones.push({
      id: '',
      userId,
      milestoneType: 'eco-friendliness',
      description: '30 Days of Feeding',
      dateAchieved: now,
      metrics: JSON.stringify({ days: feedHistory.length }),
      createdAt: Date.now(),
    });
  }

  // Yield Milestones

  // Species diversity milestones
  const uniqueSpecies = new Set(species.map((s) => s.speciesName)).size;
  if (uniqueSpecies >= 3 && !existingTypes.has('yield3 Species Diversity')) {
    milestones.push({
      id: '',
      userId,
      milestoneType: 'yield',
      description: '3 Species Diversity',
      dateAchieved: now,
      metrics: JSON.stringify({ speciesCount: uniqueSpecies }),
      createdAt: Date.now(),
    });
  } else if (uniqueSpecies >= 2 && !existingTypes.has('yield2 Species Diversity')) {
    milestones.push({
      id: '',
      userId,
      milestoneType: 'yield',
      description: '2 Species Diversity',
      dateAchieved: now,
      metrics: JSON.stringify({ speciesCount: uniqueSpecies }),
      createdAt: Date.now(),
    });
  }

  // System stability
  if (readings.length >= 30) {
    const wqiScores = readings.slice(-30).map((r) => calculateWQI(r).overall);
    const avg = wqiScores.reduce((a, b) => a + b, 0) / wqiScores.length;
    const variance =
      wqiScores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / wqiScores.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev < 5 && !existingTypes.has('system-stability30 Days Stable System')) {
      milestones.push({
        id: '',
        userId,
        milestoneType: 'system-stability',
        description: '30 Days Stable System',
        dateAchieved: now,
        metrics: JSON.stringify({ stdDev: stdDev.toFixed(2) }),
        createdAt: Date.now(),
      });
    }
  }

  // IMTA Impact milestone
  if (imtaStartDate && readings.length > 0) {
    const beforeReadings = readings.filter((r) => new Date(r.timestamp) < imtaStartDate);
    const afterReadings = readings.filter((r) => new Date(r.timestamp) >= imtaStartDate);

    if (beforeReadings.length >= 10 && afterReadings.length >= 10) {
      const beforeAvg =
        beforeReadings.reduce((sum, r) => sum + calculateWQI(r).overall, 0) /
        beforeReadings.length;
      const afterAvg =
        afterReadings.reduce((sum, r) => sum + calculateWQI(r).overall, 0) / afterReadings.length;
      const improvement = ((afterAvg - beforeAvg) / beforeAvg) * 100;

      if (
        improvement >= 20 &&
        !existingTypes.has('eco-friendliness20% IMTA Impact')
      ) {
        milestones.push({
          id: '',
          userId,
          milestoneType: 'eco-friendliness',
          description: '20% IMTA Impact',
          dateAchieved: now,
          metrics: JSON.stringify({ improvement: improvement.toFixed(2) + '%' }),
          createdAt: Date.now(),
        });
      }
    }
  }

  return milestones;
}

/**
 * Get IMTA impact comparison (before/after IMTA)
 */
export async function getIMTAImpact(userId: string): Promise<{
  before: { averageWQI: number; readingCount: number };
  after: { averageWQI: number; readingCount: number };
  improvement: number;
} | null> {
  const aquafarm = await getAquafarm(userId);
  const imtaStartDate = aquafarm?.imtaStartDate ? new Date(aquafarm.imtaStartDate) : null;

  if (!imtaStartDate) {
    return null;
  }

  const readings = await getHistoricalReadings(userId, 365);
  const beforeReadings = readings.filter((r) => new Date(r.timestamp) < imtaStartDate);
  const afterReadings = readings.filter((r) => new Date(r.timestamp) >= imtaStartDate);

  if (beforeReadings.length === 0 || afterReadings.length === 0) {
    return null;
  }

  const beforeAvg =
    beforeReadings.reduce((sum, r) => sum + calculateWQI(r).overall, 0) / beforeReadings.length;
  const afterAvg =
    afterReadings.reduce((sum, r) => sum + calculateWQI(r).overall, 0) / afterReadings.length;
  const improvement = ((afterAvg - beforeAvg) / beforeAvg) * 100;

  return {
    before: {
      averageWQI: parseFloat(beforeAvg.toFixed(2)),
      readingCount: beforeReadings.length,
    },
    after: {
      averageWQI: parseFloat(afterAvg.toFixed(2)),
      readingCount: afterReadings.length,
    },
    improvement: parseFloat(improvement.toFixed(2)),
  };
}

/**
 * Get all milestone metrics
 */
export async function getAllMilestoneMetrics(userId: string): Promise<MilestoneMetrics> {
  const [ecoScore, yieldScore, imtaImpact] = await Promise.all([
    calculateEcoFriendlinessScore(userId),
    calculateYieldImprovement(userId),
    getIMTAImpact(userId),
  ]);

  return {
    ecoFriendlinessScore: ecoScore,
    yieldImprovement: yieldScore,
    wqiImprovement: imtaImpact?.improvement || 0,
    feedEfficiency: 0, // Can be calculated separately
    speciesDiversity: 0, // Can be calculated separately
    nutrientReduction: 0, // Can be calculated separately
  };
}
