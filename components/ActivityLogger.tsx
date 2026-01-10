'use client';

import { useState } from 'react';
import { db, id } from '@/lib/instant';
import { useFarm } from '@/lib/farm-context';

type ActivityType = 'feed' | 'species_added' | 'species_removed' | 'maintenance';

export default function ActivityLogger() {
  const { farm } = useFarm();
  const [activityType, setActivityType] = useState<ActivityType>('feed');
  const [species, setSpecies] = useState('');
  const [feedAmount, setFeedAmount] = useState('');
  const [feedType, setFeedType] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farm) return;

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const activityId = id();
      const now = Date.now();

      await db.transact([
        (db.tx as any).activities[activityId].update({
          farmId: farm.id,
          timestamp: now,
          type: activityType,
          species: species || undefined,
          feedAmount: feedAmount ? parseFloat(feedAmount) : undefined,
          feedType: feedType || undefined,
          notes: notes || undefined,
        }),
      ]);

      // Reset form
      setSpecies('');
      setFeedAmount('');
      setFeedType('');
      setNotes('');
      setSuccessMessage('Activity logged successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error logging activity:', error);
      alert('Failed to log activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Log Activity</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Activity Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activity Type
          </label>
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value as ActivityType)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="feed">Feeding</option>
            <option value="species_added">Species Added</option>
            <option value="species_removed">Species Removed/Harvested</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {/* Species (for species-related activities) */}
        {(activityType === 'species_added' || activityType === 'species_removed') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Species <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              required
              placeholder="e.g., Tilapia, Seaweed, Mussels"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        )}

        {/* Feed Amount (for feeding) */}
        {activityType === 'feed' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feed Amount (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={feedAmount}
                onChange={(e) => setFeedAmount(e.target.value)}
                placeholder="e.g., 50"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feed Type
              </label>
              <input
                type="text"
                value={feedType}
                onChange={(e) => setFeedType(e.target.value)}
                placeholder="e.g., Pellets, Natural feed"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Species Fed
              </label>
              <input
                type="text"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                placeholder="e.g., Salmon"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Additional notes or observations..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          />
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? 'Logging Activity...' : 'Log Activity'}
        </button>
      </form>
    </div>
  );
}

