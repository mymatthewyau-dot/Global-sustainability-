/**
 * WQI Configuration - Easy to modify weights for different parameters
 * Updated for IMTA aquaculture with 7 key parameters
 */

export const WQI_WEIGHTS = {
  dissolvedOxygen: 0.18,
  pH: 0.14,
  tss: 0.12,
  temperature: 0.14,
  ammonia: 0.16,
  alkalinity: 0.12,
  salinity: 0.14,
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
 * Based on general aquaculture requirements (species-specific ranges in species-suitability-config.ts)
 */
export const PARAMETER_RANGES = {
  dissolvedOxygen: {
    excellent: { min: 5.0, max: 10 },
    good: { min: 4.0, max: 5.0 },
    moderate: { min: 3.0, max: 4.0 },
    poor: { min: 0, max: 3.0 },
  },
  pH: {
    excellent: { min: 7.5, max: 8.5 },
    good: { min: 7.0, max: 7.5 },
    moderate: { min: 6.5, max: 7.0 },
    poor: { min: 0, max: 6.5 },
  },
  tss: {
    // For biofloc systems - optimal is 200-600 mg/L
    excellent: { min: 200, max: 600 },
    good: { min: 100, max: 200 },
    moderate: { min: 50, max: 100 },
    poor: { min: 0, max: 50 },
  },
  temperature: {
    excellent: { min: 26, max: 30 },
    good: { min: 24, max: 26 },
    moderate: { min: 22, max: 24 },
    poor: { min: 0, max: 22 },
  },
  ammonia: {
    // TAN levels - lower is better for most species
    excellent: { min: 0, max: 0.5 },
    good: { min: 0.5, max: 1.0 },
    moderate: { min: 1.0, max: 2.0 },
    poor: { min: 2.0, max: 10 },
  },
  alkalinity: {
    // mg/L CaCO₃ - optimal range for buffering
    excellent: { min: 100, max: 150 },
    good: { min: 80, max: 100 },
    moderate: { min: 50, max: 80 },
    poor: { min: 0, max: 50 },
  },
  salinity: {
    // ppt - optimal for shrimp
    excellent: { min: 15, max: 25 },
    good: { min: 10, max: 15 },
    moderate: { min: 25, max: 35 },
    poor: { min: 0, max: 10 },
  },
} as const;
