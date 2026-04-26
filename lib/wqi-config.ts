export const WQI_WEIGHTS = {
  dissolvedOxygen: 0.50,
  phosphorus: 0.25,
  nitrogen: 0.25,
} as const;

export const WQI_CATEGORIES = {
  Excellent: { min: 90, max: 100, color: '#00C896' },
  Good:      { min: 70, max: 90,  color: '#3B82F6' },
  Moderate:  { min: 50, max: 70,  color: '#F59E0B' },
  Poor:      { min: 0,  max: 50,  color: '#EF4444' },
} as const;

export const PARAMETER_RANGES = {
  dissolvedOxygen: {
    excellent: { min: 5.0, max: 10.0 },
    good:      { min: 4.0, max: 5.0  },
    moderate:  { min: 3.0, max: 4.0  },
    poor:      { min: 0,   max: 3.0  },
  },
  phosphorus: {
    // Lower is better — inverted scale
    excellent: { min: 0,    max: 0.05 },
    good:      { min: 0.05, max: 0.10 },
    moderate:  { min: 0.10, max: 0.20 },
    poor:      { min: 0.20, max: 999  },
  },
  nitrogen: {
    // Lower is better — inverted scale
    excellent: { min: 0, max: 1.0 },
    good:      { min: 1.0, max: 2.0 },
    moderate:  { min: 2.0, max: 5.0 },
    poor:      { min: 5.0, max: 999 },
  },
} as const;
