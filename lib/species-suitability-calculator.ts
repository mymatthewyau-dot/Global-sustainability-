/**
 * Species Suitability Calculator
 * Calculates suitability scores for each species based on current sensor readings
 */

import { SensorReading } from '@/types';
import {
  ParameterKey,
  SpeciesConfig,
  SPECIES_CONFIG,
  PARAMETER_LABELS,
  Range,
  ParameterThresholds,
} from './species-suitability-config';
import { getSuggestions, Direction, Score } from './species-suggestions';

export interface ParameterScore {
  parameter: ParameterKey;
  label: string;
  unit: string;
  value: number;
  score: 0 | 1 | 2;  // 0 = danger, 1 = suboptimal, 2 = optimal
  grade: 'A' | 'B' | 'C';  // A = optimal, B = suboptimal, C = danger
  direction?: Direction;  // Only for non-optimal scores
  optimalRange: Range;
}

export interface ProblemStatement {
  parameter: ParameterKey;
  label: string;
  severity: 'danger' | 'warning';
  message: string;
  suggestion24h?: string;
  suggestionLongTerm?: string;
}

export interface SpeciesSuitability {
  species: SpeciesConfig;
  parameterScores: ParameterScore[];
  overallScore: number;  // 0-100 percentage
  overallGrade: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  problems: ProblemStatement[];
}

/**
 * Check if a value falls within any of the given ranges
 */
function isInRanges(value: number, ranges: Range[]): boolean {
  return ranges.some((range) => value >= range.min && value <= range.max);
}

/**
 * Check if a value falls within a single range
 */
function isInRange(value: number, range: Range): boolean {
  return value >= range.min && value <= range.max;
}

/**
 * Determine direction (too_low or too_high) based on value and optimal range
 */
function getDirection(value: number, optimal: Range): Direction {
  if (value < optimal.min) {
    return 'too_low';
  }
  return 'too_high';
}

/**
 * Map sensor reading field to parameter key
 */
function getSensorValue(reading: SensorReading, param: ParameterKey): number {
  switch (param) {
    case 'salinity':
      return reading.salinity;
    case 'temperature':
      return reading.temperature;
    case 'dissolvedOxygen':
      return reading.do;
    case 'tss':
      return reading.tss;
    case 'alkalinity':
      return reading.alkalinity;
    case 'ph':
      return reading.ph;
    case 'ammonia':
      return reading.ammonia;
    default:
      return 0;
  }
}

/**
 * Calculate score for a single parameter
 */
function calculateParameterScore(
  value: number,
  thresholds: ParameterThresholds
): { score: 0 | 1 | 2; direction?: Direction } {
  // Check optimal first (score 2)
  if (isInRange(value, thresholds.optimal)) {
    return { score: 2 };
  }
  
  // Check suboptimal (score 1)
  if (isInRanges(value, thresholds.suboptimal)) {
    return { 
      score: 1, 
      direction: getDirection(value, thresholds.optimal) 
    };
  }
  
  // Check danger (score 0)
  if (isInRanges(value, thresholds.danger)) {
    return { 
      score: 0, 
      direction: getDirection(value, thresholds.optimal) 
    };
  }
  
  // Default to danger if not in any range
  return { 
    score: 0, 
    direction: getDirection(value, thresholds.optimal) 
  };
}

/**
 * Convert score to letter grade
 */
function scoreToGrade(score: 0 | 1 | 2): 'A' | 'B' | 'C' {
  switch (score) {
    case 2:
      return 'A';
    case 1:
      return 'B';
    case 0:
      return 'C';
  }
}

/**
 * Calculate overall grade based on overall score percentage
 */
function getOverallGrade(score: number): 'Excellent' | 'Good' | 'Fair' | 'Poor' {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Poor';
}

/**
 * Generate problem statement for a non-optimal parameter
 */
function generateProblemStatement(
  speciesId: string,
  paramScore: ParameterScore
): ProblemStatement | null {
  if (paramScore.score === 2) return null;
  
  const severity: 'danger' | 'warning' = paramScore.score === 0 ? 'danger' : 'warning';
  const directionText = paramScore.direction === 'too_low' ? 'too low' : 'too high';
  
  const message = `${paramScore.label} is ${directionText} for ${speciesId === 'shrimp' ? 'shrimp' : speciesId === 'tilapia' ? 'tilapia' : 'Ulva'} (current: ${paramScore.value}${paramScore.unit ? ' ' + paramScore.unit : ''}, optimal: ${paramScore.optimalRange.min}-${paramScore.optimalRange.max}${paramScore.unit ? ' ' + paramScore.unit : ''})`;
  
  // Get suggestions from database
  const suggestion = paramScore.direction 
    ? getSuggestions(speciesId, paramScore.parameter, paramScore.score as Score, paramScore.direction)
    : undefined;
  
  return {
    parameter: paramScore.parameter,
    label: paramScore.label,
    severity,
    message,
    suggestion24h: suggestion?.immediate,
    suggestionLongTerm: suggestion?.shortTerm,
  };
}

/**
 * Calculate suitability for a single species
 */
export function calculateSpeciesSuitability(
  reading: SensorReading,
  species: SpeciesConfig
): SpeciesSuitability {
  const parameterKeys: ParameterKey[] = [
    'salinity',
    'temperature',
    'dissolvedOxygen',
    'tss',
    'alkalinity',
    'ph',
    'ammonia',
  ];
  
  const parameterScores: ParameterScore[] = parameterKeys.map((param) => {
    const value = getSensorValue(reading, param);
    const thresholds = species.parameters[param];
    const { score, direction } = calculateParameterScore(value, thresholds);
    const labels = PARAMETER_LABELS[param];
    
    return {
      parameter: param,
      label: labels.label,
      unit: labels.unit,
      value,
      score,
      grade: scoreToGrade(score),
      direction,
      optimalRange: thresholds.optimal,
    };
  });
  
  // Calculate overall score (average of all parameter scores, scaled to 0-100)
  const totalScore = parameterScores.reduce((sum, p) => sum + p.score, 0);
  const maxScore = parameterScores.length * 2;  // Max is 2 per parameter
  const overallScore = Math.round((totalScore / maxScore) * 100);
  
  // Generate problem statements for non-optimal parameters
  const problems: ProblemStatement[] = parameterScores
    .map((ps) => generateProblemStatement(species.id, ps))
    .filter((p): p is ProblemStatement => p !== null)
    .sort((a, b) => {
      // Sort by severity (danger first), then by parameter name
      if (a.severity !== b.severity) {
        return a.severity === 'danger' ? -1 : 1;
      }
      return a.label.localeCompare(b.label);
    });
  
  return {
    species,
    parameterScores,
    overallScore,
    overallGrade: getOverallGrade(overallScore),
    problems,
  };
}

/**
 * Calculate suitability for all species
 */
export function calculateAllSpeciesSuitability(
  reading: SensorReading
): SpeciesSuitability[] {
  return SPECIES_CONFIG.map((species) =>
    calculateSpeciesSuitability(reading, species)
  );
}

/**
 * Get aggregated problems across all species (for general recommendations)
 */
export function getAggregatedProblems(
  suitabilities: SpeciesSuitability[]
): {
  critical: ProblemStatement[];
  warnings: ProblemStatement[];
  affectedSpecies: Map<string, string[]>;  // parameter -> species names
} {
  const critical: ProblemStatement[] = [];
  const warnings: ProblemStatement[] = [];
  const affectedSpecies = new Map<string, string[]>();
  
  suitabilities.forEach((suit) => {
    suit.problems.forEach((problem) => {
      // Track which species are affected by each parameter
      const key = `${problem.parameter}-${problem.severity}`;
      const existing = affectedSpecies.get(key) || [];
      existing.push(suit.species.name);
      affectedSpecies.set(key, existing);
      
      // Add to appropriate list (avoid duplicates)
      const list = problem.severity === 'danger' ? critical : warnings;
      const exists = list.some(
        (p) => p.parameter === problem.parameter && p.severity === problem.severity
      );
      if (!exists) {
        list.push(problem);
      }
    });
  });
  
  return { critical, warnings, affectedSpecies };
}

