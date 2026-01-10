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
    userId: { type: 'string' },
    timestamp: { type: 'string' },
    temperature: { type: 'number' },
    ph: { type: 'number' },
    do: { type: 'number' },
    turbidity: { type: 'number' },
    salinity: { type: 'number' },
    ammonia: { type: 'number' },
    tn: { type: 'number' },
    tp: { type: 'number' },
    createdAt: { type: 'number' },
  },
  wqiScores: {
    id: { type: 'string' },
    userId: { type: 'string' },
    readingId: { type: 'string' },
    overall: { type: 'number' },
    category: { type: 'string' },
    trendAnalysis: { type: 'string' },
    createdAt: { type: 'number' },
  },
  feedHistory: {
    id: { type: 'string' },
    userId: { type: 'string' },
    feedType: { type: 'string' },
    quantity: { type: 'number' },
    timestamp: { type: 'string' },
    notes: { type: 'string' },
    createdAt: { type: 'number' },
  },
  speciesAdded: {
    id: { type: 'string' },
    userId: { type: 'string' },
    speciesName: { type: 'string' },
    quantity: { type: 'number' },
    dateAdded: { type: 'string' },
    notes: { type: 'string' },
    createdAt: { type: 'number' },
  },
  milestones: {
    id: { type: 'string' },
    userId: { type: 'string' },
    milestoneType: { type: 'string' },
    description: { type: 'string' },
    dateAchieved: { type: 'string' },
    metrics: { type: 'string' },
    createdAt: { type: 'number' },
  },
  aquafarms: {
    id: { type: 'string' },
    userId: { type: 'string' },
    name: { type: 'string' },
    location: { type: 'string' },
    imtaStartDate: { type: 'string' },
    createdAt: { type: 'number' },
  },
};

