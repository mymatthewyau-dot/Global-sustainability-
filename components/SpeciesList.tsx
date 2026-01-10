'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { SpeciesAdded } from '@/types';
import { format } from 'date-fns';

export default function SpeciesList() {
  const { user } = useAuth();
  const [species, setSpecies] = useState<SpeciesAdded[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchSpecies();
    }
  }, [user?.id]);

  const fetchSpecies = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/species?userId=${user.id}`, {
        headers: {
          'x-user-id': user.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSpecies(data.species || []);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching species:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Species Inventory</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium"
          >
            {showForm ? 'Hide Form' : '+ Add Species'}
          </button>
        </div>

        {showForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <SpeciesForm
              onSuccess={() => {
                setShowForm(false);
                fetchSpecies();
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {summary && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Species</p>
                <p className="font-semibold text-gray-900">{summary.totalSpecies}</p>
              </div>
              <div>
                <p className="text-gray-600">Unique Types</p>
                <p className="font-semibold text-gray-900">{summary.uniqueSpeciesCount}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-gray-600">Entries</p>
                <p className="font-semibold text-gray-900">{species.length}</p>
              </div>
            </div>
          </div>
        )}

        {summary?.speciesByType && summary.speciesByType.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Species by Type:</p>
            <div className="space-y-2">
              {summary.speciesByType.map((group: any) => (
                <div
                  key={group.name}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 bg-white rounded border border-blue-200"
                >
                  <div>
                    <p className="font-medium text-blue-900">{group.name}</p>
                    <p className="text-xs text-blue-600">
                      Total: {group.totalQuantity} | Entries: {group.entries}
                    </p>
                  </div>
                  <div className="text-xs text-blue-600 mt-1 sm:mt-0">
                    <p>
                      First: {format(new Date(group.firstAdded), 'MMM dd, yyyy')} | Last:{' '}
                      {format(new Date(group.lastAdded), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {species.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No species recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Added
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Species Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {species.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(entry.dateAdded), 'PP')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.speciesName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {entry.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {entry.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
