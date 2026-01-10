'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { format } from 'date-fns';

interface FeedHistoryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function FeedHistoryForm({ onSuccess, onCancel }: FeedHistoryFormProps) {
  const { user } = useAuth();
  const [feedType, setFeedType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [timestamp, setTimestamp] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setError('You must be logged in to add feed history');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/feed-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          userId: user.id,
          feedType,
          quantity: parseFloat(quantity),
          timestamp,
          notes,
        }),
      });

      if (response.ok) {
        // Reset form
        setFeedType('');
        setQuantity('');
        setTimestamp(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
        setNotes('');
        if (onSuccess) onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add feed history');
      }
    } catch (err) {
      setError('An error occurred while adding feed history');
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
        <label htmlFor="feedType" className="block text-sm font-medium text-gray-700 mb-1">
          Feed Type *
        </label>
        <input
          id="feedType"
          type="text"
          value={feedType}
          onChange={(e) => setFeedType(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Tilapia feed, Herbal blend"
        />
      </div>

      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
          Quantity (kg) *
        </label>
        <input
          id="quantity"
          type="number"
          step="0.1"
          min="0.1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="0.0"
        />
      </div>

      <div>
        <label htmlFor="timestamp" className="block text-sm font-medium text-gray-700 mb-1">
          Date & Time *
        </label>
        <input
          id="timestamp"
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Additional notes about this feeding..."
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Adding...' : 'Add Feed Entry'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
