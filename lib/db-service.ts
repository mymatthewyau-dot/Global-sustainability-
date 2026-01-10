import { admin } from './instantdb';
import { SensorReading, User, WQIScore, FeedHistory, SpeciesAdded, Milestone, Aquafarm } from '@/types';

// Check if InstantDB is configured
const isInstantDBConfigured = () => {
  return admin !== null;
};

// Throw error if InstantDB is not configured (no fallbacks)
const requireInstantDB = () => {
  if (!isInstantDBConfigured()) {
    throw new Error('InstantDB is not configured. Please configure InstantDB to use this feature.');
  }
};

/**
 * User Management Functions
 */
export async function createUser(email: string, name: string): Promise<User> {
  if (!isInstantDBConfigured()) {
    throw new Error('InstantDB is not configured. Cannot create user.');
  }

  const now = Date.now();
  const userId = admin!.id(); // Generate new ID
  const user = {
    id: userId,
    email,
    name,
    createdAt: now,
    updatedAt: now,
  };

  const result = await admin!.transact([
    admin!.tx.users[userId].update(user),
  ]);

  return result.data.users[0] as User;
}

export async function getUserById(userId: string): Promise<User | null> {
  if (!isInstantDBConfigured()) {
    return null;
  }

  const result = await admin!.query({
    users: {
      $: { where: { id: userId } },
    },
  });

  return result.data.users[0] || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (!isInstantDBConfigured()) {
    return null;
  }

  const result = await admin!.query({
    users: {
      $: { where: { email } },
    },
  });

  return result.data.users[0] || null;
}

/**
 * Sensor Reading Management Functions
 */
export async function addSensorReading(
  userId: string,
  reading: Omit<SensorReading, 'id' | 'userId' | 'createdAt'>
): Promise<SensorReading> {
  requireInstantDB();

  const now = Date.now();
  const readingData = {
    ...reading,
    userId,
    createdAt: now,
  };

  const result = await admin!.transact([
    admin!.tx.sensorReadings[admin!.id()].update(readingData),
  ]);

  return result.data.sensorReadings[0] as SensorReading;
}

export async function getLatestReading(userId: string): Promise<SensorReading | null> {
  requireInstantDB();

  const result = await admin!.query({
    sensorReadings: {
      $: {
        where: { userId },
        order: { createdAt: 'desc' },
        limit: 1,
      },
    },
  });

  return result.data.sensorReadings[0] || null;
}

export async function getLast24Hours(userId: string): Promise<SensorReading[]> {
  requireInstantDB();

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const startTimestamp = twentyFourHoursAgo.toISOString();
  const endTimestamp = now.toISOString();

  const result = await admin!.query({
    sensorReadings: {
      $: {
        where: {
          userId,
          timestamp: { $gte: startTimestamp, $lte: endTimestamp },
        },
        order: { timestamp: 'asc' },
      },
    },
  });

  return result.data.sensorReadings || [];
}

export async function getHistoricalReadings(
  userId: string,
  days: number
): Promise<SensorReading[]> {
  requireInstantDB();

  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const startTimestamp = startDate.toISOString();
  const endTimestamp = now.toISOString();

  const result = await admin!.query({
    sensorReadings: {
      $: {
        where: {
          userId,
          timestamp: { $gte: startTimestamp, $lte: endTimestamp },
        },
        order: { timestamp: 'asc' },
      },
    },
  });

  return result.data.sensorReadings || [];
}

export async function getAllUserReadings(
  userId: string,
  limit?: number
): Promise<SensorReading[]> {
  requireInstantDB();

  const query: any = {
    sensorReadings: {
      $: {
        where: { userId },
        order: { timestamp: 'desc' },
      },
    },
  };

  if (limit) {
    query.sensorReadings.$.limit = limit;
  }

  const result = await admin!.query(query);
  return result.data.sensorReadings || [];
}

/**
 * WQI Score Management Functions
 */
export async function saveWQIScore(
  userId: string,
  readingId: string,
  wqiScore: Omit<WQIScore, 'id' | 'userId' | 'readingId' | 'createdAt'>
): Promise<WQIScore> {
  requireInstantDB();

  const now = Date.now();
  const scoreData = {
    ...wqiScore,
    userId,
    readingId,
    createdAt: now,
  };

  const result = await admin!.transact([
    admin!.tx.wqiScores[admin!.id()].update(scoreData),
  ]);

  return result.data.wqiScores[0] as WQIScore;
}

export async function getWQIScoresByUser(
  userId: string,
  limit?: number
): Promise<WQIScore[]> {
  requireInstantDB();

  const query: any = {
    wqiScores: {
      $: {
        where: { userId },
        order: { createdAt: 'desc' },
      },
    },
  };

  if (limit) {
    query.wqiScores.$.limit = limit;
  }

  const result = await admin!.query(query);
  return result.data.wqiScores || [];
}

/**
 * Data Manipulation / Analytics Functions
 */
export async function getAverageReadingsByParameter(
  userId: string,
  days: number = 7
): Promise<Record<string, number>> {
  requireInstantDB();

  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const startTimestamp = startDate.toISOString();
  const endTimestamp = now.toISOString();

  const result = await admin!.query({
    sensorReadings: {
      $: {
        where: {
          userId,
          timestamp: { $gte: startTimestamp, $lte: endTimestamp },
        },
      },
    },
  });

  const readings = result.data.sensorReadings || [];

  if (readings.length === 0) {
    return {};
  }

  const parameters = ['temperature', 'ph', 'do', 'turbidity', 'salinity', 'ammonia', 'tn', 'tp'];
  const averages: Record<string, number> = {};

  parameters.forEach((param) => {
    const values = readings.map((r) => r[param as keyof SensorReading] as number);
    const sum = values.reduce((acc, val) => acc + val, 0);
    averages[param] = parseFloat((sum / values.length).toFixed(2));
  });

  return averages;
}

export async function getTrendData(
  userId: string,
  parameter: keyof SensorReading,
  days: number = 30
): Promise<{ timestamp: string; value: number }[]> {
  requireInstantDB();

  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const startTimestamp = startDate.toISOString();
  const endTimestamp = now.toISOString();

  const result = await admin!.query({
    sensorReadings: {
      $: {
        where: {
          userId,
          timestamp: { $gte: startTimestamp, $lte: endTimestamp },
        },
        order: { timestamp: 'asc' },
      },
    },
  });

  const readings = result.data.sensorReadings || [];

  return readings.map((reading) => ({
    timestamp: reading.timestamp,
    value: reading[parameter] as number,
  }));
}

/**
 * Feed History Management Functions
 */
export async function addFeedHistory(
  userId: string,
  feedData: Omit<FeedHistory, 'id' | 'userId' | 'createdAt'>
): Promise<FeedHistory> {
  requireInstantDB();

  const now = Date.now();
  const feedEntry = {
    ...feedData,
    userId,
    createdAt: now,
  };

  const result = await admin!.transact([
    admin!.tx.feedHistory[admin!.id()].update(feedEntry),
  ]);

  return result.data.feedHistory[0] as FeedHistory;
}

export async function getFeedHistory(
  userId: string,
  limit?: number
): Promise<FeedHistory[]> {
  requireInstantDB();

  const query: any = {
    feedHistory: {
      $: {
        where: { userId },
        order: { timestamp: 'desc' },
      },
    },
  };

  if (limit) {
    query.feedHistory.$.limit = limit;
  }

  const result = await admin!.query(query);
  return result.data.feedHistory || [];
}

export async function updateFeedHistory(
  feedId: string,
  userId: string,
  updates: Partial<Omit<FeedHistory, 'id' | 'userId' | 'createdAt'>>
): Promise<FeedHistory> {
  requireInstantDB();

  const result = await admin!.transact([
    admin!.tx.feedHistory[feedId].update(updates),
  ]);

  return result.data.feedHistory[0] as FeedHistory;
}

export async function deleteFeedHistory(feedId: string): Promise<void> {
  requireInstantDB();

  await admin!.transact([admin!.tx.feedHistory[feedId].delete()]);
}

/**
 * Species Added Management Functions
 */
export async function addSpecies(
  userId: string,
  speciesData: Omit<SpeciesAdded, 'id' | 'userId' | 'createdAt'>
): Promise<SpeciesAdded> {
  requireInstantDB();

  const now = Date.now();
  const speciesEntry = {
    ...speciesData,
    userId,
    createdAt: now,
  };

  const result = await admin!.transact([
    admin!.tx.speciesAdded[admin!.id()].update(speciesEntry),
  ]);

  return result.data.speciesAdded[0] as SpeciesAdded;
}

export async function getSpeciesAdded(
  userId: string,
  limit?: number
): Promise<SpeciesAdded[]> {
  requireInstantDB();

  const query: any = {
    speciesAdded: {
      $: {
        where: { userId },
        order: { dateAdded: 'desc' },
      },
    },
  };

  if (limit) {
    query.speciesAdded.$.limit = limit;
  }

  const result = await admin!.query(query);
  return result.data.speciesAdded || [];
}

export async function updateSpecies(
  speciesId: string,
  userId: string,
  updates: Partial<Omit<SpeciesAdded, 'id' | 'userId' | 'createdAt'>>
): Promise<SpeciesAdded> {
  requireInstantDB();

  const result = await admin!.transact([
    admin!.tx.speciesAdded[speciesId].update(updates),
  ]);

  return result.data.speciesAdded[0] as SpeciesAdded;
}

export async function deleteSpecies(speciesId: string): Promise<void> {
  requireInstantDB();

  await admin!.transact([admin!.tx.speciesAdded[speciesId].delete()]);
}

/**
 * Milestone Management Functions
 */
export async function addMilestone(
  userId: string,
  milestoneData: Omit<Milestone, 'id' | 'userId' | 'createdAt'>
): Promise<Milestone> {
  requireInstantDB();

  const now = Date.now();
  const milestone = {
    ...milestoneData,
    userId,
    createdAt: now,
  };

  const result = await admin!.transact([
    admin!.tx.milestones[admin!.id()].update(milestone),
  ]);

  return result.data.milestones[0] as Milestone;
}

export async function getMilestones(
  userId: string,
  limit?: number
): Promise<Milestone[]> {
  requireInstantDB();

  const query: any = {
    milestones: {
      $: {
        where: { userId },
        order: { dateAchieved: 'desc' },
      },
    },
  };

  if (limit) {
    query.milestones.$.limit = limit;
  }

  const result = await admin!.query(query);
  return result.data.milestones || [];
}

/**
 * Aquafarm Management Functions
 */
export async function createAquafarm(
  userId: string,
  farmData: Omit<Aquafarm, 'id' | 'userId' | 'createdAt'>
): Promise<Aquafarm> {
  requireInstantDB();

  const now = Date.now();
  const farm = {
    ...farmData,
    userId,
    createdAt: now,
  };

  const result = await admin!.transact([
    admin!.tx.aquafarms[admin!.id()].update(farm),
  ]);

  return result.data.aquafarms[0] as Aquafarm;
}

export async function getAquafarm(userId: string): Promise<Aquafarm | null> {
  requireInstantDB();

  const result = await admin!.query({
    aquafarms: {
      $: {
        where: { userId },
        limit: 1,
      },
    },
  });

  return result.data.aquafarms[0] || null;
}

export async function updateAquafarm(
  farmId: string,
  userId: string,
  updates: Partial<Omit<Aquafarm, 'id' | 'userId' | 'createdAt'>>
): Promise<Aquafarm> {
  requireInstantDB();

  const result = await admin!.transact([
    admin!.tx.aquafarms[farmId].update(updates),
  ]);

  return result.data.aquafarms[0] as Aquafarm;
}

