import { db, id } from './instant';
import { SensorReading, Milestone } from '@/types';
import { calculateBaseline, calculateRollingAverage } from './baseline-calculator';

export type MilestoneType =
  | 'wqi_improved_10'
  | 'wqi_improved_25'
  | 'wqi_improved_50'
  | '30_days_tracked'
  | '60_days_tracked'
  | '90_days_tracked';

interface MilestoneDefinition {
  type: MilestoneType;
  title: string;
  description: string;
  icon: string;
  check: (
    readings: SensorReading[],
    existingMilestones: Milestone[],
    imtaStartDate: string
  ) => boolean;
}

/**
 * Check if milestone already achieved
 */
function milestoneExists(milestones: Milestone[], type: MilestoneType): boolean {
  return milestones.some((m) => m.type === type);
}

/**
 * Get number of days since IMTA start
 */
function getDaysSinceStart(imtaStartDate: string): number {
  const start = new Date(imtaStartDate).getTime();
  const now = Date.now();
  return Math.floor((now - start) / (24 * 60 * 60 * 1000));
}

/**
 * All milestone definitions
 */
export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  {
    type: '30_days_tracked',
    title: '30 Days of Tracking',
    description: 'Successfully tracked water quality for 30 days',
    icon: '📅',
    check: (readings, existing, imtaStartDate) => {
      if (milestoneExists(existing, '30_days_tracked')) return false;
      return getDaysSinceStart(imtaStartDate) >= 30 && readings.length > 0;
    },
  },
  {
    type: '60_days_tracked',
    title: '60 Days of Tracking',
    description: 'Successfully tracked water quality for 60 days',
    icon: '📆',
    check: (readings, existing, imtaStartDate) => {
      if (milestoneExists(existing, '60_days_tracked')) return false;
      return getDaysSinceStart(imtaStartDate) >= 60 && readings.length > 0;
    },
  },
  {
    type: '90_days_tracked',
    title: '90 Days of Tracking',
    description: 'Successfully tracked water quality for 90 days',
    icon: '🗓️',
    check: (readings, existing, imtaStartDate) => {
      if (milestoneExists(existing, '90_days_tracked')) return false;
      return getDaysSinceStart(imtaStartDate) >= 90 && readings.length > 0;
    },
  },
  {
    type: 'wqi_improved_10',
    title: '10% WQI Improvement',
    description: 'Water quality improved by 10% from baseline',
    icon: '⭐',
    check: (readings, existing, imtaStartDate) => {
      if (milestoneExists(existing, 'wqi_improved_10')) return false;
      const baseline = calculateBaseline(readings, imtaStartDate);
      const current = calculateRollingAverage(readings, 7);
      if (!baseline || !current) return false;
      const improvement = ((current - baseline.averageWqi) / baseline.averageWqi) * 100;
      return improvement >= 10;
    },
  },
  {
    type: 'wqi_improved_25',
    title: '25% WQI Improvement',
    description: 'Water quality improved by 25% from baseline',
    icon: '🌟',
    check: (readings, existing, imtaStartDate) => {
      if (milestoneExists(existing, 'wqi_improved_25')) return false;
      const baseline = calculateBaseline(readings, imtaStartDate);
      const current = calculateRollingAverage(readings, 7);
      if (!baseline || !current) return false;
      const improvement = ((current - baseline.averageWqi) / baseline.averageWqi) * 100;
      return improvement >= 25;
    },
  },
  {
    type: 'wqi_improved_50',
    title: '50% WQI Improvement',
    description: 'Water quality improved by 50% from baseline',
    icon: '💎',
    check: (readings, existing, imtaStartDate) => {
      if (milestoneExists(existing, 'wqi_improved_50')) return false;
      const baseline = calculateBaseline(readings, imtaStartDate);
      const current = calculateRollingAverage(readings, 7);
      if (!baseline || !current) return false;
      const improvement = ((current - baseline.averageWqi) / baseline.averageWqi) * 100;
      return improvement >= 50;
    },
  },
];

/**
 * Detect and create new milestones
 * Returns array of newly created milestone IDs
 */
export async function detectAndCreateMilestones(
  farmId: string,
  readings: SensorReading[],
  existingMilestones: Milestone[],
  imtaStartDate: string
): Promise<string[]> {
  const newMilestones: string[] = [];
  const baseline = calculateBaseline(readings, imtaStartDate);
  const current = calculateRollingAverage(readings, 7);

  for (const definition of MILESTONE_DEFINITIONS) {
    if (definition.check(readings, existingMilestones, imtaStartDate)) {
      const milestoneId = id();
      const improvementPercent =
        baseline && current
          ? ((current - baseline.averageWqi) / baseline.averageWqi) * 100
          : 0;

      try {
        await db.transact([
          (db.tx as any).milestones[milestoneId].update({
            farmId,
            achievedAt: Date.now(),
            type: definition.type,
            baselineWqi: baseline?.averageWqi || 0,
            currentWqi: current || 0,
            improvementPercent,
          }),
        ]);

        newMilestones.push(milestoneId);
      } catch (error) {
        console.error(`Error creating milestone ${definition.type}:`, error);
      }
    }
  }

  return newMilestones;
}

/**
 * Get milestone definition by type
 */
export function getMilestoneDefinition(type: MilestoneType): MilestoneDefinition | undefined {
  return MILESTONE_DEFINITIONS.find((d) => d.type === type);
}

