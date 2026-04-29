'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, id } from '@/lib/instant';

const DEMO_FARM = {
  name: 'Barangay Lucap IMTA Site',
  location: 'Lingayen Gulf, Philippines',
  imtaStartDate: new Date('2026-04-01').getTime(),
  initialStockingDensity: 4,
};

const DEMO_READING = {
  dissolvedOxygen: 5,
  phosphorus: 0.175,
  nitrogen: 0.4,
  stockingDensity: 4,
};

export default function OnboardingPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const hasCreated = useRef(false);
  const { isLoading: authLoading, user } = db.useAuth();

  const farmQuery = user ? { farms: { $: { where: { ownerId: user.id } } } } : null;
  const { data: farmData, isLoading: farmLoading } = db.useQuery(farmQuery as any) as {
    data?: { farms?: any[] };
    isLoading: boolean;
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }
    if (farmData?.farms && farmData.farms.length > 0) {
      router.push('/');
      return;
    }
    if (!user || farmLoading || farmData === undefined) return;

    // No farm exists — auto-create demo farm + seed reading
    if (hasCreated.current) return;
    hasCreated.current = true;
    const farmId = id();
    const readingId = id();
    db.transact([
      (db.tx as any).farms[farmId].update({
        ...DEMO_FARM,
        createdAt: Date.now(),
        ownerId: user.id,
      }),
      (db.tx as any).sensorReadings[readingId].update({
        farmId,
        timestamp: Date.now(),
        ...DEMO_READING,
        wqiScore: 0,
      }),
    ])
      .then(() => router.push('/'))
      .catch((err: any) => setError(err.message || 'Failed to set up demo farm.'));
  }, [user, authLoading, farmData, farmLoading, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button onClick={() => router.push('/auth')} className="mt-4 text-blue-600 underline text-sm">
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 text-sm">Setting up your dashboard…</p>
      </div>
    </div>
  );
}
