// InstantDB schema definition
// Note: InstantDB infers schema automatically from data
// This file is kept for documentation purposes

export const schema = {
  users: {
    id: { type: 'string' },
    email: { type: 'string' },
    name: { type: 'string' },
    createdAt: { type: 'number' },
    updatedAt: { type: 'number' },
  },
  sensorReadings: {
    id: { type: 'string' },
    farmId: { type: 'string' },
    timestamp: { type: 'number' },
    dissolvedOxygen: { type: 'number' },  // mg/L
    phosphorus: { type: 'number' },        // mg/L — Total Phosphorus
    nitrogen: { type: 'number' },          // mg/L — Total Nitrogen
    stockingDensity: { type: 'number' },   // fish/m³
    wqiScore: { type: 'number' },
  },
  farms: {
    id: { type: 'string' },
    ownerId: { type: 'string' },
    name: { type: 'string' },
    location: { type: 'string' },
    imtaStartDate: { type: 'number' },
    initialStockingDensity: { type: 'number' },
    createdAt: { type: 'number' },
  },
};
