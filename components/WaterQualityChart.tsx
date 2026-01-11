'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SensorReading } from '@/types';
import { format } from 'date-fns';

interface WaterQualityChartProps {
  readings: SensorReading[];
}

interface ParameterConfig {
  key: string;
  label: string;
  dataKey: string;
  unit: string;
  color: string;
  domain: [number, number];
  icon: string;
}

const PARAMETERS: ParameterConfig[] = [
  {
    key: 'temperature',
    label: 'Temperature',
    dataKey: 'temperature',
    unit: '°C',
    color: '#ef4444',
    domain: [15, 40],
    icon: '🌡️',
  },
  {
    key: 'ph',
    label: 'pH',
    dataKey: 'ph',
    unit: '',
    color: '#3b82f6',
    domain: [6, 10],
    icon: '⚗️',
  },
  {
    key: 'do',
    label: 'Dissolved Oxygen',
    dataKey: 'do',
    unit: 'mg/L',
    color: '#10b981',
    domain: [0, 12],
    icon: '💨',
  },
  {
    key: 'tss',
    label: 'TSS',
    dataKey: 'tss',
    unit: 'mg/L',
    color: '#f59e0b',
    domain: [0, 1000],
    icon: '🌊',
  },
  {
    key: 'ammonia',
    label: 'Ammonia (TAN)',
    dataKey: 'ammonia',
    unit: 'mg/L',
    color: '#8b5cf6',
    domain: [0, 3],
    icon: '🧪',
  },
  {
    key: 'salinity',
    label: 'Salinity',
    dataKey: 'salinity',
    unit: 'ppt',
    color: '#06b6d4',
    domain: [0, 45],
    icon: '🧂',
  },
  {
    key: 'alkalinity',
    label: 'Alkalinity',
    dataKey: 'alkalinity',
    unit: 'mg/L CaCO₃',
    color: '#14b8a6',
    domain: [0, 250],
    icon: '🔬',
  },
];

export default function WaterQualityChart({ readings }: WaterQualityChartProps) {
  const [activeTab, setActiveTab] = useState<string>('temperature');

  // Prepare data for chart (last 24 hours, sample every hour for performance)
  const chartData = [...readings]
    // Sort chronologically (oldest to newest) for proper X-axis display
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .filter((_, index) => index % 4 === 0) // Sample every hour (4 readings per hour)
    .map((reading) => ({
      time: format(new Date(reading.timestamp), 'HH:mm'),
      timestamp: reading.timestamp,
      temperature: reading.temperature,
      ph: reading.ph,
      do: reading.do,
      tss: reading.tss,
      ammonia: reading.ammonia,
      salinity: reading.salinity,
      alkalinity: reading.alkalinity,
    }));

  const activeParameter = PARAMETERS.find((p) => p.key === activeTab) || PARAMETERS[0];

  return (
    <div className="w-full bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Water Quality Trends (24h)</h3>
      
      {/* Tab Navigation */}
      <div className="mb-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-2 overflow-x-auto">
          {PARAMETERS.map((param) => (
            <button
              key={param.key}
              onClick={() => setActiveTab(param.key)}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === param.key
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="mr-1">{param.icon}</span>
              <span className="hidden sm:inline">{param.label}</span>
              <span className="sm:hidden">{param.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Display */}
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="time"
              stroke="#6b7280"
              fontSize={12}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tick={{ fill: '#6b7280' }}
              domain={activeParameter.domain}
              label={{
                value: `${activeParameter.label} (${activeParameter.unit})`,
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#6b7280' },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [
                `${value.toFixed(2)} ${activeParameter.unit}`,
                activeParameter.label,
              ]}
            />
            <Line
              type="monotone"
              dataKey={activeParameter.dataKey}
              stroke={activeParameter.color}
              strokeWidth={2}
              dot={{ fill: activeParameter.color, r: 3 }}
              activeDot={{ r: 5 }}
              name={`${activeParameter.label} (${activeParameter.unit})`}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Parameter Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{activeParameter.icon}</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {activeParameter.label} ({activeParameter.unit})
            </p>
            <p className="text-xs text-gray-600">
              Range: {activeParameter.domain[0]} - {activeParameter.domain[1]} {activeParameter.unit}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
