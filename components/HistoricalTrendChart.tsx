'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { useAuth } from './AuthProvider';

type Timeframe = '24h' | '7d' | '30d' | '90d' | 'all-time';

interface WQITrendPoint {
  timestamp: string;
  wqi: number;
  category: string;
}

interface HistoricalTrendChartProps {
  imtaStartDate?: string;
}

export default function HistoricalTrendChart({ imtaStartDate }: HistoricalTrendChartProps) {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');
  const [wqiTrend, setWqiTrend] = useState<WQITrendPoint[]>([]);
  const [improvementMetrics, setImprovementMetrics] = useState<any>(null);
  const [beforeAfterIMTA, setBeforeAfterIMTA] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchTrendData = async () => {
      try {
        setLoading(true);
        const days = getDaysFromTimeframe(timeframe);
        const response = await fetch(`/api/trends?userId=${user.id}&days=${days}`, {
          headers: {
            'x-user-id': user.id,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setWqiTrend(data.wqiTrend || []);
          setImprovementMetrics(data.improvementMetrics);
          setBeforeAfterIMTA(data.beforeAfterIMTA);
        }
      } catch (error) {
        console.error('Error fetching trend data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, [user?.id, timeframe]);

  const getDaysFromTimeframe = (tf: Timeframe): number => {
    switch (tf) {
      case '24h':
        return 1;
      case '7d':
        return 7;
      case '30d':
        return 30;
      case '90d':
        return 90;
      case 'all-time':
        return 365; // Get up to a year
      default:
        return 30;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = parseISO(timestamp);
    if (timeframe === '24h') {
      return format(date, 'HH:mm');
    } else if (timeframe === '7d') {
      return format(date, 'MMM dd');
    } else {
      return format(date, 'MMM dd, yyyy');
    }
  };

  const formatDateKey = (timestamp: string) => {
    const date = parseISO(timestamp);
    return format(date, 'yyyy-MM-dd');
  };

  const getCategoryFromWQI = (wqi: number): string => {
    if (wqi >= 75) return 'Excellent';
    if (wqi >= 50) return 'Good';
    if (wqi >= 25) return 'Moderate';
    return 'Poor';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Excellent':
        return '#10b981';
      case 'Good':
        return '#3b82f6';
      case 'Moderate':
        return '#f59e0b';
      case 'Poor':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (wqiTrend.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 text-center">No trend data available for the selected timeframe.</p>
      </div>
    );
  }

  // Group data by day and calculate average WQI for each day
  const dailyData = new Map<string, { wqiSum: number; count: number; timestamp: string }>();
  
  wqiTrend.forEach((point) => {
    const dateKey = formatDateKey(point.timestamp);
    const existing = dailyData.get(dateKey);
    
    if (existing) {
      existing.wqiSum += point.wqi;
      existing.count += 1;
    } else {
      dailyData.set(dateKey, {
        wqiSum: point.wqi,
        count: 1,
        timestamp: point.timestamp,
      });
    }
  });

  // Convert to chart data with one point per day
  const chartData = Array.from(dailyData.entries())
    .map(([dateKey, data]) => {
      const avgWQI = data.wqiSum / data.count;
      return {
        timestamp: formatTimestamp(data.timestamp),
        fullTimestamp: data.timestamp,
        wqi: parseFloat(avgWQI.toFixed(2)),
        category: getCategoryFromWQI(avgWQI),
      };
    })
    .sort((a, b) => new Date(a.fullTimestamp).getTime() - new Date(b.fullTimestamp).getTime());

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Water Quality Index Trend</h3>
        <div className="flex flex-wrap gap-2">
          {(['24h', '7d', '30d', '90d', 'all-time'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tf === '24h' ? '24h' : tf === '7d' ? '7d' : tf === '30d' ? '30d' : tf === '90d' ? '90d' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {improvementMetrics && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Average WQI</p>
              <p className="font-semibold text-gray-900">{improvementMetrics.averageWQI}</p>
            </div>
            <div>
              <p className="text-gray-600">Best WQI</p>
              <p className="font-semibold text-green-600">{improvementMetrics.bestWQI}</p>
            </div>
            <div>
              <p className="text-gray-600">Improvement</p>
              <p
                className={`font-semibold ${
                  improvementMetrics.overallImprovement > 0
                    ? 'text-green-600'
                    : improvementMetrics.overallImprovement < 0
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {improvementMetrics.overallImprovement > 0 ? '+' : ''}
                {improvementMetrics.overallImprovement}%
              </p>
            </div>
            <div>
              <p className="text-gray-600">Trend</p>
              <p
                className={`font-semibold ${
                  improvementMetrics.trendDirection === 'improving'
                    ? 'text-green-600'
                    : improvementMetrics.trendDirection === 'declining'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {improvementMetrics.trendDirection === 'improving'
                  ? '↑ Improving'
                  : improvementMetrics.trendDirection === 'declining'
                  ? '↓ Declining'
                  : '→ Stable'}
              </p>
            </div>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="timestamp"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            domain={[0, 100]}
            label={{ value: 'WQI', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string, props: any) => [
              `${value.toFixed(2)} (${props.payload.category})`,
              'WQI',
            ]}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Legend />
          <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" label="Moderate Threshold" />
          <ReferenceLine y={75} stroke="#10b981" strokeDasharray="3 3" label="Good Threshold" />
          {imtaStartDate && (
            <ReferenceLine
              x={formatTimestamp(imtaStartDate)}
              stroke="#3b82f6"
              strokeDasharray="5 5"
              label="IMTA Start"
            />
          )}
          <Line
            type="monotone"
            dataKey="wqi"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="WQI"
          />
        </LineChart>
      </ResponsiveContainer>

      {beforeAfterIMTA && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">IMTA Impact Analysis</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-700 font-medium">Before IMTA</p>
              <p className="text-blue-900">Average WQI: {beforeAfterIMTA.before.averageWQI}</p>
              <p className="text-blue-600 text-xs">
                {format(parseISO(beforeAfterIMTA.before.dateRange.start), 'MMM dd, yyyy')} -{' '}
                {format(parseISO(beforeAfterIMTA.before.dateRange.end), 'MMM dd, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-blue-700 font-medium">After IMTA</p>
              <p className="text-blue-900">Average WQI: {beforeAfterIMTA.after.averageWQI}</p>
              <p className="text-blue-600 text-xs">
                {format(parseISO(beforeAfterIMTA.after.dateRange.start), 'MMM dd, yyyy')} -{' '}
                {format(parseISO(beforeAfterIMTA.after.dateRange.end), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-blue-900 font-semibold">
              Overall Improvement: {beforeAfterIMTA.improvementPercent > 0 ? '+' : ''}
              {beforeAfterIMTA.improvementPercent}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
