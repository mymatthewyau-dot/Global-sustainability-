export interface SensorReading {
  timestamp: string;
  temperature: number; // °C
  ph: number;
  do: number; // Dissolved Oxygen, mg/L
  turbidity: number; // NTU
  salinity: number; // ppt
  ammonia: number; // NH3-N, mg/L
  tn: number; // Total Nitrogen, mg/L
  tp: number; // Total Phosphate, mg/L
}

export interface WQIParameterBreakdown {
  parameter: string;
  value: number;
  subIndex: number;
  weight: number;
  contribution: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface WQIScore {
  overall: number;
  category: 'Excellent' | 'Good' | 'Moderate' | 'Poor';
  breakdown: WQIParameterBreakdown[];
  trendAnalysis: string;
  lastUpdated: string;
}

export interface Recommendation {
  category: 'Feeding' | 'Species' | 'Maintenance';
  action: string;
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
  dataLink?: string; // Link to specific parameter causing this recommendation
}

export interface SensorHistory {
  readings: SensorReading[];
}

