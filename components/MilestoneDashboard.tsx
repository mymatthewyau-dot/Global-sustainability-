'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Milestone } from '@/types';
import MilestoneCard from './MilestoneCard';
import { format } from 'date-fns';

interface MilestoneMetrics {
  ecoFriendlinessScore: number;
  yieldImprovement: number;
  wqiImprovement: number;
  feedEfficiency: number;
  speciesDiversity: number;
  nutrientReduction: number;
}

interface IMTAImpact {
  before: { averageWQI: number; readingCount: number };
  after: { averageWQI: number; readingCount: number };
  improvement: number;
}

export default function MilestoneDashboard() {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [metrics, setMetrics] = useState<MilestoneMetrics | null>(null);
  const [imtaImpact, setImtaImpact] = useState<IMTAImpact | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchMilestones();
    }
  }, [user?.id]);

  const fetchMilestones = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/milestones?userId=${user.id}`, {
        headers: {
          'x-user-id': user.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMilestones(data.milestones || []);
        setMetrics(data.metrics);
        setImtaImpact(data.imtaImpact);
      }
    } catch (error) {
      console.error('Error fetching milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const recalculateMilestones = async () => {
    if (!user?.id) return;

    try {
      setRecalculating(true);
      const response = await fetch('/api/milestones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.newMilestones && data.newMilestones.length > 0) {
          // Refresh to get all milestones including new ones
          await fetchMilestones();
        }
        setMetrics(data.metrics);
        setImtaImpact(data.imtaImpact);
      }
    } catch (error) {
      console.error('Error recalculating milestones:', error);
    } finally {
      setRecalculating(false);
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

  const ecoMilestones = milestones.filter((m) => m.milestoneType === 'eco-friendliness');
  const yieldMilestones = milestones.filter((m) => m.milestoneType === 'yield');
  const stabilityMilestones = milestones.filter((m) => m.milestoneType === 'system-stability');

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      {metrics && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Performance Metrics</h3>
            <button
              onClick={recalculateMilestones}
              disabled={recalculating}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {recalculating ? 'Recalculating...' : 'Recalculate Milestones'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 font-medium">Eco-Friendliness</p>
              <p className="text-2xl font-bold text-green-900">
                {metrics.ecoFriendlinessScore.toFixed(1)}
              </p>
              <p className="text-xs text-green-600">Score</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">Yield Improvement</p>
              <p className="text-2xl font-bold text-blue-900">
                {metrics.yieldImprovement.toFixed(1)}
              </p>
              <p className="text-xs text-blue-600">Score</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 col-span-2 sm:col-span-1">
              <p className="text-sm text-purple-700 font-medium">WQI Improvement</p>
              <p className="text-2xl font-bold text-purple-900">
                {metrics.wqiImprovement > 0 ? '+' : ''}
                {metrics.wqiImprovement.toFixed(1)}%
              </p>
              <p className="text-xs text-purple-600">Change</p>
            </div>
          </div>
        </div>
      )}

      {/* IMTA Impact */}
      {imtaImpact && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">IMTA Impact Analysis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 font-medium">Before IMTA</p>
              <p className="text-xl font-bold text-gray-900">
                {imtaImpact.before.averageWQI}
              </p>
              <p className="text-xs text-gray-500">
                {imtaImpact.before.readingCount} readings
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">After IMTA</p>
              <p className="text-xl font-bold text-blue-900">
                {imtaImpact.after.averageWQI}
              </p>
              <p className="text-xs text-blue-500">
                {imtaImpact.after.readingCount} readings
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Improvement</p>
              <p className="text-xl font-bold text-green-900">
                {imtaImpact.improvement > 0 ? '+' : ''}
                {imtaImpact.improvement}%
              </p>
              <p className="text-xs text-green-500">WQI increase</p>
            </div>
          </div>
        </div>
      )}

      {/* Milestones by Type */}
      <div className="space-y-4">
        {ecoMilestones.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🌱 Eco-Friendliness Milestones</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ecoMilestones.map((milestone) => (
                <MilestoneCard key={milestone.id} milestone={milestone} />
              ))}
            </div>
          </div>
        )}

        {yieldMilestones.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">📈 Yield Milestones</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {yieldMilestones.map((milestone) => (
                <MilestoneCard key={milestone.id} milestone={milestone} />
              ))}
            </div>
          </div>
        )}

        {stabilityMilestones.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">⚖️ System Stability Milestones</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stabilityMilestones.map((milestone) => (
                <MilestoneCard key={milestone.id} milestone={milestone} />
              ))}
            </div>
          </div>
        )}

        {milestones.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No milestones achieved yet.</p>
            <p className="text-sm text-gray-500">
              Keep tracking your activities and water quality to unlock milestones!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
