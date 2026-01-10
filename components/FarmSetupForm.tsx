'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { format } from 'date-fns';

interface FarmSetupFormProps {
  onSuccess?: () => void;
  existingFarm?: {
    name: string;
    location?: string;
    imtaStartDate?: string;
  };
}

export default function FarmSetupForm({ onSuccess, existingFarm }: FarmSetupFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState(existingFarm?.name || '');
  const [location, setLocation] = useState(existingFarm?.location || '');
  const [imtaStartDate, setImtaStartDate] = useState(
    existingFarm?.imtaStartDate
      ? format(new Date(existingFarm.imtaStartDate), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd')
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setError('You must be logged in to set up your farm');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/aquafarm', {
        method: existingFarm ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          userId: user.id,
          name,
          location,
          imtaStartDate,
        }),
      });

      if (response.ok) {
        if (onSuccess) onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save farm information');
      }
    } catch (err) {
      setError('An error occurred while saving farm information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Farm Name *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Coastal Aquafarm"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Coastal Region, Country"
        />
      </div>

      <div>
        <label htmlFor="imtaStartDate" className="block text-sm font-medium text-gray-700 mb-1">
          IMTA Start Date *
        </label>
        <input
          id="imtaStartDate"
          type="date"
          value={imtaStartDate}
          onChange={(e) => setImtaStartDate(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          The date when you started implementing IMTA practices
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? 'Saving...' : existingFarm ? 'Update Farm Info' : 'Save Farm Info'}
      </button>
    </form>
  );
}
