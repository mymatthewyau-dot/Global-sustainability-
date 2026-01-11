'use client';

import {
  SpeciesSuitability,
  getAggregatedProblems,
} from '@/lib/species-suitability-calculator';
import { PARAMETER_LABELS } from '@/lib/species-suitability-config';

interface GeneralRecommendationsProps {
  suitabilities: SpeciesSuitability[];
}

export default function GeneralRecommendations({
  suitabilities,
}: GeneralRecommendationsProps) {
  const { critical, warnings, affectedSpecies } =
    getAggregatedProblems(suitabilities);

  // Calculate overall system health
  const avgScore = Math.round(
    suitabilities.reduce((sum, s) => sum + s.overallScore, 0) /
      suitabilities.length
  );

  const getSystemHealthStatus = (score: number) => {
    if (score >= 80)
      return {
        label: 'Excellent',
        color: 'bg-emerald-500',
        textColor: 'text-emerald-700',
        bgColor: 'bg-emerald-50',
      };
    if (score >= 60)
      return {
        label: 'Good',
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
      };
    if (score >= 40)
      return {
        label: 'Fair',
        color: 'bg-amber-500',
        textColor: 'text-amber-700',
        bgColor: 'bg-amber-50',
      };
    return {
      label: 'Poor',
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
    };
  };

  const systemHealth = getSystemHealthStatus(avgScore);

  // Prioritize actions based on severity and number of affected species
  const prioritizedActions = [
    ...critical.map((p) => ({
      ...p,
      priority: 'critical' as const,
      speciesAffected:
        affectedSpecies.get(`${p.parameter}-danger`)?.join(', ') || '',
    })),
    ...warnings.map((p) => ({
      ...p,
      priority: 'warning' as const,
      speciesAffected:
        affectedSpecies.get(`${p.parameter}-warning`)?.join(', ') || '',
    })),
  ];

  return (
    <div className="space-y-6">
      {/* System Overview Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            IMTA System Overview
          </h3>

          {/* Overall System Health */}
          <div className={`rounded-lg p-4 ${systemHealth.bgColor} mb-6`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`font-semibold ${systemHealth.textColor}`}>
                Overall System Health
              </span>
              <span
                className={`px-3 py-1 rounded-full text-white text-sm font-bold ${systemHealth.color}`}
              >
                {avgScore}% - {systemHealth.label}
              </span>
            </div>
            <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${systemHealth.color}`}
                style={{ width: `${avgScore}%` }}
              />
            </div>
          </div>

          {/* Species Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {suitabilities.map((suit) => {
              const scoreColor =
                suit.overallScore >= 80
                  ? 'text-emerald-600'
                  : suit.overallScore >= 60
                  ? 'text-blue-600'
                  : suit.overallScore >= 40
                  ? 'text-amber-600'
                  : 'text-red-600';

              const problems = suit.problems.length;
              const critical = suit.problems.filter(
                (p) => p.severity === 'danger'
              ).length;

              return (
                <div
                  key={suit.species.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                      <img
                        src={suit.species.image}
                        alt={suit.species.name}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {suit.species.name}
                      </p>
                      <p className={`text-lg font-bold ${scoreColor}`}>
                        {suit.overallScore}%
                      </p>
                    </div>
                  </div>
                  {problems > 0 ? (
                    <p className="text-xs text-gray-500">
                      {critical > 0 && (
                        <span className="text-red-600 font-medium">
                          {critical} critical
                        </span>
                      )}
                      {critical > 0 && problems - critical > 0 && ', '}
                      {problems - critical > 0 && (
                        <span className="text-amber-600">
                          {problems - critical} warning
                          {problems - critical > 1 ? 's' : ''}
                        </span>
                      )}
                    </p>
                  ) : (
                    <p className="text-xs text-emerald-600">All optimal</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Prioritized Action List */}
      {prioritizedActions.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h4 className="font-semibold text-gray-800">
              Recommended Actions (Priority Order)
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              Address these issues to improve overall system health
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {prioritizedActions.map((action, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  {/* Priority indicator */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      action.priority === 'critical'
                        ? 'bg-red-500'
                        : 'bg-amber-500'
                    }`}
                  >
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    {/* Parameter and affected species */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          action.priority === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {action.priority === 'critical'
                          ? 'CRITICAL'
                          : 'WARNING'}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {PARAMETER_LABELS[action.parameter]?.label ||
                          action.parameter}
                      </span>
                      {action.speciesAffected && (
                        <span className="text-xs text-gray-500">
                          Affects: {action.speciesAffected}
                        </span>
                      )}
                    </div>

                    {/* Problem description */}
                    <p className="text-sm text-gray-700 mb-3">
                      {action.message}
                    </p>

                    {/* Suggestions */}
                    {(action.suggestion24h || action.suggestionLongTerm) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {action.suggestion24h && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-600 mb-1">
                              ⏰ Next 24 Hours
                            </p>
                            <p className="text-sm text-gray-700">
                              {action.suggestion24h}
                            </p>
                          </div>
                        )}
                        {action.suggestionLongTerm && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-600 mb-1">
                              📅 Next Few Days
                            </p>
                            <p className="text-sm text-gray-700">
                              {action.suggestionLongTerm}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
          <span className="text-5xl mb-4 block">🎉</span>
          <h4 className="text-xl font-bold text-emerald-800 mb-2">
            All Systems Optimal!
          </h4>
          <p className="text-emerald-700 max-w-md mx-auto">
            Your IMTA system is performing excellently. All water quality
            parameters are within optimal ranges for all species. Continue
            monitoring to maintain these ideal conditions.
          </p>
        </div>
      )}

      {/* Quick Tips */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
        <h4 className="font-semibold text-blue-800 mb-3">💡 Best Practices</h4>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            Monitor water quality at consistent times daily for accurate trend
            analysis
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            Address critical issues (red) before warning issues (yellow)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            IMTA systems balance nutrient flow - changes for one species may
            affect others
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            Ulva absorbs excess nutrients from shrimp and tilapia - maintain
            good water flow between units
          </li>
        </ul>
      </div>
    </div>
  );
}

