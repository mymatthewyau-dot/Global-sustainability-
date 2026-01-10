'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, id } from '@/lib/instant';

export default function OnboardingPage() {
  const [farmName, setFarmName] = useState('');
  const [location, setLocation] = useState('');
  const [imtaStartDate, setImtaStartDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const { isLoading: authLoading, user } = db.useAuth();

  // Check if user already has a farm
  const farmQuery = user
    ? {
        farms: {
          $: {
            where: {
              ownerId: user.id,
            },
          },
        },
      }
    : null;
  
  const { data: farmData, isLoading: farmLoading } = db.useQuery(farmQuery as any) as { 
    data?: { farms?: any[] }; 
    isLoading: boolean; 
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (farmData?.farms && farmData.farms.length > 0) {
      // User already has a farm, redirect to dashboard
      router.push('/');
    }
  }, [farmData, router]);

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const now = Date.now();
      const imtaTimestamp = new Date(imtaStartDate).getTime();

      await db.transact([
        (db.tx as any).farms[id()].update({
          name: farmName,
          location: location || undefined,
          imtaStartDate: imtaTimestamp,
          createdAt: now,
          ownerId: user!.id,
        }),
      ]);

      // Redirect to dashboard
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create farm. Please try again.');
      setIsLoading(false);
    }
  };

  if (authLoading || farmLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏞️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to IMTA Dashboard
          </h1>
          <p className="text-gray-600">
            Let&apos;s set up your aquaculture farm profile
          </p>
        </div>

        <form onSubmit={handleCreateFarm} className="space-y-4">
          <div>
            <label
              htmlFor="farmName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Farm Name <span className="text-red-500">*</span>
            </label>
            <input
              id="farmName"
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="e.g., Green Valley Aquafarm"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Location <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="e.g., Bali, Indonesia"
            />
          </div>

          <div>
            <label
              htmlFor="imtaStartDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              IMTA Implementation Date <span className="text-red-500">*</span>
            </label>
            <input
              id="imtaStartDate"
              type="date"
              value={imtaStartDate}
              onChange={(e) => setImtaStartDate(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-1">
              When did you start using Integrated Multi-Trophic Aquaculture?
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Creating Farm...' : 'Create Farm Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

