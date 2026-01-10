'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { format } from 'date-fns';

interface SpeciesFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SpeciesForm({ onSuccess, onCancel }: SpeciesFormProps) {
  const { user } = useAuth();
  const [speciesName, setSpeciesName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [dateAdded, setDateAdded] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setError('You must be logged in to add species');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/species', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          userId: user.id,
          speciesName,
          quantity: parseFloat(quantity),
          dateAdded,
          notes,
        }),
      });

      if (response.ok) {
        // Reset form
        setSpeciesName('');
        setQuantity('');
        setDateAdded(format(new Date(), 'yyyy-MM-dd'));
        setNotes('');
        if (onSuccess) onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add species');
      }
    } catch (err) {
      setError('An error occurred while adding species');
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
        <label htmlFor="speciesName" className="block text-sm font-medium text-gray-700 mb-1">
          Species Name *
        </label>
        <input
          id="speciesName"
          type="text"
          value={speciesName}
          onChange={(e) => setSpeciesName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Tilapia, Mussels, Seaweed"
        />
      </div>

      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
          Quantity *
        </label>
        <input
          id="quantity"
          type="number"
          step="1"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Number of individuals or units"
        />
      </div>

      <div>
        <label htmlFor="dateAdded" className="block text-sm font-medium text-gray-700 mb-1">
          Date Added *
        </label>
        <input
          id="dateAdded"
          type="date"
          value={dateAdded}
          onChange={(e) => setDateAdded(e.target.value)}
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
          placeholder="Additional notes about this species addition..."
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Adding...' : 'Add Species'}
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
