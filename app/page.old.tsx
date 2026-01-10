'use client';

import { useState, useEffect } from 'react';
import { WQIScore, SensorReading, Recommendation } from '@/types';
import WQIGauge from '@/components/WQIGauge';
import WaterQualityChart from '@/components/WaterQualityChart';
import WQIBreakdown from '@/components/WQIBreakdown';
import RecommendationsList from '@/components/RecommendationsList';
import SensorDataTable from '@/components/SensorDataTable';
import { format } from 'date-fns';

export default function Dashboard() {
  const [wqi, setWqi] = useState<WQIScore | null>(null);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastScanTime, setLastScanTime] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'sensor' | 'recommendations'>('sensor');

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch WQI data
      const wqiResponse = await fetch('/api/wqi');
      if (wqiResponse.ok) {
        const wqiData = await wqiResponse.json();
        setWqi(wqiData);
        setLatestReading(wqiData.latestReading);
        
        // Use 24h readings for chart, or fallback to latest reading
        if (wqiData.readings24h && wqiData.readings24h.length > 0) {
          setReadings(wqiData.readings24h);
        } else {
          setReadings([wqiData.latestReading]);
        }
      }

      // Fetch recommendations
      const recResponse = await fetch('/api/recommendations');
      if (recResponse.ok) {
        const recData = await recResponse.json();
        setRecommendations(recData.recommendations || []);
      }

      setLastScanTime(new Date().toISOString());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateNewScan = async () => {
    try {
      setIsSimulating(true);
      const response = await fetch('/api/sensor-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh data after adding new reading
        await fetchData();
      }
    } catch (error) {
      console.error('Error simulating scan:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !wqi) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading water quality data...</p>
        </div>
      </div>
    );
  }

  if (!wqi || !latestReading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Data Available</h2>
          <p className="text-gray-600 mb-6">No sensor data has been recorded yet.</p>
          <button
            onClick={simulateNewScan}
            disabled={isSimulating}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSimulating ? 'Simulating...' : 'Generate Initial Data'}
          </button>
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
                IMTA Aquaculture Farm
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Water Quality Monitoring Dashboard
              </p>
            </div>
            <div className="mt-2 sm:mt-0 text-sm text-gray-600">
              {lastScanTime && (
                <p>Last scan: {format(new Date(lastScanTime), 'PPpp')}</p>
              )}
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
                <WaterQualityChart readings={readings.length > 0 ? readings : [latestReading]} />
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
            Simulated data for prototype demonstration
          </p>
          <button
            onClick={simulateNewScan}
            disabled={isSimulating || loading}
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

