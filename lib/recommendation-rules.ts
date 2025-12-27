/**
 * Recommendation Rules - Easy to modify thresholds and actions
 * Rule-based logic for feeding and species recommendations
 */

export interface RecommendationRule {
  condition: (reading: any, wqi: number) => boolean;
  category: 'Feeding' | 'Species' | 'Maintenance';
  action: string;
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
  dataLink?: string;
}

export const RECOMMENDATION_RULES: RecommendationRule[] = [
  // Feeding Recommendations
  {
    condition: (reading, wqi) => reading.do < 6,
    category: 'Feeding',
    action: 'Reduce tilapia feed by 20% and delay feeding until DO > 6 mg/L',
    reason: 'Low dissolved oxygen (<6 mg/L) stresses fish metabolism. Reducing feed decreases oxygen demand.',
    priority: 'High',
    dataLink: 'Dissolved Oxygen',
  },
  {
    condition: (reading, wqi) => reading.do >= 6 && reading.do < 7,
    category: 'Feeding',
    action: 'Reduce feed to 12kg at 09:00 (low DO window). Use herbal blend (circularity 92%)',
    reason: 'DO levels are moderate. Herbal blends reduce organic load and improve water quality.',
    priority: 'Medium',
    dataLink: 'Dissolved Oxygen',
  },
  {
    condition: (reading, wqi) => reading.turbidity > 15,
    category: 'Feeding',
    action: 'Reduce feed by 15% and use herbal blend feed',
    reason: 'High turbidity (>15 NTU) indicates waste accumulation. Reducing feed decreases organic load.',
    priority: 'High',
    dataLink: 'Turbidity',
  },
  {
    condition: (reading, wqi) => reading.ammonia > 0.1,
    category: 'Feeding',
    action: 'Reduce feed by 25% immediately and increase water exchange',
    reason: 'High ammonia (>0.1 mg/L) is toxic to fish. Reducing feed decreases ammonia production.',
    priority: 'High',
    dataLink: 'Ammonia',
  },
  {
    condition: (reading, wqi) => reading.temperature > 28,
    category: 'Feeding',
    action: 'Feed during cooler hours (early morning/evening) and reduce quantity by 10%',
    reason: 'High temperature (>28°C) increases metabolic stress. Feeding during cooler periods optimizes growth.',
    priority: 'Medium',
    dataLink: 'Temperature',
  },
  
  // Species Recommendations
  {
    condition: (reading, wqi) => reading.turbidity > 15,
    category: 'Species',
    action: 'Add mussels (filter feeders) - target: 50-100 individuals per 100m²',
    reason: 'Turbidity >15 NTU risks algal blooms. Mussels filter organics and reduce turbidity by 30-50%. No feed needed, compatible with shrimp.',
    priority: 'High',
    dataLink: 'Turbidity',
  },
  {
    condition: (reading, wqi) => reading.tn > 1 || reading.tp > 0.1,
    category: 'Species',
    action: 'Add seaweed (Gracilaria or Ulva) - nutrient uptake species',
    reason: 'High nutrients (TN >1 mg/L or TP >0.1 mg/L) risk eutrophication. Seaweed absorbs excess nutrients and provides habitat.',
    priority: 'Medium',
    dataLink: 'Total Nitrogen',
  },
  {
    condition: (reading, wqi) => reading.turbidity > 10 && reading.ammonia > 0.05,
    category: 'Species',
    action: 'Add sea cucumbers - organic waste bottom cleaners',
    reason: 'High organic waste accumulation. Sea cucumbers consume detritus and improve bottom quality, reducing ammonia production.',
    priority: 'Medium',
    dataLink: 'Turbidity',
  },
  {
    condition: (reading, wqi) => wqi < 50,
    category: 'Species',
    action: 'Consider adding macroalgae (Caulerpa) for rapid nutrient uptake',
    reason: 'Poor water quality (WQI <50) requires immediate intervention. Fast-growing macroalgae can quickly reduce nutrient levels.',
    priority: 'High',
  },
  
  // Maintenance Recommendations
  {
    condition: (reading, wqi) => reading.ph < 6.5,
    category: 'Maintenance',
    action: 'Add lime or increase aeration to raise pH',
    reason: 'Low pH (<6.5) causes acidification stress. Lime buffers acidity, aeration helps maintain pH balance.',
    priority: 'High',
    dataLink: 'pH',
  },
  {
    condition: (reading, wqi) => reading.ph > 8.5,
    category: 'Maintenance',
    action: 'Increase water exchange or add organic matter to lower pH',
    reason: 'High pH (>8.5) can cause ammonia toxicity. Water exchange dilutes alkalinity.',
    priority: 'Medium',
    dataLink: 'pH',
  },
  {
    condition: (reading, wqi) => reading.do < 5,
    category: 'Maintenance',
    action: 'Increase aeration immediately - consider emergency water exchange',
    reason: 'Critical DO levels (<5 mg/L) risk fish mortality. Immediate aeration is required.',
    priority: 'High',
    dataLink: 'Dissolved Oxygen',
  },
];

