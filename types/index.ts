export interface SensorReading {
  id?: string;
  farmId?: string;
  timestamp: string;
  dissolvedOxygen: number;   // mg/L
  phosphorus: number;         // mg/L — Total Phosphorus
  nitrogen: number;           // mg/L — Total Nitrogen
  stockingDensity: number;    // fish/m³
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
  lastUpdated: string;
}

export interface StockingRecommendation {
  action: string;
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
  direction: 'reduce' | 'increase' | 'maintain';
  percentChange?: number;
}

export interface Farm {
  id: string;
  name: string;
  location?: string;
  imtaStartDate: string;
  createdAt: string;
  ownerId: string;
  initialStockingDensity: number;
}

export interface LabelCriterion {
  name: string;
  met: boolean;
  detail: string;
}

export interface LabelScore {
  id: string;
  name: string;
  fullName: string;
  score: number;
  criteria: LabelCriterion[];
  revenuePremium: number;
  revenuePct: number;
  certCost: number;
  annualAudit: number;
  region: string;
}
