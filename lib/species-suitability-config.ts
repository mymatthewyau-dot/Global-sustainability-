/**
 * Species Suitability Configuration for IMTA System
 * Defines optimal, suboptimal, and danger ranges for each species and parameter
 * Score: 0 = danger, 1 = suboptimal, 2 = optimal
 */

export type ParameterKey = 'salinity' | 'temperature' | 'dissolvedOxygen' | 'tss' | 'alkalinity' | 'ph' | 'ammonia';

export interface Range {
  min: number;
  max: number;
}

export interface ParameterThresholds {
  danger: Range[];      // Score 0 - dangerous conditions
  suboptimal: Range[];  // Score 1 - suboptimal conditions  
  optimal: Range;       // Score 2 - optimal conditions
}

export interface SpeciesConfig {
  id: string;
  name: string;
  scientificName: string;
  image: string;
  parameters: Record<ParameterKey, ParameterThresholds>;
}

export const PARAMETER_LABELS: Record<ParameterKey, { label: string; unit: string }> = {
  salinity: { label: 'Salinity', unit: 'ppt' },
  temperature: { label: 'Temperature', unit: '°C' },
  dissolvedOxygen: { label: 'Dissolved Oxygen', unit: 'mg/L' },
  tss: { label: 'TSS', unit: 'mg/L' },
  alkalinity: { label: 'Alkalinity', unit: 'mg/L CaCO₃' },
  ph: { label: 'pH', unit: '' },
  ammonia: { label: 'Ammonia (TAN)', unit: 'mg/L' },
};

export const SPECIES_CONFIG: SpeciesConfig[] = [
  {
    id: 'shrimp',
    name: 'Pacific White Shrimp',
    scientificName: 'P. vannamei',
    image: '/species/shrimp.svg',
    parameters: {
      salinity: {
        danger: [{ min: 0, max: 10 }, { min: 35, max: 100 }],
        suboptimal: [{ min: 10, max: 15 }, { min: 25, max: 35 }],
        optimal: { min: 15, max: 25 },
      },
      temperature: {
        danger: [{ min: 0, max: 24 }, { min: 34, max: 50 }],
        suboptimal: [{ min: 24, max: 26 }, { min: 32, max: 34 }],
        optimal: { min: 26, max: 32 },
      },
      dissolvedOxygen: {
        danger: [{ min: 0, max: 4.0 }],
        suboptimal: [{ min: 4.0, max: 5.0 }],
        optimal: { min: 5.0, max: 20 },
      },
      tss: {
        // Biofloc system - optimal is 500-600 mg/L
        danger: [{ min: 0, max: 100 }, { min: 800, max: 2000 }],
        suboptimal: [{ min: 100, max: 500 }, { min: 600, max: 800 }],
        optimal: { min: 500, max: 600 },
      },
      alkalinity: {
        danger: [{ min: 0, max: 80 }, { min: 180, max: 500 }],
        suboptimal: [{ min: 80, max: 100 }, { min: 150, max: 180 }],
        optimal: { min: 100, max: 150 },
      },
      ph: {
        danger: [{ min: 0, max: 7.0 }, { min: 9.0, max: 14 }],
        suboptimal: [{ min: 7.0, max: 7.5 }, { min: 8.5, max: 9.0 }],
        optimal: { min: 7.5, max: 8.5 },
      },
      ammonia: {
        // Lower is better for shrimp (unionised NH₃ < 0.1)
        danger: [{ min: 1.0, max: 100 }],
        suboptimal: [{ min: 0.5, max: 1.0 }],
        optimal: { min: 0, max: 0.5 },
      },
    },
  },
  {
    id: 'tilapia',
    name: 'Nile Tilapia',
    scientificName: 'O. niloticus',
    image: '/species/tilapia.svg',
    parameters: {
      salinity: {
        // Tilapia prefers freshwater - lower salinity is better
        danger: [{ min: 15, max: 100 }],
        suboptimal: [{ min: 10, max: 15 }],
        optimal: { min: 0, max: 10 },
      },
      temperature: {
        danger: [{ min: 0, max: 24 }, { min: 32, max: 50 }],
        suboptimal: [{ min: 24, max: 26 }, { min: 30, max: 32 }],
        optimal: { min: 26, max: 30 },
      },
      dissolvedOxygen: {
        danger: [{ min: 0, max: 3.0 }],
        suboptimal: [{ min: 3.0, max: 5.0 }],
        optimal: { min: 5.0, max: 20 },
      },
      tss: {
        // Tilapia is more tolerant - broader optimal window
        danger: [{ min: 0, max: 100 }, { min: 800, max: 2000 }],
        suboptimal: [{ min: 100, max: 200 }, { min: 600, max: 800 }],
        optimal: { min: 200, max: 600 },
      },
      alkalinity: {
        danger: [{ min: 0, max: 40 }, { min: 200, max: 500 }],
        suboptimal: [{ min: 40, max: 50 }, { min: 150, max: 200 }],
        optimal: { min: 50, max: 150 },
      },
      ph: {
        danger: [{ min: 0, max: 6.5 }, { min: 9.0, max: 14 }],
        suboptimal: [{ min: 6.5, max: 7.0 }, { min: 8.5, max: 9.0 }],
        optimal: { min: 7.0, max: 8.5 },
      },
      ammonia: {
        // Tilapia tolerates slightly higher ammonia than shrimp
        danger: [{ min: 2.0, max: 100 }],
        suboptimal: [{ min: 0.5, max: 2.0 }],
        optimal: { min: 0, max: 0.5 },
      },
    },
  },
  {
    id: 'ulva',
    name: 'Sea Lettuce',
    scientificName: 'Ulva ohnoi',
    image: '/species/ulva.svg',
    parameters: {
      salinity: {
        // Ulva prefers marine conditions - higher salinity
        danger: [{ min: 0, max: 15 }, { min: 40, max: 100 }],
        suboptimal: [{ min: 15, max: 25 }, { min: 35, max: 40 }],
        optimal: { min: 25, max: 35 },
      },
      temperature: {
        danger: [{ min: 0, max: 18 }, { min: 28, max: 50 }],
        suboptimal: [{ min: 18, max: 20 }, { min: 25, max: 28 }],
        optimal: { min: 20, max: 25 },
      },
      dissolvedOxygen: {
        danger: [{ min: 0, max: 3.0 }],
        suboptimal: [{ min: 3.0, max: 4.0 }],
        optimal: { min: 4.0, max: 20 },
      },
      tss: {
        // Ulva needs clear water for photosynthesis
        danger: [{ min: 100, max: 2000 }],
        suboptimal: [{ min: 50, max: 100 }],
        optimal: { min: 0, max: 50 },
      },
      alkalinity: {
        danger: [{ min: 0, max: 80 }, { min: 180, max: 500 }],
        suboptimal: [{ min: 80, max: 100 }, { min: 150, max: 180 }],
        optimal: { min: 100, max: 150 },
      },
      ph: {
        // Ulva tolerates higher pH
        danger: [{ min: 0, max: 7.5 }, { min: 10.0, max: 14 }],
        suboptimal: [{ min: 7.5, max: 8.0 }, { min: 9.5, max: 10.0 }],
        optimal: { min: 8.0, max: 9.5 },
      },
      ammonia: {
        // Ulva uses ammonia as nutrient - needs some but not too much
        danger: [{ min: 0, max: 0.5 }, { min: 3.0, max: 100 }],
        suboptimal: [{ min: 0.5, max: 1.0 }, { min: 2.0, max: 3.0 }],
        optimal: { min: 1.0, max: 2.0 },
      },
    },
  },
];

/**
 * Get species configuration by ID
 */
export function getSpeciesById(id: string): SpeciesConfig | undefined {
  return SPECIES_CONFIG.find((s) => s.id === id);
}

/**
 * Get all species IDs
 */
export function getAllSpeciesIds(): string[] {
  return SPECIES_CONFIG.map((s) => s.id);
}

