import { init, tx, id } from '@instantdb/react';

const APP_ID = '0ff4c356-edb9-4b27-b6e6-7e1e32c7ccd8';

// Define your schema types for InstantDB
type Schema = {
  farms: {
    id: string;
    name: string;
    location?: string;
    imtaStartDate: number; // Unix timestamp
    createdAt: number; // Unix timestamp
    ownerId: string; // InstantDB auth user ID
  };
  sensorReadings: {
    id: string;
    farmId: string;
    timestamp: number; // Unix timestamp
    temperature: number;
    ph: number;
    do: number;
    turbidity: number;
    salinity: number;
    ammonia: number;
    tn: number;
    tp: number;
    wqiScore: number;
  };
  activities: {
    id: string;
    farmId: string;
    timestamp: number; // Unix timestamp
    type: string; // 'feed' | 'species_added' | 'species_removed' | 'maintenance'
    species?: string;
    feedAmount?: number; // kg
    feedType?: string;
    notes?: string;
  };
  milestones: {
    id: string;
    farmId: string;
    achievedAt: number; // Unix timestamp
    type: string; // 'wqi_improved_10' | 'wqi_improved_25' | 'wqi_improved_50' | '30_days_tracked' | '60_days_tracked' | '90_days_tracked'
    baselineWqi: number;
    currentWqi: number;
    improvementPercent: number;
  };
};

// Initialize InstantDB with your schema
export const db = init({ appId: APP_ID });

// Helper functions for transactions
export { tx, id };

// Type exports for use in components
export type { Schema };

