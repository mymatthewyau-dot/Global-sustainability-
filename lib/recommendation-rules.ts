/**
 * Recommendation Rules - Easy to modify thresholds and actions
 * Rule-based logic for feeding and species recommendations
 * Updated for new 7-parameter system: Temperature, pH, DO, TSS, Salinity, Ammonia, Alkalinity
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
    condition: (reading) => reading.do < 5,
    category: 'Feeding',
    action: 'Reduce feed by 30% and delay feeding until DO > 5 mg/L',
    reason: 'Low dissolved oxygen (<5 mg/L) stresses fish metabolism. Reducing feed decreases oxygen demand.',
    priority: 'High',
    dataLink: 'Dissolved Oxygen',
  },
  {
    condition: (reading) => reading.do >= 5 && reading.do < 6,
    category: 'Feeding',
    action: 'Reduce feed to 80% of normal and feed during cooler hours when DO is higher',
    reason: 'DO levels are moderate. Feeding during cooler periods optimizes growth and reduces stress.',
    priority: 'Medium',
    dataLink: 'Dissolved Oxygen',
  },
  {
    condition: (reading) => reading.tss > 700,
    category: 'Feeding',
    action: 'Reduce feed by 20% and improve sludge management',
    reason: 'High TSS (>700 mg/L) indicates excess biofloc or organic accumulation. Reducing feed decreases organic load.',
    priority: 'High',
    dataLink: 'TSS',
  },
  {
    condition: (reading) => reading.ammonia > 1.0,
    category: 'Feeding',
    action: 'Reduce feed by 50% immediately and increase aeration',
    reason: 'High ammonia (>1.0 mg/L TAN) is toxic to fish and shrimp. Reducing feed decreases ammonia production.',
    priority: 'High',
    dataLink: 'Ammonia',
  },
  {
    condition: (reading) => reading.ammonia > 0.5 && reading.ammonia <= 1.0,
    category: 'Feeding',
    action: 'Reduce feed by 25% and add carbon source for biofloc',
    reason: 'Elevated ammonia (0.5-1.0 mg/L) indicates nitrogen imbalance. Adding carbon promotes microbial uptake.',
    priority: 'Medium',
    dataLink: 'Ammonia',
  },
  {
    condition: (reading) => reading.temperature > 32,
    category: 'Feeding',
    action: 'Feed only during cooler hours (early morning/evening) and reduce quantity by 20%',
    reason: 'High temperature (>32°C) increases metabolic stress. Feeding during cooler periods optimizes digestion.',
    priority: 'Medium',
    dataLink: 'Temperature',
  },
  
  // Species Recommendations
  {
    condition: (reading) => reading.tss < 200,
    category: 'Species',
    action: 'Add carbon source (molasses/bran) to build biofloc for shrimp ponds',
    reason: 'Low TSS (<200 mg/L) indicates insufficient biofloc for nitrogen control. Biofloc supports shrimp growth.',
    priority: 'Medium',
    dataLink: 'TSS',
  },
  {
    condition: (reading) => reading.ammonia > 0.5,
    category: 'Species',
    action: 'Increase Ulva seaweed area - nutrient uptake species',
    reason: 'Elevated ammonia indicates nutrient excess. Ulva effectively absorbs nitrogen and improves water quality.',
    priority: 'Medium',
    dataLink: 'Ammonia',
  },
  {
    condition: (reading) => reading.tss > 100 && reading.salinity > 15,
    category: 'Species',
    action: 'Consider adding filter-feeding shellfish (mussels/oysters)',
    reason: 'Moderate TSS in marine conditions. Filter feeders reduce particulates and provide secondary harvest.',
    priority: 'Low',
    dataLink: 'TSS',
  },
  {
    condition: (reading, wqi) => wqi < 50,
    category: 'Species',
    action: 'Increase seaweed cultivation area for rapid nutrient uptake',
    reason: 'Poor water quality (WQI <50) requires intervention. Fast-growing seaweed can quickly reduce nutrient levels.',
    priority: 'High',
  },
  
  // Maintenance Recommendations
  {
    condition: (reading) => reading.ph < 7.0,
    category: 'Maintenance',
    action: 'Add lime or sodium bicarbonate to raise pH and alkalinity',
    reason: 'Low pH (<7.0) causes acidification stress. Lime buffers acidity and supports shell formation.',
    priority: 'High',
    dataLink: 'pH',
  },
  {
    condition: (reading) => reading.ph > 9.0,
    category: 'Maintenance',
    action: 'Increase water exchange and reduce algae blooms',
    reason: 'High pH (>9.0) can cause ammonia toxicity. Control photosynthesis-driven pH spikes.',
    priority: 'High',
    dataLink: 'pH',
  },
  {
    condition: (reading) => reading.alkalinity < 80,
    category: 'Maintenance',
    action: 'Add agricultural lime or baking soda to increase buffering capacity',
    reason: 'Low alkalinity (<80 mg/L) reduces pH stability and affects molting in shrimp.',
    priority: 'High',
    dataLink: 'Alkalinity',
  },
  {
    condition: (reading) => reading.alkalinity > 180,
    category: 'Maintenance',
    action: 'Reduce liming and perform partial water exchange with softer water',
    reason: 'High alkalinity (>180 mg/L) may affect ion balance. Gradual reduction is recommended.',
    priority: 'Medium',
    dataLink: 'Alkalinity',
  },
  {
    condition: (reading) => reading.do < 4,
    category: 'Maintenance',
    action: 'Emergency aeration required - run all aerators and consider water exchange',
    reason: 'Critical DO levels (<4 mg/L) risk mortality. Immediate aeration is essential.',
    priority: 'High',
    dataLink: 'Dissolved Oxygen',
  },
  {
    condition: (reading) => reading.salinity < 10 && reading.salinity > 0,
    category: 'Maintenance',
    action: 'For marine species, gradually increase salinity with seawater addition',
    reason: 'Low salinity may stress marine species. Gradual adjustment prevents osmotic shock.',
    priority: 'Medium',
    dataLink: 'Salinity',
  },
  {
    condition: (reading) => reading.salinity > 35,
    category: 'Maintenance',
    action: 'Add freshwater to reduce hypersaline conditions',
    reason: 'High salinity (>35 ppt) can stress even marine species. Dilute gradually.',
    priority: 'Medium',
    dataLink: 'Salinity',
  },
];
