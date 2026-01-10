'use client';

import { useMemo } from 'react';
import { db } from '@/lib/instant';
import { useFarm } from '@/lib/farm-context';
import { Milestone } from '@/types';
import { format } from 'date-fns';
import { getMilestoneDefinition, MILESTONE_DEFINITIONS } from '@/lib/milestone-detector';

export default function MilestoneDisplay() {
  const { farm } = useFarm();

  // Query milestones
  const milestonesQuery = farm
    ? {
        milestones: {
          $: {
            where: {
              farmId: farm.id,
            },
          },
        },
      }
    : null;
  const { isLoading, data } = db.useQuery(milestonesQuery as any) as {
    isLoading: boolean;
    data?: { milestones?: any[] };
  };

  const milestones: Milestone[] = useMemo(() => {
    if (!data?.milestones) return [];
    return data.milestones
      .map((m: any) => ({
        id: m.id,
        farmId: m.farmId,
        achievedAt: new Date(m.achievedAt).toISOString(),
        type: m.type,
        baselineWqi: m.baselineWqi,
        currentWqi: m.currentWqi,
        improvementPercent: m.improvementPercent,
      }))
      .sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime());
  }, [data]);

  // Calculate progress for upcoming milestones
  const achievedTypes = new Set(milestones.map((m) => m.type));
  const upcomingMilestones = MILESTONE_DEFINITIONS.filter(
    (def) => !achievedTypes.has(def.type)
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Milestones</h2>

      {/* Achieved Milestones */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          🏆 Achieved ({milestones.length})
        </h3>

        {milestones.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No milestones achieved yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Keep tracking your water quality to unlock achievements!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {milestones.map((milestone) => {
              const definition = getMilestoneDefinition(milestone.type as any);
              if (!definition) return null;

              return (
                <div
                  key={milestone.id}
                  className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{definition.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{definition.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {definition.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Achieved {format(new Date(milestone.achievedAt), 'PP')}
                      </p>
                      {milestone.improvementPercent > 0 && (
                        <p className="text-sm text-green-600 font-semibold mt-1">
                          +{milestone.improvementPercent.toFixed(1)}% improvement
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Milestones */}
      {upcomingMilestones.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            🎯 Upcoming ({upcomingMilestones.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {upcomingMilestones.map((definition) => (
              <div
                key={definition.type}
                className="bg-gray-50 border-2 border-gray-200 border-dashed rounded-lg p-4 opacity-60"
              >
                <div className="flex items-start gap-3">
                  <div className="text-4xl grayscale">{definition.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-700">{definition.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {definition.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">🔒 Not yet achieved</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

