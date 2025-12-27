/**
 * WQI Configuration - Easy to modify weights for different parameters
 * Based on NSFWQI (National Sanitation Foundation Water Quality Index)
 */

export const WQI_WEIGHTS = {
  dissolvedOxygen: 0.2,
  pH: 0.15,
  turbidity: 0.1,
  temperature: 0.1,
  ammonia: 0.15,
  totalNitrogen: 0.15,
  totalPhosphate: 0.15,
} as const;

/**
 * WQI Category thresholds
 */
export const WQI_CATEGORIES = {
  Excellent: { min: 90, max: 100, color: '#10b981' },
  Good: { min: 70, max: 90, color: '#3b82f6' },
  Moderate: { min: 50, max: 70, color: '#f59e0b' },
  Poor: { min: 0, max: 50, color: '#ef4444' },
} as const;

/**
 * Parameter ranges for sub-index calculation
 * These can be adjusted based on aquaculture species requirements
 */
export const PARAMETER_RANGES = {
  dissolvedOxygen: {
    excellent: { min: 7.5, max: 10 },
    good: { min: 6, max: 7.5 },
    moderate: { min: 4, max: 6 },
    poor: { min: 0, max: 4 },
  },
  pH: {
    excellent: { min: 7.5, max: 8.5 },
    good: { min: 7, max: 7.5 },
    moderate: { min: 6.5, max: 7 },
    poor: { min: 0, max: 6.5 },
  },
  turbidity: {
    excellent: { min: 0, max: 5 },
    good: { min: 5, max: 10 },
    moderate: { min: 10, max: 20 },
    poor: { min: 20, max: 100 },
  },
  temperature: {
    excellent: { min: 24, max: 28 },
    good: { min: 22, max: 24 },
    moderate: { min: 20, max: 22 },
    poor: { min: 0, max: 20 },
  },
  ammonia: {
    excellent: { min: 0, max: 0.05 },
    good: { min: 0.05, max: 0.1 },
    moderate: { min: 0.1, max: 0.2 },
    poor: { min: 0.2, max: 10 },
  },
  totalNitrogen: {
    excellent: { min: 0, max: 0.5 },
    good: { min: 0.5, max: 1 },
    moderate: { min: 1, max: 2 },
    poor: { min: 2, max: 10 },
  },
  totalPhosphate: {
    excellent: { min: 0, max: 0.05 },
    good: { min: 0.05, max: 0.1 },
    moderate: { min: 0.1, max: 0.2 },
    poor: { min: 0.2, max: 10 },
  },
} as const;

