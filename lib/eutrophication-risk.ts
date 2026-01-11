import { SensorReading } from '@/types';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface ParameterRiskStatus {
  parameter: 'ammonia' | 'do' | 'ph' | 'tss';
  label: string;
  value: number;
  unit: string;
  riskLevel: RiskLevel;
  threshold: {
    good: number;
    warning: number;
  };
  isInverted?: boolean; // True if lower values are better (like ammonia)
}

export interface WaterQualityRiskResult {
  overallRisk: RiskLevel;
  riskCategory: 'Excellent' | 'Acceptable' | 'Concerning';
  description: string;
  parameters: ParameterRiskStatus[];
}

// Thresholds for IMTA aquaculture system
// Based on general optimal ranges for mixed species
const THRESHOLDS = {
  ammonia: {
    good: 0.5, // < 0.5 mg/L is good
    warning: 1.0, // 0.5-1.0 mg/L is warning, > 1.0 is concerning
  },
  do: {
    good: 5.0, // > 5.0 mg/L is good
    warning: 4.0, // 4.0-5.0 mg/L is warning, < 4.0 is concerning
  },
  ph: {
    goodMin: 7.5,
    goodMax: 8.5,
    warningMin: 7.0,
    warningMax: 9.0,
  },
  tss: {
    // For biofloc systems, optimal is 200-600, but for general water quality:
    good: 600, // < 600 mg/L is good
    warning: 800, // 600-800 mg/L is warning, > 800 is concerning
  },
} as const;

/**
 * Determine risk level for ammonia (lower is better)
 */
function getAmmoniaRiskLevel(value: number): RiskLevel {
  if (value <= THRESHOLDS.ammonia.good) {
    return 'low';
  } else if (value <= THRESHOLDS.ammonia.warning) {
    return 'medium';
  } else {
    return 'high';
  }
}

/**
 * Determine risk level for DO (higher is better)
 */
function getDORiskLevel(value: number): RiskLevel {
  if (value >= THRESHOLDS.do.good) {
    return 'low';
  } else if (value >= THRESHOLDS.do.warning) {
    return 'medium';
  } else {
    return 'high';
  }
}

/**
 * Determine risk level for pH (optimal range is 7.5-8.5)
 */
function getPHRiskLevel(value: number): RiskLevel {
  if (value >= THRESHOLDS.ph.goodMin && value <= THRESHOLDS.ph.goodMax) {
    return 'low';
  } else if (value >= THRESHOLDS.ph.warningMin && value <= THRESHOLDS.ph.warningMax) {
    return 'medium';
  } else {
    return 'high';
  }
}

/**
 * Determine risk level for TSS (moderate levels are acceptable in biofloc)
 */
function getTSSRiskLevel(value: number): RiskLevel {
  if (value <= THRESHOLDS.tss.good) {
    return 'low';
  } else if (value <= THRESHOLDS.tss.warning) {
    return 'medium';
  } else {
    return 'high';
  }
}

/**
 * Calculate the overall water quality risk
 */
export function calculateEutrophicationRisk(
  reading: SensorReading
): WaterQualityRiskResult {
  const ammoniaRisk = getAmmoniaRiskLevel(reading.ammonia);
  const doRisk = getDORiskLevel(reading.do);
  const phRisk = getPHRiskLevel(reading.ph);
  const tssRisk = getTSSRiskLevel(reading.tss);

  // Build parameter status array
  const parameters: ParameterRiskStatus[] = [
    {
      parameter: 'ammonia',
      label: 'Ammonia (TAN)',
      value: reading.ammonia,
      unit: 'mg/L',
      riskLevel: ammoniaRisk,
      threshold: THRESHOLDS.ammonia,
      isInverted: true,
    },
    {
      parameter: 'do',
      label: 'Dissolved Oxygen',
      value: reading.do,
      unit: 'mg/L',
      riskLevel: doRisk,
      threshold: THRESHOLDS.do,
      isInverted: false,
    },
    {
      parameter: 'ph',
      label: 'pH',
      value: reading.ph,
      unit: '',
      riskLevel: phRisk,
      threshold: { good: THRESHOLDS.ph.goodMax, warning: THRESHOLDS.ph.warningMax },
      isInverted: false,
    },
    {
      parameter: 'tss',
      label: 'TSS',
      value: reading.tss,
      unit: 'mg/L',
      riskLevel: tssRisk,
      threshold: THRESHOLDS.tss,
      isInverted: true,
    },
  ];

  // Determine overall risk (highest of all)
  const riskLevels = [ammoniaRisk, doRisk, phRisk, tssRisk];
  let overallRisk: RiskLevel;
  if (riskLevels.includes('high')) {
    overallRisk = 'high';
  } else if (riskLevels.includes('medium')) {
    overallRisk = 'medium';
  } else {
    overallRisk = 'low';
  }

  // Map risk to category and description
  const categoryMap: Record<
    RiskLevel,
    { category: WaterQualityRiskResult['riskCategory']; description: string }
  > = {
    low: {
      category: 'Excellent',
      description:
        'Water quality parameters are within optimal ranges. The IMTA system is well-balanced with low stress on aquatic organisms.',
    },
    medium: {
      category: 'Acceptable',
      description:
        'Some parameters are approaching warning thresholds. Monitor closely and consider adjustments to feeding or aeration.',
    },
    high: {
      category: 'Concerning',
      description:
        'Critical parameters detected that may stress aquatic life. Immediate action recommended to prevent mortality.',
    },
  };

  const { category: riskCategory, description } = categoryMap[overallRisk];

  return {
    overallRisk,
    riskCategory,
    description,
    parameters,
  };
}

/**
 * Get color classes for risk level styling
 */
export function getRiskColorClasses(risk: RiskLevel): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} {
  switch (risk) {
    case 'low':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        badge: 'bg-emerald-500',
      };
    case 'medium':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        badge: 'bg-amber-500',
      };
    case 'high':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        badge: 'bg-red-500',
      };
  }
}

/**
 * Get progress bar percentage based on value position within thresholds
 */
export function getProgressPercentage(
  value: number,
  thresholds: { good: number; warning: number },
  isInverted: boolean = false
): number {
  const maxValue = thresholds.warning * 1.25; // Scale to show values beyond warning threshold
  const percentage = (value / maxValue) * 100;
  return Math.min(percentage, 100);
}

// Export aliases for backward compatibility
export type EutrophicationRiskLevel = RiskLevel;
export type NutrientStatus = ParameterRiskStatus;
export type EutrophicationRiskResult = WaterQualityRiskResult;
