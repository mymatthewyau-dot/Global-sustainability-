import { db, id as generateId } from './instant';
import { SensorReading } from '@/types';

export function generateMockSensorReading(farmId: string): Omit<SensorReading, 'id'> {
  return {
    farmId,
    timestamp: new Date().toISOString(),
    dissolvedOxygen:  parseFloat((3 + Math.random() * 7).toFixed(1)),    // 3–10 mg/L
    phosphorus:       parseFloat((Math.random() * 0.3).toFixed(3)),       // 0–0.3 mg/L
    nitrogen:         parseFloat((Math.random() * 6).toFixed(2)),          // 0–6 mg/L
    stockingDensity:  parseFloat((10 + Math.random() * 40).toFixed(1)),  // 10–50 fish/m³
  };
}

export async function addSensorReading(
  reading: Omit<SensorReading, 'id'> & { wqiScore: number }
) {
  const readingId = generateId();
  await db.transact([
    (db.tx as any).sensorReadings[readingId].update({
      farmId: reading.farmId!,
      timestamp: new Date(reading.timestamp).getTime(),
      dissolvedOxygen: reading.dissolvedOxygen,
      phosphorus: reading.phosphorus,
      nitrogen: reading.nitrogen,
      stockingDensity: reading.stockingDensity,
      wqiScore: reading.wqiScore,
    }),
  ]);
}

export function convertToSensorReading(dbReading: any): SensorReading {
  return {
    id: dbReading.id,
    farmId: dbReading.farmId,
    timestamp: new Date(dbReading.timestamp).toISOString(),
    dissolvedOxygen: dbReading.dissolvedOxygen ?? 0,
    phosphorus: dbReading.phosphorus ?? 0,
    nitrogen: dbReading.nitrogen ?? 0,
    stockingDensity: dbReading.stockingDensity ?? 0,
    wqiScore: dbReading.wqiScore,
  };
}
