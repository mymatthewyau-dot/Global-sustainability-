'use client';

import { WQIScore } from '@/types';

interface WQIGaugeProps {
  wqi: WQIScore;
}

export default function WQIGauge({ wqi }: WQIGaugeProps) {
  const getColor = () => {
    switch (wqi.category) {
      case 'Excellent':
        return 'text-wqi-excellent';
      case 'Good':
        return 'text-wqi-good';
      case 'Moderate':
        return 'text-wqi-moderate';
      case 'Poor':
        return 'text-wqi-poor';
      default:
        return 'text-gray-500';
    }
  };

  const getBgColor = () => {
    switch (wqi.category) {
      case 'Excellent':
        return 'bg-wqi-excellent';
      case 'Good':
        return 'bg-wqi-good';
      case 'Moderate':
        return 'bg-wqi-moderate';
      case 'Poor':
        return 'bg-wqi-poor';
      default:
        return 'bg-gray-500';
    }
  };

  // Calculate angle for arc (0-180 degrees, where 180 = 100%)
  const percentage = wqi.overall;
  const angle = (percentage / 100) * 180;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-48 h-24 sm:w-64 sm:h-32">
        {/* Background arc */}
        <svg className="w-full h-full" viewBox="0 0 200 100">
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          {/* Colored arc based on WQI */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke={getColor().replace('text-', '')}
            strokeWidth="12"
            strokeDasharray={`${(angle / 180) * 314.16} 314.16`}
            strokeDashoffset="0"
            className={getColor().replace('text-', 'stroke-')}
            style={{
              stroke: wqi.category === 'Excellent' ? '#10b981' :
                      wqi.category === 'Good' ? '#3b82f6' :
                      wqi.category === 'Moderate' ? '#f59e0b' : '#ef4444'
            }}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-4xl sm:text-5xl font-bold ${getColor()}`}>
            {wqi.overall.toFixed(1)}
          </div>
          <div className={`text-sm sm:text-base font-semibold ${getColor()} mt-1`}>
            {wqi.category}
          </div>
        </div>
      </div>
      {/* Category badge */}
      <div className={`mt-2 px-4 py-1 rounded-full text-white text-sm font-medium ${getBgColor()}`}>
        {wqi.category} Water Quality
      </div>
    </div>
  );
}

