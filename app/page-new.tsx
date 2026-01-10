'use client';

import { useState, useMemo } from 'react';
import { WQIScore, SensorReading, Recommendation } from '@/types';
import WQIGauge from '@/components/WQIGauge';
import WaterQualityChart from '@/components/WaterQualityChart';
import WQIBreakdown from '@/components/WQIBreakdown';
import RecommendationsList from '@/components/RecommendationsList';
import SensorDataTable from '@/components/SensorDataTable';
import AuthButton from '@/components/AuthButton';
import ProtectedRoute from '@/components/ProtectedRoute';
import { format } from 'date-fns';
import { db } from '@/lib/instant';
import { useFarm } from '@/lib/farm-context';
import { calculateWQI } from '@/lib/wqi-calculator';
import { generateRecommendations } from '@/lib/recommendations';
import { convertToSensorReading } from '@/lib/sensor-data-instant';

function DashboardContent() {
  const { farm } = useFarm();
  const [activeTab, setActiveTab] = useState<'sensor' | 'recommendations'>('sensor');
  const [isSimulating, setIsSimulating] = useState(false);

  // Real-time query for sensor readings
  const { isLoading, error, data } = db.useQuery(
    farm
      ? {
          sensorReadings: {
            $: {
              where: {
                farmId: farm.id,
              },
            },
          },
        }
      : null
  );

  // Convert InstantDB data to SensorReading format and sort by timestamp
  const readings: SensorReading[] = useMemo(() => {
    if (!data?.sensorReadings) return [];
    return data.sensorReadings
      .map(convertToSensorReading)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [data]);

  // Get latest reading
  const latestReading = readings[0] || null;

  // Get readings from last 24 hours
  const readings24h = useMemo(() => {
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    return readings.filter(
      (r) => new Date(r.timestamp).getTime() >= twentyFourHoursAgo
    );
  }, [readings]);

  // Calculate WQI for latest reading
  const wqi: WQIScore | null = useMemo(() => {
    if (!latestReading) return null;
    return calculateWQI(latestReading);
  }, [latestReading]);

  // Generate recommendations based on latest reading
  const recommendations: Recommendation[] = useMemo(() => {
    if (!latestReading || !wqi) return [];
    return generateRecommendations(latestReading, wqi);
  }, [latestReading, wqi]);

  const simulateNewScan = async () => {
    if (!farm) return;
    
    try {
      setIsSimulating(true);
      const response = await fetch('/api/sensor-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ farmId: farm.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to simulate scan');
      }

      // Data will automatically update via real-time query
    } catch (error) {
      console.error('Error simulating scan:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  if (isLoading || !farm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading water quality data...</p>
        </div>
      </div>
    );
  }

  if (!latestReading || !wqi) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {farm.name}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Water Quality Monitoring Dashboard
                </p>
              </div>
              <AuthButton />
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center p-4 mt-20">
          <div className="text-center bg-white rounded-lg shadow p-8 max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Data Available</h2>
            <p className="text-gray-600 mb-6">No sensor data has been recorded yet for {farm.name}.</p>
            <button
              onClick={simulateNewScan}
              disabled={isSimulating}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSimulating ? 'Generating...' : 'Generate Initial Data'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {farm.name}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Water Quality Monitoring Dashboard
                {farm.location && ` • ${farm.location}`}
              </p>
            </div>
            <div className="mt-2 sm:mt-0 flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <p>Last scan: {format(new Date(latestReading.timestamp), 'PPpp')}</p>
              </div>
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab Navigation */}
        <div className="mb-6 bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('sensor')}
                className={`flex-1 sm:flex-none px-4 sm:px-8 py-4 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                  activeTab === 'sensor'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">📊</span>
                Sensor Data Breakdown
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`flex-1 sm:flex-none px-4 sm:px-8 py-4 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                  activeTab === 'recommendations'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">💡</span>
                Recommendations
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'sensor' && (
          <div className="space-y-6 mb-6">
            {/* WQI Gauge Section */}
            <div>
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex flex-col items-center">
                  <WQIGauge wqi={wqi} />
                </div>
              </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Section 1: Water Quality Trends */}
              <div className="lg:col-span-2">
                <WaterQualityChart readings={readings24h.length > 0 ? readings24h : [latestReading]} />
              </div>

              {/* Section 2: Current Sensor Data */}
              <div>
                <SensorDataTable reading={latestReading} />
              </div>

              {/* Section 3: WQI Breakdown */}
              <div>
                <WQIBreakdown wqi={wqi} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="mb-6">
            <RecommendationsList recommendations={recommendations} />
          </div>
        )}

        {/* Footer with Simulate Button */}
        <footer className="bg-white rounded-lg shadow p-4 sm:p-6 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Simulated data for prototype demonstration • Real-time sync enabled
          </p>
          <button
            onClick={simulateNewScan}
            disabled={isSimulating}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSimulating ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Simulating...
              </>
            ) : (
              <>
                <span className="mr-2">🔄</span>
                Run New Scan
              </>
            )}
          </button>
        </footer>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

