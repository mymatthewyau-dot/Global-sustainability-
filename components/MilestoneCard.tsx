'use client';

import { Milestone } from '@/types';
import { format } from 'date-fns';

interface MilestoneCardProps {
  milestone: Milestone;
}

export default function MilestoneCard({ milestone }: MilestoneCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'eco-friendliness':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'yield':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'system-stability':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'eco-friendliness':
        return '🌱';
      case 'yield':
        return '📈';
      case 'system-stability':
        return '⚖️';
      default:
        return '🏆';
    }
  };

  let metricsObj: any = {};
  try {
    metricsObj = JSON.parse(milestone.metrics);
  } catch {
    metricsObj = { raw: milestone.metrics };
  }

  return (
    <div className={`p-4 rounded-lg border-2 ${getTypeColor(milestone.milestoneType)}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getTypeIcon(milestone.milestoneType)}</span>
          <div>
            <h4 className="font-semibold text-lg">{milestone.description}</h4>
            <p className="text-xs opacity-75 capitalize">
              {milestone.milestoneType.replace('-', ' ')}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-current border-opacity-20">
        <p className="text-sm mb-1">
          <span className="font-medium">Achieved:</span>{' '}
          {format(new Date(milestone.dateAchieved), 'PP')}
        </p>
        {Object.keys(metricsObj).length > 0 && (
          <div className="text-sm">
            <span className="font-medium">Metrics:</span>
            <ul className="list-disc list-inside mt-1">
              {Object.entries(metricsObj).map(([key, value]) => (
                <li key={key}>
                  {key}: {String(value)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
