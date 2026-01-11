'use client';

import { SensorReading } from '@/types';
import {
  calculateEutrophicationRisk,
  getRiskColorClasses,
  getProgressPercentage,
  RiskLevel,
  ParameterRiskStatus,
} from '@/lib/eutrophication-risk';

interface EutrophicationRiskProps {
  reading: SensorReading;
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const colors = getRiskColorClasses(risk);
  const labels: Record<RiskLevel, { text: string; icon: string }> = {
    low: { text: 'Low Risk', icon: '✓' },
    medium: { text: 'Medium Risk', icon: '⚠' },
    high: { text: 'High Risk', icon: '!' },
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-white ${colors.badge}`}
    >
      <span className="text-xs">{labels[risk].icon}</span>
      {labels[risk].text}
    </span>
  );
}

function ParameterProgressBar({ param }: { param: ParameterRiskStatus }) {
  const colors = getRiskColorClasses(param.riskLevel);
  const percentage = getProgressPercentage(param.value, param.threshold, param.isInverted);

  return (
    <div className="p-4 rounded-lg border bg-white border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-gray-800">{param.label}</span>
        <span className={`font-semibold ${colors.text}`}>
          {param.parameter === 'ph' ? param.value.toFixed(2) : param.value.toFixed(param.value < 10 ? 2 : 0)} {param.unit}
        </span>
      </div>

      {/* Progress bar container */}
      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
        {/* Value indicator bar */}
        <div
          className={`absolute h-full ${colors.badge} transition-all duration-300 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Status text */}
      <div className="mt-2 flex justify-between text-xs">
        <span className="text-gray-500">
          {param.isInverted ? 'Lower is better' : 'Higher is better'}
        </span>
        <span className={colors.text}>
          {param.riskLevel === 'low' && 'Optimal'}
          {param.riskLevel === 'medium' && 'Warning'}
          {param.riskLevel === 'high' && 'Critical'}
        </span>
      </div>
    </div>
  );
}

export default function EutrophicationRisk({ reading }: EutrophicationRiskProps) {
  const risk = calculateEutrophicationRisk(reading);
  const overallColors = getRiskColorClasses(risk.overallRisk);

  return (
    <div className="w-full bg-white rounded-lg shadow p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Water Quality Risk Assessment
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Key parameter monitoring for IMTA system health
          </p>
        </div>
        <RiskBadge risk={risk.overallRisk} />
      </div>

      {/* Risk Category Card */}
      <div
        className={`p-4 rounded-lg border mb-6 ${overallColors.bg} ${overallColors.border}`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-lg font-bold ${overallColors.text}`}>
            {risk.riskCategory}
          </span>
          <span className="text-sm text-gray-600">Water Quality</span>
        </div>
        <p className={`text-sm ${overallColors.text}`}>{risk.description}</p>
      </div>

      {/* Parameter Details */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Key Parameters
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {risk.parameters.map((param) => (
            <ParameterProgressBar key={param.parameter} param={param} />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Low Risk (Optimal)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Medium Risk (Warning)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>High Risk (Critical)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
