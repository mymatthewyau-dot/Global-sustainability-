'use client';

import { SensorReading } from '@/types';
import { format } from 'date-fns';

interface SensorDataTableProps {
  reading: SensorReading;
}

export default function SensorDataTable({ reading }: SensorDataTableProps) {
  const parameters = [
    { label: 'Temperature', value: `${reading.temperature}°C`, unit: '°C' },
    { label: 'pH', value: reading.ph.toFixed(2), unit: '' },
    { label: 'Dissolved Oxygen', value: `${reading.do} mg/L`, unit: 'mg/L' },
    { label: 'TSS', value: `${reading.tss} mg/L`, unit: 'mg/L' },
    { label: 'Salinity', value: `${reading.salinity} ppt`, unit: 'ppt' },
    { label: 'Ammonia (TAN)', value: `${reading.ammonia} mg/L`, unit: 'mg/L' },
    { label: 'Alkalinity', value: `${reading.alkalinity} mg/L CaCO₃`, unit: 'mg/L CaCO₃' },
  ];

  return (
    <div className="w-full bg-white rounded-lg shadow p-4 overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Current Sensor Readings</h3>
      <div className="mb-2 text-sm text-gray-600">
        Last updated: {format(new Date(reading.timestamp), 'PPpp')}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-3 font-semibold text-gray-700">Parameter</th>
            <th className="text-right py-2 px-3 font-semibold text-gray-700">Value</th>
            <th className="text-left py-2 px-3 font-semibold text-gray-700">Unit</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((param, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-2 px-3 text-gray-800">{param.label}</td>
              <td className="py-2 px-3 text-right font-medium text-gray-900">{param.value}</td>
              <td className="py-2 px-3 text-gray-600">{param.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
