export interface SensorReading {
  id?: string;
  farmId?: string;
  timestamp: string;
  temperature: number; // °C
  ph: number;
  do: number; // Dissolved Oxygen, mg/L
  tss: number; // Total Suspended Solids, mg/L
  salinity: number; // ppt
  ammonia: number; // TAN (Total Ammonia Nitrogen), mg/L
  alkalinity: number; // mg/L CaCO₃
  wqiScore?: number;
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

export interface Farm {
  id: string;
  name: string;
  location?: string;
  imtaStartDate: string; // ISO date string
  createdAt: string; // ISO date string
  ownerId: string; // InstantDB auth user ID
}

export interface Activity {
  id: string;
  farmId: string;
  timestamp: string;
  type: 'feed' | 'species_added' | 'species_removed' | 'maintenance';
  species?: string;
  feedAmount?: number; // kg
  feedType?: string;
  notes?: string;
}

export interface Milestone {
  id: string;
  farmId: string;
  achievedAt: string;
  type: 'wqi_improved_10' | 'wqi_improved_25' | 'wqi_improved_50' | '30_days_tracked' | '60_days_tracked' | '90_days_tracked';
  baselineWqi: number;
  currentWqi: number;
  improvementPercent: number;
}

