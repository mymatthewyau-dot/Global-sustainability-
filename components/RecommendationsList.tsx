'use client';

import { Recommendation } from '@/types';

interface RecommendationsListProps {
  recommendations: Recommendation[];
}

export default function RecommendationsList({ recommendations }: RecommendationsListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'Medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'Low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Feeding':
        return '🌾';
      case 'Species':
        return '🐟';
      case 'Maintenance':
        return '🔧';
      default:
        return '📋';
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className="w-full bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500 text-lg">No recommendations at this time.</p>
        <p className="text-gray-400 text-sm mt-2">Water quality parameters are within acceptable ranges.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Actions for Today</h3>
      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className={`border-2 rounded-lg p-4 ${getPriorityColor(rec.priority)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getCategoryIcon(rec.category)}</span>
                <span className="font-semibold text-base">{rec.category}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                rec.priority === 'High' ? 'bg-red-200 text-red-900' :
                rec.priority === 'Medium' ? 'bg-yellow-200 text-yellow-900' :
                'bg-blue-200 text-blue-900'
              }`}>
                {rec.priority}
              </span>
            </div>
            <p className="font-medium mb-2 text-base">{rec.action}</p>
            <p className="text-sm opacity-90">{rec.reason}</p>
            {rec.dataLink && (
              <p className="text-xs mt-2 opacity-75">
                Linked to: <span className="font-semibold">{rec.dataLink}</span>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

