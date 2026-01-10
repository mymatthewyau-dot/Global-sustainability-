import { readSensorHistory } from '@/lib/sensor-data';
import { addSensorReading, createUser } from '@/lib/db-service';

/**
 * Migration script to transfer existing JSON data to InstantDB
 * Run with: npx tsx scripts/migrate-to-instantdb.ts
 */
async function migrate() {
  console.log('🚀 Starting migration to InstantDB...\n');

  try {
    // Create a default user
    console.log('Creating default user...');
    const user = await createUser('default@example.com', 'Default User');
    console.log(`✅ Created user: ${user.id} (${user.email})\n`);

    // Read existing data from JSON file
    console.log('Reading existing sensor data from JSON file...');
    const history = readSensorHistory();
    console.log(`📊 Found ${history.readings.length} readings to migrate\n`);

    if (history.readings.length === 0) {
      console.log('⚠️  No readings found to migrate. Exiting.');
      return;
    }

    // Migrate each reading to InstantDB
    console.log('Migrating readings to InstantDB...');
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < history.readings.length; i++) {
      const reading = history.readings[i];
      try {
        await addSensorReading(user.id, reading);
        successCount++;
        
        // Log progress every 10 readings
        if ((i + 1) % 10 === 0 || i === history.readings.length - 1) {
          console.log(`  Progress: ${i + 1}/${history.readings.length} readings migrated`);
        }
      } catch (error) {
        errorCount++;
        console.error(`  ❌ Error migrating reading from ${reading.timestamp}:`, error);
      }
    }

    console.log('\n✅ Migration complete!');
    console.log(`   Successfully migrated: ${successCount} readings`);
    if (errorCount > 0) {
      console.log(`   Errors: ${errorCount} readings`);
    }
    console.log(`\n📝 User ID for future reference: ${user.id}`);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });

