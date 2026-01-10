import { db, id as generateId } from './instant';
import { SensorReading } from '@/types';

/**
 * Generate a realistic sensor reading within typical aquaculture ranges
 */
export function generateMockSensorReading(farmId: string): Omit<SensorReading, 'id'> {
  const now = new Date();
  
  return {
    farmId,
    timestamp: now.toISOString(),
    temperature: parseFloat((20 + Math.random() * 10).toFixed(1)), // 20-30°C
    ph: parseFloat((6.5 + Math.random() * 2).toFixed(2)), // 6.5-8.5
    do: parseFloat((4 + Math.random() * 4).toFixed(1)), // 4-8 mg/L
    turbidity: parseFloat((Math.random() * 20).toFixed(1)), // 0-20 NTU
    salinity: parseFloat((Math.random() * 35).toFixed(1)), // 0-35 ppt
    ammonia: parseFloat((Math.random() * 0.2).toFixed(3)), // 0-0.2 mg/L
    tn: parseFloat((Math.random() * 2).toFixed(2)), // 0-2 mg/L
    tp: parseFloat((Math.random() * 0.2).toFixed(3)), // 0-0.2 mg/L
  };
}

/**
 * Generate 24 hours of historical sensor data (one reading every 15 minutes)
 */
export function generateHistoricalData(farmId: string): Omit<SensorReading, 'id'>[] {
  const readings: Omit<SensorReading, 'id'>[] = [];
  const now = new Date();
  const hoursBack = 24;
  const intervalMinutes = 15;
  const totalReadings = (hoursBack * 60) / intervalMinutes;

  for (let i = totalReadings; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);
    
    // Add some realistic variation over time
    const baseTemp = 25 + Math.sin(i / 10) * 3;
    const baseDO = 6 + Math.cos(i / 8) * 1.5;
    
    readings.push({
      farmId,
      timestamp: timestamp.toISOString(),
      temperature: parseFloat((baseTemp + (Math.random() - 0.5) * 2).toFixed(1)),
      ph: parseFloat((7 + (Math.random() - 0.5) * 0.5).toFixed(2)),
      do: parseFloat((baseDO + (Math.random() - 0.5) * 1).toFixed(1)),
      turbidity: parseFloat((10 + Math.random() * 5 + Math.sin(i / 5) * 3).toFixed(1)),
      salinity: parseFloat((15 + Math.random() * 10).toFixed(1)),
      ammonia: parseFloat((0.05 + Math.random() * 0.1).toFixed(3)),
      tn: parseFloat((0.5 + Math.random() * 0.5).toFixed(2)),
      tp: parseFloat((0.05 + Math.random() * 0.1).toFixed(3)),
    });
  }

  return readings;
}

/**
 * Add a new sensor reading to InstantDB
 */
export async function addSensorReading(
  reading: Omit<SensorReading, 'id'> & { wqiScore: number }
) {
  const readingId = generateId();
  
  await db.transact([
    (db.tx as any).sensorReadings[readingId].update({
      farmId: reading.farmId!,
      timestamp: new Date(reading.timestamp).getTime(),
      temperature: reading.temperature,
      ph: reading.ph,
      do: reading.do,
      turbidity: reading.turbidity,
      salinity: reading.salinity,
      ammonia: reading.ammonia,
      tn: reading.tn,
      tp: reading.tp,
      wqiScore: reading.wqiScore,
    }),
  ]);
}

/**
 * Batch add multiple sensor readings to InstantDB
 */
export async function batchAddSensorReadings(
  readings: (Omit<SensorReading, 'id'> & { wqiScore: number })[]
) {
  const transactions = readings.map((reading) => {
    const readingId = generateId();
    return (db.tx as any).sensorReadings[readingId].update({
      farmId: reading.farmId!,
      timestamp: new Date(reading.timestamp).getTime(),
      temperature: reading.temperature,
      ph: reading.ph,
      do: reading.do,
      turbidity: reading.turbidity,
      salinity: reading.salinity,
      ammonia: reading.ammonia,
      tn: reading.tn,
      tp: reading.tp,
      wqiScore: reading.wqiScore,
    });
  });

  await db.transact(transactions);
}

/**
 * Convert InstantDB sensor reading to SensorReading type
 */
export function convertToSensorReading(dbReading: any): SensorReading {
  return {
    id: dbReading.id,
    farmId: dbReading.farmId,
    timestamp: new Date(dbReading.timestamp).toISOString(),
    temperature: dbReading.temperature,
    ph: dbReading.ph,
    do: dbReading.do,
    turbidity: dbReading.turbidity,
    salinity: dbReading.salinity,
    ammonia: dbReading.ammonia,
    tn: dbReading.tn,
    tp: dbReading.tp,
    wqiScore: dbReading.wqiScore,
  };
}

