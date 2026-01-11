'use client';

import { useState, useMemo } from 'react';
import { SensorReading } from '@/types';
import { SPECIES_CONFIG } from '@/lib/species-suitability-config';
import { calculateAllSpeciesSuitability } from '@/lib/species-suitability-calculator';
import SpeciesSuitabilityTab from './SpeciesSuitabilityTab';
import GeneralRecommendations from './GeneralRecommendations';

interface RecommendationsListProps {
  reading: SensorReading;
}

type TabId = 'shrimp' | 'tilapia' | 'ulva' | 'general';

export default function RecommendationsList({ reading }: RecommendationsListProps) {
  const [activeTab, setActiveTab] = useState<TabId>('shrimp');

  // Calculate suitability for all species
  const suitabilities = useMemo(() => {
    return calculateAllSpeciesSuitability(reading);
  }, [reading]);

  // Get tab configuration
  const tabs: { id: TabId; label: string; icon: string; species?: string }[] = [
    { id: 'shrimp', label: 'Shrimp', icon: '🦐', species: 'shrimp' },
    { id: 'tilapia', label: 'Tilapia', icon: '🐟', species: 'tilapia' },
    { id: 'ulva', label: 'Ulva', icon: '🌿', species: 'ulva' },
    { id: 'general', label: 'General', icon: '📋' },
  ];

  // Get the current species suitability
  const currentSuitability = useMemo(() => {
    if (activeTab === 'general') return null;
    return suitabilities.find((s) => s.species.id === activeTab);
  }, [activeTab, suitabilities]);

  // Count issues for each tab
  const getIssueCount = (speciesId: string) => {
    const suit = suitabilities.find((s) => s.species.id === speciesId);
    if (!suit) return 0;
    return suit.problems.length;
  };

  const getTotalIssues = () => {
    return suitabilities.reduce((sum, s) => sum + s.problems.length, 0);
  };

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const issueCount =
              tab.id === 'general'
                ? getTotalIssues()
                : tab.species
                ? getIssueCount(tab.species)
                : 0;

            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[100px] px-4 py-4 text-sm font-medium transition-all relative ${
                  isActive
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-b-2 border-transparent'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {issueCount > 0 && (
                    <span
                      className={`absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : issueCount > 0
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {issueCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'general' ? (
          <GeneralRecommendations suitabilities={suitabilities} />
        ) : currentSuitability ? (
          <SpeciesSuitabilityTab suitability={currentSuitability} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">No data available for this species.</p>
          </div>
        )}
      </div>
    </div>
  );
}
