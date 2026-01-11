'use client';

import { useState } from 'react';
import { useFarm } from '@/lib/farm-context';
import { addSensorReading } from '@/lib/sensor-data-instant';
import { calculateWQI } from '@/lib/wqi-calculator';

interface SensorFormData {
  temperature: string;
  ph: string;
  do: string;
  tss: string;
  salinity: string;
  ammonia: string;
  alkalinity: string;
}

const initialFormData: SensorFormData = {
  temperature: '',
  ph: '',
  do: '',
  tss: '',
  salinity: '',
  ammonia: '',
  alkalinity: '',
};

export default function SensorDataLogger() {
  const { farm } = useFarm();
  const [formData, setFormData] = useState<SensorFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (field: keyof SensorFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farm) return;

    // Validate all fields are filled
    const requiredFields = [
      'temperature',
      'ph',
      'do',
      'tss',
      'salinity',
      'ammonia',
      'alkalinity',
    ];
    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof SensorFormData]
    );

    if (missingFields.length > 0) {
      setErrorMessage('Please fill in all sensor parameters.');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const reading = {
        farmId: farm.id,
        timestamp: new Date().toISOString(),
        temperature: parseFloat(formData.temperature),
        ph: parseFloat(formData.ph),
        do: parseFloat(formData.do),
        tss: parseFloat(formData.tss),
        salinity: parseFloat(formData.salinity),
        ammonia: parseFloat(formData.ammonia),
        alkalinity: parseFloat(formData.alkalinity),
      };

      // Calculate WQI score
      const wqiScore = calculateWQI(reading);

      // Save to InstantDB
      await addSensorReading({ ...reading, wqiScore: wqiScore.overall });

      // Reset form
      setFormData(initialFormData);
      setSuccessMessage(
        `Sensor data logged successfully! WQI Score: ${wqiScore.overall.toFixed(1)}`
      );

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch {
      setErrorMessage('Failed to log sensor data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputFields = [
    {
      id: 'temperature',
      label: 'Temperature',
      unit: '°C',
      min: 0,
      max: 45,
      step: 0.1,
      placeholder: 'e.g., 28.0',
    },
    {
      id: 'ph',
      label: 'pH',
      unit: '',
      min: 0,
      max: 14,
      step: 0.01,
      placeholder: 'e.g., 8.0',
    },
    {
      id: 'do',
      label: 'Dissolved Oxygen',
      unit: 'mg/L',
      min: 0,
      max: 20,
      step: 0.1,
      placeholder: 'e.g., 5.5',
    },
    {
      id: 'tss',
      label: 'TSS (Total Suspended Solids)',
      unit: 'mg/L',
      min: 0,
      max: 1000,
      step: 1,
      placeholder: 'e.g., 450',
    },
    {
      id: 'salinity',
      label: 'Salinity',
      unit: 'ppt',
      min: 0,
      max: 50,
      step: 0.1,
      placeholder: 'e.g., 20.0',
    },
    {
      id: 'ammonia',
      label: 'Ammonia (TAN)',
      unit: 'mg/L',
      min: 0,
      max: 5,
      step: 0.01,
      placeholder: 'e.g., 0.5',
    },
    {
      id: 'alkalinity',
      label: 'Alkalinity',
      unit: 'mg/L CaCO₃',
      min: 0,
      max: 300,
      step: 1,
      placeholder: 'e.g., 120',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Log Sensor Reading
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Manually enter water quality parameters from your sensors.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {inputFields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}{' '}
                {field.unit && (
                  <span className="text-gray-500">({field.unit})</span>
                )}
                <span className="text-red-500"> *</span>
              </label>
              <input
                type="number"
                min={field.min}
                max={field.max}
                step={field.step}
                value={formData[field.id as keyof SensorFormData]}
                onChange={(e) =>
                  handleInputChange(
                    field.id as keyof SensorFormData,
                    e.target.value
                  )
                }
                placeholder={field.placeholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          ))}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? 'Logging Sensor Data...' : 'Log Sensor Reading'}
        </button>
      </form>
    </div>
  );
}
