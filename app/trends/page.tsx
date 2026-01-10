'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import HistoricalTrendChart from '@/components/HistoricalTrendChart';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

export default function TrendsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [imtaStartDate, setImtaStartDate] = useState<string | undefined>();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchAquafarm = async () => {
      if (user?.id) {
        try {
          // Fetch from trends API which includes IMTA start date
          const response = await fetch(`/api/trends?userId=${user.id}&days=30`, {
            headers: {
              'x-user-id': user.id,
            },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.beforeAfterIMTA?.imtaStartDate) {
              setImtaStartDate(data.beforeAfterIMTA.imtaStartDate);
            }
          }
        } catch (error) {
          console.error('Error fetching aquafarm:', error);
        }
      }
    };
    fetchAquafarm();
  }, [user?.id]);

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Historical Trends</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            View water quality trends over time and track improvements
          </p>
        </div>
        <HistoricalTrendChart imtaStartDate={imtaStartDate} />
      </main>
    </div>
  );
}
