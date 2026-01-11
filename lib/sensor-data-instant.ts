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
    temperature: parseFloat((24 + Math.random() * 8).toFixed(1)), // 24-32°C
    ph: parseFloat((7.0 + Math.random() * 2).toFixed(2)), // 7.0-9.0
    do: parseFloat((3 + Math.random() * 5).toFixed(1)), // 3-8 mg/L
    tss: parseFloat((50 + Math.random() * 700).toFixed(0)), // 50-750 mg/L
    salinity: parseFloat((5 + Math.random() * 35).toFixed(1)), // 5-40 ppt
    ammonia: parseFloat((Math.random() * 2).toFixed(2)), // 0-2 mg/L TAN
    alkalinity: parseFloat((60 + Math.random() * 140).toFixed(0)), // 60-200 mg/L CaCO₃
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
    const baseTemp = 28 + Math.sin(i / 10) * 3;
    const baseDO = 5.5 + Math.cos(i / 8) * 1.5;
    const baseTSS = 400 + Math.sin(i / 6) * 150;
    const baseAlkalinity = 120 + Math.cos(i / 12) * 30;
    
    readings.push({
      farmId,
      timestamp: timestamp.toISOString(),
      temperature: parseFloat((baseTemp + (Math.random() - 0.5) * 2).toFixed(1)),
      ph: parseFloat((8 + (Math.random() - 0.5) * 0.5).toFixed(2)),
      do: parseFloat((baseDO + (Math.random() - 0.5) * 1).toFixed(1)),
      tss: parseFloat((baseTSS + (Math.random() - 0.5) * 100).toFixed(0)),
      salinity: parseFloat((18 + Math.random() * 10).toFixed(1)),
      ammonia: parseFloat((0.3 + Math.random() * 0.5).toFixed(2)),
      alkalinity: parseFloat((baseAlkalinity + (Math.random() - 0.5) * 20).toFixed(0)),
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
      tss: reading.tss,
      salinity: reading.salinity,
      ammonia: reading.ammonia,
      alkalinity: reading.alkalinity,
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
      tss: reading.tss,
      salinity: reading.salinity,
      ammonia: reading.ammonia,
      alkalinity: reading.alkalinity,
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
    tss: dbReading.tss,
    salinity: dbReading.salinity,
    ammonia: dbReading.ammonia,
    alkalinity: dbReading.alkalinity,
    wqiScore: dbReading.wqiScore,
  };
}

