'use client';

import Image from 'next/image';
import { SpeciesSuitability } from '@/lib/species-suitability-calculator';
import HexagonalRadarChart from './HexagonalRadarChart';

interface SpeciesSuitabilityTabProps {
  suitability: SpeciesSuitability;
}

export default function SpeciesSuitabilityTab({
  suitability,
}: SpeciesSuitabilityTabProps) {
  const { species, parameterScores, overallScore, overallGrade, problems } =
    suitability;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'Excellent':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Good':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Fair':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Poor':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Get danger and warning problems
  const dangerProblems = problems.filter((p) => p.severity === 'danger');
  const warningProblems = problems.filter((p) => p.severity === 'warning');

  return (
    <div className="space-y-6">
      {/* Header with Species Info and Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Species Photo and Info */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg bg-gray-50">
                <Image
                  src={species.image}
                  alt={species.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">
                {species.name}
              </h3>
              <p className="text-sm text-gray-500 italic">
                {species.scientificName}
              </p>
            </div>

            {/* Hexagonal Radar Chart */}
            <div className="flex-1 flex justify-center">
              <HexagonalRadarChart
                parameterScores={parameterScores}
                size={300}
                speciesName={species.name}
              />
            </div>
          </div>
        </div>

        {/* Overall Suitability Bar */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Overall Suitability
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold border ${getGradeColor(
                overallGrade
              )}`}
            >
              {overallScore}% - {overallGrade}
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(
                overallScore
              )}`}
              style={{ width: `${overallScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Problem Statements */}
      {problems.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800">
            Issues Detected
          </h4>

          {/* Danger Problems */}
          {dangerProblems.length > 0 && (
            <div className="space-y-3">
              {dangerProblems.map((problem, index) => (
                <div
                  key={index}
                  className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">⚠️</span>
                    <div className="flex-1">
                      <p className="font-semibold text-red-800">
                        {problem.message}
                      </p>
                      {problem.suggestion24h && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-red-700 mb-1">
                            Immediate Action (24 hours):
                          </p>
                          <p className="text-sm text-red-700">
                            {problem.suggestion24h}
                          </p>
                        </div>
                      )}
                      {problem.suggestionLongTerm && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-red-700 mb-1">
                            Short-term Plan (next few days):
                          </p>
                          <p className="text-sm text-red-700">
                            {problem.suggestionLongTerm}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Warning Problems */}
          {warningProblems.length > 0 && (
            <div className="space-y-3">
              {warningProblems.map((problem, index) => (
                <div
                  key={index}
                  className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-amber-500 text-xl">⚡</span>
                    <div className="flex-1">
                      <p className="font-semibold text-amber-800">
                        {problem.message}
                      </p>
                      {problem.suggestion24h && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-amber-700 mb-1">
                            Recommended Action:
                          </p>
                          <p className="text-sm text-amber-700">
                            {problem.suggestion24h}
                          </p>
                        </div>
                      )}
                      {problem.suggestionLongTerm && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-amber-700 mb-1">
                            Long-term Adjustment:
                          </p>
                          <p className="text-sm text-amber-700">
                            {problem.suggestionLongTerm}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Clear Message */}
      {problems.length === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
          <span className="text-4xl mb-3 block">✅</span>
          <h4 className="text-lg font-semibold text-emerald-800 mb-2">
            All Parameters Optimal
          </h4>
          <p className="text-emerald-700">
            Current water conditions are ideal for {species.name}. Continue
            monitoring to maintain these excellent conditions.
          </p>
        </div>
      )}

      {/* Parameter Details Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="font-semibold text-gray-800">Parameter Details</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Parameter
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">
                  Current
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">
                  Optimal
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {parameterScores.map((ps, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {ps.label}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">
                    {ps.value}
                    {ps.unit && <span className="text-gray-500 ml-1">{ps.unit}</span>}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-500">
                    {ps.optimalRange.min} - {ps.optimalRange.max}
                    {ps.unit && <span className="ml-1">{ps.unit}</span>}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        ps.grade === 'A'
                          ? 'bg-emerald-100 text-emerald-700'
                          : ps.grade === 'B'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {ps.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

