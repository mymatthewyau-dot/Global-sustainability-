/**
 * Seed Initial Data Script
 * 
 * This script generates 30 days of historical sensor data for a farm
 * Run this after creating your farm account to populate baseline data
 * 
 * Usage:
 * 1. Sign in to your account and create a farm
 * 2. Get your farmId from the browser console (check farm context)
 * 3. Run: npx ts-node scripts/seed-initial-data.ts <farmId>
 */

import { init } from '@instantdb/admin';
import { generateHistoricalData } from '../lib/sensor-data-instant';
import { calculateWQI } from '../lib/wqi-calculator';

const APP_ID = '0ff4c356-edb9-4b27-b6e6-7e1e32c7ccd8';

// You'll need an admin token from InstantDB dashboard
// Go to: Dashboard -> Settings -> Admin Token
const ADMIN_TOKEN = process.env.INSTANTDB_ADMIN_TOKEN || '';

if (!ADMIN_TOKEN) {
  console.error('Error: INSTANTDB_ADMIN_TOKEN environment variable is required');
  console.error('Get your admin token from: https://instantdb.com/dash');
  process.exit(1);
}

const farmId = process.argv[2];

if (!farmId) {
  console.error('Error: farmId is required');
  console.error('Usage: npx ts-node scripts/seed-initial-data.ts <farmId>');
  process.exit(1);
}

const db = init({
  appId: APP_ID,
  adminToken: ADMIN_TOKEN,
});

async function seedData() {
  console.log(`Generating 30 days of historical data for farm ${farmId}...`);

  const readings = generateHistoricalData(farmId);
  console.log(`Generated ${readings.length} sensor readings`);

  console.log('Uploading to InstantDB...');

  let count = 0;
  for (const reading of readings) {
    // Calculate WQI for each reading
    const wqiScore = calculateWQI(reading);

    // Upload to InstantDB (using admin SDK)
    await db.transact([
      db.tx.sensorReadings[db.id()].update({
        farmId: reading.farmId!,
        timestamp: new Date(reading.timestamp).getTime(),
        temperature: reading.temperature,
        ph: reading.ph,
        do: reading.do,
        tss: reading.tss,
        salinity: reading.salinity,
        ammonia: reading.ammonia,
        alkalinity: reading.alkalinity,
        wqiScore: wqiScore.overall,
      }),
    ]);

    count++;
    if (count % 10 === 0) {
      console.log(`  Uploaded ${count}/${readings.length} readings...`);
    }
  }

  console.log('✅ Data seeding complete!');
  console.log(`Successfully uploaded ${count} sensor readings to farm ${farmId}`);
}

seedData().catch((error) => {
  console.error('Error seeding data:', error);
  process.exit(1);
});
