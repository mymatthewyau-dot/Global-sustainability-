import { SensorReading, SensorHistory } from '@/types';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_FILE = join(process.cwd(), 'data', 'sensor-history.json');

/**
 * Generate a realistic sensor reading within typical aquaculture ranges
 */
export function generateMockSensorReading(): SensorReading {
  const now = new Date();
  
  return {
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
export function generateHistoricalData(): SensorReading[] {
  const readings: SensorReading[] = [];
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
 * Read sensor history from JSON file
 */
export function readSensorHistory(): SensorHistory {
  try {
    if (!existsSync(DATA_FILE)) {
      // Initialize with historical data if file doesn't exist
      const initialData = generateHistoricalData();
      writeSensorHistory({ readings: initialData });
      return { readings: initialData };
    }
    
    const fileContent = readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(fileContent) as SensorHistory;
  } catch (error) {
    console.error('Error reading sensor history:', error);
    // Return empty history on error
    return { readings: [] };
  }
}

/**
 * Write sensor history to JSON file
 */
export function writeSensorHistory(history: SensorHistory): void {
  try {
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    writeFileSync(DATA_FILE, JSON.stringify(history, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing sensor history:', error);
    throw error;
  }
}

/**
 * Add a new sensor reading to history
 */
export function addSensorReading(reading: SensorReading): void {
  const history = readSensorHistory();
  history.readings.push(reading);
  
  // Keep only last 7 days of data (assuming 15-min intervals = 672 readings)
  const maxReadings = 7 * 24 * 4; // 7 days * 24 hours * 4 readings per hour
  if (history.readings.length > maxReadings) {
    history.readings = history.readings.slice(-maxReadings);
  }
  
  writeSensorHistory(history);
}

/**
 * Get latest sensor reading
 */
export function getLatestReading(): SensorReading | null {
  const history = readSensorHistory();
  if (history.readings.length === 0) {
    return null;
  }
  return history.readings[history.readings.length - 1];
}

/**
 * Get sensor readings for last 24 hours
 */
export function getLast24Hours(): SensorReading[] {
  const history = readSensorHistory();
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  return history.readings.filter(
    (reading) => new Date(reading.timestamp) >= twentyFourHoursAgo
  );
}

