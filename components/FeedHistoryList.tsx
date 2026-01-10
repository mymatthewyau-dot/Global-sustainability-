'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { FeedHistory } from '@/types';
import { format } from 'date-fns';

export default function FeedHistoryList() {
  const { user } = useAuth();
  const [feedHistory, setFeedHistory] = useState<FeedHistory[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchFeedHistory();
    }
  }, [user?.id]);

  const fetchFeedHistory = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/feed-history?userId=${user.id}`, {
        headers: {
          'x-user-id': user.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFeedHistory(data.feedHistory || []);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching feed history:', error);
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Feed History</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium"
          >
            {showForm ? 'Hide Form' : '+ Add Feed Entry'}
          </button>
        </div>

        {showForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <FeedHistoryForm
              onSuccess={() => {
                setShowForm(false);
                fetchFeedHistory();
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {summary && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Feed</p>
                <p className="font-semibold text-gray-900">{summary.totalFeed.toFixed(1)} kg</p>
              </div>
              <div>
                <p className="text-gray-600">Entries</p>
                <p className="font-semibold text-gray-900">{summary.entryCount}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-gray-600">Avg per Entry</p>
                <p className="font-semibold text-gray-900">
                  {summary.entryCount > 0
                    ? (summary.totalFeed / summary.entryCount).toFixed(1)
                    : 0}{' '}
                  kg
                </p>
              </div>
            </div>
            {Object.keys(summary.feedByType).length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">By Feed Type:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(summary.feedByType).map(([type, qty]) => (
                    <span
                      key={type}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                    >
                      {type}: {Number(qty).toFixed(1)} kg
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {feedHistory.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No feed history recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feed Type
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
                {feedHistory.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(entry.timestamp), 'PPpp')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {entry.feedType}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {entry.quantity.toFixed(1)} kg
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
