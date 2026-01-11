'use client';

import { useMemo, useState } from 'react';
import { db } from '@/lib/instant';
import { useFarm } from '@/lib/farm-context';
import { SensorReading } from '@/types';
import { convertToSensorReading } from '@/lib/sensor-data-instant';
import {
  calculateBaseline,
  calculateImprovement,
  calculateRollingAverage,
  getTrendData,
} from '@/lib/baseline-calculator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, startOfDay } from 'date-fns';

export default function TrendAnalysis() {
  const { farm } = useFarm();
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90' | 'all'>('30');

  // Query all sensor readings
  const sensorQuery = farm
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
  const { isLoading, data } = db.useQuery(sensorQuery as any) as {
    isLoading: boolean;
    data?: { sensorReadings?: any[] };
  };

  const readings: SensorReading[] = useMemo(() => {
    if (!data?.sensorReadings) return [];
    return data.sensorReadings.map(convertToSensorReading);
  }, [data]);

  // Calculate baseline (first 30 days)
  const baseline = useMemo(() => {
    if (!farm || readings.length === 0) return null;
    return calculateBaseline(readings, farm.imtaStartDate);
  }, [readings, farm]);

  // Get current average (last 7 days)
  const currentAverage = useMemo(() => {
    return calculateRollingAverage(readings, 7);
  }, [readings]);

  // Calculate improvement
  const improvement = useMemo(() => {
    if (!baseline || !currentAverage) return null;
    return calculateImprovement(baseline.averageWqi, currentAverage);
  }, [baseline, currentAverage]);

  // Get trend data for chart
  const trendData = useMemo(() => {
    const days = timeRange === 'all' ? undefined : parseInt(timeRange);
    return getTrendData(readings, days);
  }, [readings, timeRange]);

  // Format data for Recharts - aggregate by day for cleaner X-axis
  const chartData = useMemo(() => {
    if (trendData.length === 0) return [];

    // Group readings by day
    const dailyMap = new Map<string, { timestamps: string[]; wqiSum: number; count: number }>();
    
    trendData.forEach((point) => {
      const date = startOfDay(new Date(point.timestamp));
      const dateKey = date.toISOString();
      
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { timestamps: [], wqiSum: 0, count: 0 });
      }
      
      const dayData = dailyMap.get(dateKey)!;
      dayData.timestamps.push(point.timestamp);
      dayData.wqiSum += point.wqi;
      dayData.count += 1;
    });

    // Convert to array and sort chronologically
    const dailyData = Array.from(dailyMap.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([dateKey, data]) => ({
        timestamp: format(new Date(dateKey), 'MMM dd'),
        fullTimestamp: dateKey,
        WQI: parseFloat((data.wqiSum / data.count).toFixed(1)),
        readingsCount: data.count,
      }));

    return dailyData;
  }, [trendData]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Trend Analysis</h2>
        <p className="text-gray-500 text-center py-12">
          No data available yet. Add sensor readings to see trends.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2 sm:mb-0">
          WQI Trend Analysis
        </h2>

        {/* Time Range Selector */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Key Metrics */}
      {baseline && currentAverage && improvement !== null && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Baseline WQI</p>
            <p className="text-2xl font-bold text-gray-900">
              {baseline.averageWqi.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">First 30 days</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Current Average</p>
            <p className="text-2xl font-bold text-gray-900">
              {currentAverage.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </div>

          <div
            className={`rounded-lg p-4 ${
              improvement >= 0 ? 'bg-green-50' : 'bg-red-50'
            }`}
          >
            <p className="text-sm text-gray-600 mb-1">Improvement</p>
            <p
              className={`text-2xl font-bold ${
                improvement >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {improvement >= 0 ? '+' : ''}
              {improvement.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Since IMTA</p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              label={{ value: 'WQI Score', angle: -90, position: 'insideLeft' }}
              domain={[0, 100]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const readingsCount = payload[0].payload.readingsCount;
                  return (
                    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                      <p className="text-sm text-gray-600">
                        {format(new Date(payload[0].payload.fullTimestamp), 'PP')}
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        WQI: {payload[0].value}
                      </p>
                      {readingsCount > 1 && (
                        <p className="text-xs text-gray-500">
                          Daily avg ({readingsCount} readings)
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            {baseline && (
              <ReferenceLine
                y={baseline.averageWqi}
                stroke="#94a3b8"
                strokeDasharray="5 5"
                label={{ value: 'Baseline', position: 'right', fill: '#64748b' }}
              />
            )}
            <Line
              type="monotone"
              dataKey="WQI"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {baseline && (
        <div className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          <p>
            <strong>Baseline Period:</strong>{' '}
            {format(new Date(baseline.startDate), 'PP')} -{' '}
            {format(new Date(baseline.endDate), 'PP')} ({baseline.readingsCount}{' '}
            readings)
          </p>
        </div>
      )}
    </div>
  );
}

