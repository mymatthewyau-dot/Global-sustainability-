'use client';

import { useMemo, useEffect } from 'react';
import { db } from '@/lib/instant';
import { useFarm } from '@/lib/farm-context';
import { SensorReading, Milestone } from '@/types';
import { convertToSensorReading } from '@/lib/sensor-data-instant';
import { calculateBaseline, calculateRollingAverage, calculateImprovement } from '@/lib/baseline-calculator';
import { detectAndCreateMilestones } from '@/lib/milestone-detector';

export default function ImpactSummary() {
  const { farm } = useFarm();

  // Query sensor readings
  const readingsQuery = farm
    ? {
        sensorReadings: {
          $: {
            where: {
              farmId: farm.id,
            },
          },
        },
      }
    : null;
  const { data: readingsData } = db.useQuery(readingsQuery as any) as {
    data?: { sensorReadings?: any[] };
  };

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
  const { data: milestonesData } = db.useQuery(milestonesQuery as any) as {
    data?: { milestones?: any[] };
  };

  const readings: SensorReading[] = useMemo(() => {
    if (!readingsData?.sensorReadings) return [];
    return readingsData.sensorReadings.map(convertToSensorReading);
  }, [readingsData]);

  const milestones: Milestone[] = useMemo(() => {
    if (!milestonesData?.milestones) return [];
    return milestonesData.milestones.map((m: any) => ({
      id: m.id,
      farmId: m.farmId,
      achievedAt: new Date(m.achievedAt).toISOString(),
      type: m.type,
      baselineWqi: m.baselineWqi,
      currentWqi: m.currentWqi,
      improvementPercent: m.improvementPercent,
    }));
  }, [milestonesData]);

  // Auto-detect new milestones
  useEffect(() => {
    if (!farm || readings.length === 0) return;

    const checkMilestones = async () => {
      await detectAndCreateMilestones(farm.id, readings, milestones, farm.imtaStartDate);
    };

    checkMilestones();
  }, [farm, readings, milestones]);

  // Calculate metrics
  const baseline = useMemo(() => {
    if (!farm || readings.length === 0) return null;
    return calculateBaseline(readings, farm.imtaStartDate);
  }, [readings, farm]);

  const currentAverage = useMemo(() => {
    return calculateRollingAverage(readings, 7);
  }, [readings]);

  const improvement = useMemo(() => {
    if (!baseline || !currentAverage) return null;
    return calculateImprovement(baseline.averageWqi, currentAverage);
  }, [baseline, currentAverage]);

  const daysSinceImta = useMemo(() => {
    if (!farm) return 0;
    const start = new Date(farm.imtaStartDate).getTime();
    const now = Date.now();
    return Math.floor((now - start) / (24 * 60 * 60 * 1000));
  }, [farm]);

  // Estimate yield benefit (simple formula: 1% WQI improvement = 0.5% yield increase)
  const estimatedYieldIncrease = useMemo(() => {
    if (!improvement || improvement <= 0) return 0;
    return improvement * 0.5;
  }, [improvement]);

  // Eco-friendliness score (based on WQI and improvement)
  const ecoScore = useMemo(() => {
    if (!currentAverage) return 0;
    const baseScore = (currentAverage / 100) * 60; // Max 60 from current WQI
    const improvementBonus = improvement && improvement > 0 ? Math.min(improvement, 40) : 0; // Max 40 from improvement
    return Math.round(baseScore + improvementBonus);
  }, [currentAverage, improvement]);

  if (!farm || readings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">IMTA Impact Summary</h2>
        <p className="text-gray-500 text-center py-12">
          Add sensor data to see your IMTA impact
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">IMTA Impact Summary</h2>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Days Tracked */}
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">📅</div>
          <p className="text-3xl font-bold text-blue-600">{daysSinceImta}</p>
          <p className="text-sm text-gray-600 mt-1">Days Since IMTA</p>
        </div>

        {/* WQI Improvement */}
        <div className={`rounded-lg p-4 text-center ${improvement && improvement >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="text-3xl mb-2">📈</div>
          <p className={`text-3xl font-bold ${improvement && improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {improvement ? (improvement >= 0 ? '+' : '') + improvement.toFixed(1) + '%' : 'N/A'}
          </p>
          <p className="text-sm text-gray-600 mt-1">WQI Improvement</p>
        </div>

        {/* Eco Score */}
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">🌿</div>
          <p className="text-3xl font-bold text-green-600">{ecoScore}/100</p>
          <p className="text-sm text-gray-600 mt-1">Eco Score</p>
        </div>

        {/* Milestones */}
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">🏆</div>
          <p className="text-3xl font-bold text-purple-600">{milestones.length}</p>
          <p className="text-sm text-gray-600 mt-1">Milestones Achieved</p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="border-t border-gray-200 pt-6 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Water Quality Progress</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Baseline</span>
                <span>Current</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all"
                  style={{
                    width: `${currentAverage && baseline ? Math.min((currentAverage / baseline.averageWqi) * 50, 100) : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Estimated Benefits</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>
                Estimated yield increase:{' '}
                <strong className="text-green-600">+{estimatedYieldIncrease.toFixed(1)}%</strong>
              </span>
            </li>
            {improvement && improvement > 10 && (
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Reduced environmental impact from improved water quality</span>
              </li>
            )}
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Enhanced ecosystem balance through multi-trophic integration</span>
            </li>
          </ul>
        </div>

        {baseline && (
          <div className="bg-blue-50 rounded-lg p-4 text-sm">
            <p className="text-gray-700">
              <strong>Note:</strong> Baseline WQI of {baseline.averageWqi.toFixed(1)} was
              established from your first 30 days of tracking. Current 7-day average is{' '}
              {currentAverage?.toFixed(1) || 'N/A'}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

