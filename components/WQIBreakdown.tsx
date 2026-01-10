'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { WQIScore } from '@/types';

interface WQIBreakdownProps {
  wqi: WQIScore;
}

export default function WQIBreakdown({ wqi }: WQIBreakdownProps) {
  const chartData = wqi.breakdown.map((item) => ({
    parameter: item.parameter,
    contribution: item.contribution,
    subIndex: item.subIndex,
    riskLevel: item.riskLevel,
  }));

  const getColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return '#10b981';
      case 'medium':
        return '#f59e0b';
      case 'high':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  // Find parameters with high risk
  const highRiskParams = wqi.breakdown
    .filter((item) => item.riskLevel === 'high')
    .map((item) => item.parameter);

  return (
    <div className="w-full bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">WQI Breakdown by Parameter</h3>
      {highRiskParams.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800">
            ⚠️ High Risk Parameters: {highRiskParams.join(', ')}
          </p>
        </div>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="parameter" 
            stroke="#6b7280"
            fontSize={11}
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            label={{ value: 'Contribution to WQI', angle: -90, position: 'center', dx: -10 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(value: number, name: string) => [
              `${value.toFixed(2)}`,
              name === 'contribution' ? 'Contribution' : 'Sub-Index'
            ]}
          />
          <Legend />
          <Bar dataKey="contribution" name="Contribution to WQI" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.riskLevel)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium mb-2">Trend Analysis:</p>
        <p>{wqi.trendAnalysis}</p>
      </div>
    </div>
  );
}

