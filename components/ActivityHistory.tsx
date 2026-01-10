'use client';

import { useMemo, useState } from 'react';
import { db } from '@/lib/instant';
import { useFarm } from '@/lib/farm-context';
import { Activity } from '@/types';
import { format } from 'date-fns';

export default function ActivityHistory() {
  const { farm } = useFarm();
  const [filterType, setFilterType] = useState<string>('all');

  // Real-time query for activities
  const activitiesQuery = farm
    ? {
        activities: {
          $: {
            where: {
              farmId: farm.id,
            },
          },
        },
      }
    : null;
  const { isLoading, data } = db.useQuery(activitiesQuery as any) as {
    isLoading: boolean;
    data?: { activities?: any[] };
  };

  // Convert and sort activities
  const activities: Activity[] = useMemo(() => {
    if (!data?.activities) return [];
    return data.activities
      .map((a: any) => ({
        id: a.id,
        farmId: a.farmId,
        timestamp: new Date(a.timestamp).toISOString(),
        type: a.type,
        species: a.species,
        feedAmount: a.feedAmount,
        feedType: a.feedType,
        notes: a.notes,
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [data]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (filterType === 'all') return activities;
    return activities.filter((a) => a.type === filterType);
  }, [activities, filterType]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'feed':
        return '🍽️';
      case 'species_added':
        return '➕';
      case 'species_removed':
        return '🎣';
      case 'maintenance':
        return '🔧';
      default:
        return '📝';
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'feed':
        return 'Feeding';
      case 'species_added':
        return 'Species Added';
      case 'species_removed':
        return 'Species Removed';
      case 'maintenance':
        return 'Maintenance';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2 sm:mb-0">
          Activity History
        </h2>

        {/* Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="all">All Activities</option>
          <option value="feed">Feeding</option>
          <option value="species_added">Species Added</option>
          <option value="species_removed">Species Removed</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No activities recorded yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Start logging your farm activities above
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {getActivityLabel(activity.type)}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {format(new Date(activity.timestamp), 'PPp')}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    {activity.species && (
                      <p>
                        <span className="font-medium">Species:</span> {activity.species}
                      </p>
                    )}
                    {activity.feedAmount && (
                      <p>
                        <span className="font-medium">Amount:</span> {activity.feedAmount} kg
                      </p>
                    )}
                    {activity.feedType && (
                      <p>
                        <span className="font-medium">Type:</span> {activity.feedType}
                      </p>
                    )}
                    {activity.notes && (
                      <p className="text-gray-700 mt-2 italic">{activity.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

