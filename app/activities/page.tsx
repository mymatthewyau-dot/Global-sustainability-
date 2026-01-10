'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import FeedHistoryList from '@/components/FeedHistoryList';
import SpeciesList from '@/components/SpeciesList';
import Navigation from '@/components/Navigation';

export default function ActivitiesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'feed' | 'species'>('feed');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Activities</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Track feed history and species additions
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('feed')}
                className={`flex-1 sm:flex-none px-4 sm:px-8 py-4 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                  activeTab === 'feed'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">🍽️</span>
                Feed History
              </button>
              <button
                onClick={() => setActiveTab('species')}
                className={`flex-1 sm:flex-none px-4 sm:px-8 py-4 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                  activeTab === 'species'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">🐟</span>
                Species
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'feed' && <FeedHistoryList />}
        {activeTab === 'species' && <SpeciesList />}
      </main>
    </div>
  );
}
