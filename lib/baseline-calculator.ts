import { SensorReading } from '@/types';

export interface BaselineData {
  averageWqi: number;
  startDate: string;
  endDate: string;
  readingsCount: number;
}

/**
 * Calculate baseline WQI from the first 30 days of sensor readings
 * @param readings All sensor readings sorted by timestamp (oldest first)
 * @param imtaStartDate The date when IMTA was implemented
 * @returns Baseline data or null if insufficient data
 */
export function calculateBaseline(
  readings: SensorReading[],
  imtaStartDate: string
): BaselineData | null {
  if (readings.length === 0) return null;

  // Sort readings by timestamp (oldest first)
  const sortedReadings = [...readings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const imtaStart = new Date(imtaStartDate).getTime();
  const thirtyDaysLater = imtaStart + 30 * 24 * 60 * 60 * 1000;

  // Get readings from first 30 days after IMTA start
  const baselineReadings = sortedReadings.filter((r) => {
    const timestamp = new Date(r.timestamp).getTime();
    return timestamp >= imtaStart && timestamp <= thirtyDaysLater;
  });

  if (baselineReadings.length === 0) return null;

  // Calculate average WQI from baseline period
  const totalWqi = baselineReadings.reduce((sum, r) => sum + (r.wqiScore || 0), 0);
  const averageWqi = totalWqi / baselineReadings.length;

  return {
    averageWqi,
    startDate: baselineReadings[0].timestamp,
    endDate: baselineReadings[baselineReadings.length - 1].timestamp,
    readingsCount: baselineReadings.length,
  };
}

/**
 * Calculate improvement percentage from baseline to current WQI
 */
export function calculateImprovement(baselineWqi: number, currentWqi: number): number {
  if (baselineWqi === 0) return 0;
  return ((currentWqi - baselineWqi) / baselineWqi) * 100;
}

/**
 * Calculate rolling average WQI over specified number of days
 */
export function calculateRollingAverage(
  readings: SensorReading[],
  days: number
): number | null {
  if (readings.length === 0) return null;

  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
  const recentReadings = readings.filter(
    (r) => new Date(r.timestamp).getTime() >= cutoffTime
  );

  if (recentReadings.length === 0) return null;

  const totalWqi = recentReadings.reduce((sum, r) => sum + (r.wqiScore || 0), 0);
  return totalWqi / recentReadings.length;
}

/**
 * Get trend data for charting (timestamp and WQI pairs)
 */
export function getTrendData(
  readings: SensorReading[],
  days?: number
): { timestamp: string; wqi: number }[] {
  let filteredReadings = readings;

  if (days) {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    filteredReadings = readings.filter(
      (r) => new Date(r.timestamp).getTime() >= cutoffTime
    );
  }

  return filteredReadings
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((r) => ({
      timestamp: r.timestamp,
      wqi: r.wqiScore || 0,
    }));
}

