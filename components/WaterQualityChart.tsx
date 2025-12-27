'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SensorReading } from '@/types';
import { format } from 'date-fns';

interface WaterQualityChartProps {
  readings: SensorReading[];
}

export default function WaterQualityChart({ readings }: WaterQualityChartProps) {
  // Prepare data for chart (last 24 hours, sample every hour for performance)
  const chartData = readings
    .filter((_, index) => index % 4 === 0) // Sample every hour (4 readings per hour)
    .map((reading) => ({
      time: format(new Date(reading.timestamp), 'HH:mm'),
      timestamp: reading.timestamp,
      Temperature: reading.temperature,
      pH: reading.ph,
      'DO (mg/L)': reading.do,
      Turbidity: reading.turbidity,
      Ammonia: reading.ammonia,
      Salinity: reading.salinity,
    }));

  return (
    <div className="w-full h-64 sm:h-80 bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Water Quality Trends (24h)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="Temperature" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={false}
            name="Temperature (°C)"
          />
          <Line 
            type="monotone" 
            dataKey="pH" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={false}
            name="pH"
          />
          <Line 
            type="monotone" 
            dataKey="DO (mg/L)" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={false}
            name="DO (mg/L)"
          />
          <Line 
            type="monotone" 
            dataKey="Turbidity" 
            stroke="#f59e0b" 
            strokeWidth={2}
            dot={false}
            name="Turbidity (NTU)"
          />
          <Line 
            type="monotone" 
            dataKey="Ammonia" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            dot={false}
            name="Ammonia (mg/L)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

