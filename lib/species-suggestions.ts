/**
 * Species-specific suggestions database
 * Provides actionable recommendations based on parameter scores and direction
 */

import { ParameterKey } from './species-suitability-config';

export type Direction = 'too_low' | 'too_high';
export type Score = 0 | 1;

export interface Suggestion {
  speciesId: string;
  parameter: ParameterKey;
  score: Score;
  direction: Direction;
  immediate: string;  // Next 24 hours
  shortTerm: string;  // Next few days
}

export const SPECIES_SUGGESTIONS: Suggestion[] = [
  // ============================================
  // SALINITY SUGGESTIONS
  // ============================================
  
  // Shrimp - Salinity
  {
    speciesId: 'shrimp',
    parameter: 'salinity',
    score: 0,
    direction: 'too_low',
    immediate: 'Slowly add pre-dissolved seawater or brine from a reservoir, in several small doses, instead of throwing in dry salt to avoid osmotic shock.',
    shortTerm: 'Plan a series of partial water exchanges over the next few days so salinity climbs back into the 15-25 ppt band while you watch shrimp behaviour closely.',
  },
  {
    speciesId: 'shrimp',
    parameter: 'salinity',
    score: 0,
    direction: 'too_high',
    immediate: 'Begin 10-20% water exchanges with low-salinity freshwater or rainwater storage, added gradually to prevent sudden salinity drops.',
    shortTerm: 'Continue staged exchanges and, if needed, harvest from the saltiest ponds first until salinity returns safely between about 15 and 25 ppt.',
  },
  {
    speciesId: 'shrimp',
    parameter: 'salinity',
    score: 1,
    direction: 'too_low',
    immediate: 'Make a small correction by adding pre-mixed brine and mixing it well so local cold, salty pockets do not form.',
    shortTerm: 'Adjust future inflow and evaporation management (e.g. covering some surface, using more saline intake when needed) so the pond drifts back toward the middle of the 15-25 ppt range.',
  },
  {
    speciesId: 'shrimp',
    parameter: 'salinity',
    score: 1,
    direction: 'too_high',
    immediate: 'Top up the pond with a modest volume of freshwater to nudge salinity downward without shocking the stock.',
    shortTerm: 'Review your water sources, evaporation and rainfall patterns so you can schedule small, regular corrections rather than waiting for salinity to creep into risky territory.',
  },

  // Tilapia - Salinity
  {
    speciesId: 'tilapia',
    parameter: 'salinity',
    score: 0,
    direction: 'too_high',
    immediate: 'Start partial water exchanges using lower-salinity freshwater until salinity falls back toward single-digit levels.',
    shortTerm: 'Reallocate tilapia to fresher ponds or cages over the next few days, keeping the saltiest units for more tolerant species instead.',
  },
  {
    speciesId: 'tilapia',
    parameter: 'salinity',
    score: 1,
    direction: 'too_high',
    immediate: 'Limit stressful operations like grading or transport and begin gentle freshening of the water with small freshwater additions.',
    shortTerm: 'Adapt your long-term intake mix (more river/well water, less seawater) so tilapia ponds usually stay under roughly 10 ppt.',
  },

  // Ulva - Salinity
  {
    speciesId: 'ulva',
    parameter: 'salinity',
    score: 0,
    direction: 'too_low',
    immediate: 'Gradually increase salinity by introducing more concentrated seawater into the Ulva area while keeping flows well mixed.',
    shortTerm: 'Stabilise future operations so Ulva units consistently receive 25-35 ppt water, for example by drawing intake closer to marine sources or separating them from very fresh inflows.',
  },
  {
    speciesId: 'ulva',
    parameter: 'salinity',
    score: 0,
    direction: 'too_high',
    immediate: 'Dilute the water carefully with low-salinity inflow until salinity returns to a tolerable zone.',
    shortTerm: 'Reconfigure intakes and discharge so Ulva is not exposed to prolonged evaporation-driven hypersaline pockets above roughly 35 ppt.',
  },
  {
    speciesId: 'ulva',
    parameter: 'salinity',
    score: 1,
    direction: 'too_low',
    immediate: 'Make a small upward adjustment using pre-mixed brine, ensuring good circulation around the seaweed.',
    shortTerm: 'Fine-tune the balance between freshwater and seawater inputs so Ulva usually sees salinity in the centre of the 25-35 ppt window.',
  },
  {
    speciesId: 'ulva',
    parameter: 'salinity',
    score: 1,
    direction: 'too_high',
    immediate: 'Add a modest amount of freshwater to bring salinity down gradually while watching for any signs of tissue stress.',
    shortTerm: 'Monitor evaporation and adjust shading or water-exchange frequency so Ulva beds do not slowly drift into hypersaline conditions again.',
  },

  // ============================================
  // TEMPERATURE SUGGESTIONS
  // ============================================

  // Shrimp - Temperature
  {
    speciesId: 'shrimp',
    parameter: 'temperature',
    score: 0,
    direction: 'too_low',
    immediate: 'Reduce handling and feeding immediately and, if possible, cover part of the pond with plastic or greenhouse film to trap heat.',
    shortTerm: 'Improve night-time heat retention with windbreaks and partial covers so the pond stays closer to the 26-32°C band over the next few days.',
  },
  {
    speciesId: 'shrimp',
    parameter: 'temperature',
    score: 0,
    direction: 'too_high',
    immediate: 'Pause feeding during peak heat and increase aeration to help shrimp cope with the oxygen demand.',
    shortTerm: 'Add emergency shading and, if possible, increase cooler water inflow or pond depth to bring temperatures back into the safe 26-32°C range.',
  },
  {
    speciesId: 'shrimp',
    parameter: 'temperature',
    score: 1,
    direction: 'too_low',
    immediate: 'Slightly reduce feeding and avoid stressful operations during the coldest hours.',
    shortTerm: 'Use light greenhouse covers or shallow sun-exposed zones so the water warms into the middle of the 26-32°C range.',
  },
  {
    speciesId: 'shrimp',
    parameter: 'temperature',
    score: 1,
    direction: 'too_high',
    immediate: 'Shift most feeding to cooler morning and evening periods.',
    shortTerm: 'Install shade cloth over sections of the pond or tweak water depth so daily highs no longer exceed the comfort zone.',
  },

  // Tilapia - Temperature
  {
    speciesId: 'tilapia',
    parameter: 'temperature',
    score: 0,
    direction: 'too_low',
    immediate: 'Cut back feeding sharply and avoid netting, grading or transport.',
    shortTerm: 'Use shallow, sun-exposed areas or simple greenhouse covers so water warms back toward 26-30°C over the next few days.',
  },
  {
    speciesId: 'tilapia',
    parameter: 'temperature',
    score: 0,
    direction: 'too_high',
    immediate: 'Pause feeding at midday and boost aeration to prevent heat-driven oxygen crashes.',
    shortTerm: 'Add shade (nets, floating covers) or increase water exchange so peak temperatures fall back below 32°C.',
  },
  {
    speciesId: 'tilapia',
    parameter: 'temperature',
    score: 1,
    direction: 'too_low',
    immediate: 'Reduce feed size slightly and schedule stressful tasks only during warmer periods.',
    shortTerm: 'Plan low-cost structures (plastic sheets, windbreaks) to reduce cold-night losses and keep temperatures nearer the optimal band.',
  },
  {
    speciesId: 'tilapia',
    parameter: 'temperature',
    score: 1,
    direction: 'too_high',
    immediate: 'Move most feeding to early morning and late afternoon.',
    shortTerm: 'Gradually increase shading or adjust pond depth so heat spikes are moderated without sudden changes.',
  },

  // Ulva - Temperature
  {
    speciesId: 'ulva',
    parameter: 'temperature',
    score: 0,
    direction: 'too_low',
    immediate: 'Reduce harvesting and avoid sudden light or depth changes that add extra stress.',
    shortTerm: 'Relocate Ulva lines/rafts to slightly shallower, sun-exposed areas so the crop stabilises closer to 20-25°C.',
  },
  {
    speciesId: 'ulva',
    parameter: 'temperature',
    score: 0,
    direction: 'too_high',
    immediate: 'Increase water exchange or mixing with cooler source water to bring temperatures down.',
    shortTerm: 'Shift Ulva to deeper or more shaded positions so it avoids prolonged exposure to surface heat spikes.',
  },
  {
    speciesId: 'ulva',
    parameter: 'temperature',
    score: 1,
    direction: 'too_low',
    immediate: 'Keep handling minimal and monitor colour and growth closely.',
    shortTerm: 'Fine-tune depth and flow so Ulva receives slightly warmer, well-lit water during the day.',
  },
  {
    speciesId: 'ulva',
    parameter: 'temperature',
    score: 1,
    direction: 'too_high',
    immediate: 'Provide partial shading during the hottest hours.',
    shortTerm: 'Adjust the layout so Ulva experiences slightly cooler flows, keeping average temperatures within the 20-25°C band.',
  },

  // ============================================
  // DISSOLVED OXYGEN SUGGESTIONS
  // ============================================

  // Shrimp - DO
  {
    speciesId: 'shrimp',
    parameter: 'dissolvedOxygen',
    score: 0,
    direction: 'too_low',
    immediate: 'Stop feeding immediately and switch on all available aerators or water pumps to raise DO above 4 mg/L as fast as possible.',
    shortTerm: 'Over the next few days, lower night-time biomass or feeding rates and add more permanent aeration capacity to prevent repeated crashes.',
  },
  {
    speciesId: 'shrimp',
    parameter: 'dissolvedOxygen',
    score: 1,
    direction: 'too_low',
    immediate: 'Shift most feeding to times when DO is highest and avoid heavy feeding at night.',
    shortTerm: 'Review stocking and aeration plans so that night-time DO consistently stays above 5 mg/L.',
  },

  // Tilapia - DO
  {
    speciesId: 'tilapia',
    parameter: 'dissolvedOxygen',
    score: 0,
    direction: 'too_low',
    immediate: 'Pause feeding and run aerators continuously until DO rises above 3 mg/L.',
    shortTerm: 'Re-balance tilapia density and feeding schedules so DO normally stays at or above 5 mg/L in the future.',
  },
  {
    speciesId: 'tilapia',
    parameter: 'dissolvedOxygen',
    score: 1,
    direction: 'too_low',
    immediate: 'Feed smaller meals during periods of higher DO and avoid disturbing the pond at night.',
    shortTerm: 'Plan to add aeration or reduce organic loading so the system spends more time in the 5-7 mg/L optimal range.',
  },

  // Ulva - DO
  {
    speciesId: 'ulva',
    parameter: 'dissolvedOxygen',
    score: 0,
    direction: 'too_low',
    immediate: 'Increase mixing and aeration to prevent night-time anoxia near the seaweed.',
    shortTerm: 'Optimise Ulva biomass and animal stocking so respiration at night does not drive DO below 3 mg/L.',
  },
  {
    speciesId: 'ulva',
    parameter: 'dissolvedOxygen',
    score: 1,
    direction: 'too_low',
    immediate: 'Increase gentle water movement through the seaweed area.',
    shortTerm: 'Fine-tune Ulva density and animal load so daytime photosynthesis and night respiration balance keeps DO consistently above 4 mg/L.',
  },

  // ============================================
  // TSS (TURBIDITY) SUGGESTIONS
  // ============================================

  // Shrimp - TSS (Biofloc system)
  {
    speciesId: 'shrimp',
    parameter: 'tss',
    score: 0,
    direction: 'too_low',
    immediate: 'Start adding a carbon source like molasses or bran at an appropriate C:N ratio to quickly encourage heterotrophic floc formation.',
    shortTerm: 'Gradually build and maintain a light brown/green floc water that keeps TAN under control and provides natural feed for shrimp.',
  },
  {
    speciesId: 'shrimp',
    parameter: 'tss',
    score: 0,
    direction: 'too_high',
    immediate: 'Reduce mechanical disturbance and, if needed, carry out a partial water exchange to quickly lower extreme solids levels that clog gills and reduce DO.',
    shortTerm: 'Combine careful chemical clarification (e.g. alum plus lime, or gypsum) with improved sludge removal to bring TSS back into the safe biofloc range.',
  },
  {
    speciesId: 'shrimp',
    parameter: 'tss',
    score: 1,
    direction: 'too_low',
    immediate: 'Slightly increase carbon input (molasses/bran) to thicken biofloc without overshooting.',
    shortTerm: 'Fine-tune routine carbon dosing so TSS stays in the target band that supports shrimp growth and nitrogen removal.',
  },
  {
    speciesId: 'shrimp',
    parameter: 'tss',
    score: 1,
    direction: 'too_high',
    immediate: 'Cut feeding a bit and avoid unnecessary stirring from boats, nets or strong aeration jets that resuspend sludge.',
    shortTerm: 'Improve regular sludge management and, if required, use mild clarification so TSS stabilises comfortably inside the recommended biofloc range.',
  },

  // Tilapia - TSS
  {
    speciesId: 'tilapia',
    parameter: 'tss',
    score: 0,
    direction: 'too_high',
    immediate: 'Cut back feeding and reduce activities that resuspend bottom sludge, especially during low-oxygen periods.',
    shortTerm: 'Improve solids removal infrastructure (settling areas, sludge drains) so very high TSS does not return and gill health is protected.',
  },
  {
    speciesId: 'tilapia',
    parameter: 'tss',
    score: 1,
    direction: 'too_high',
    immediate: 'Slightly reduce feed and avoid dragging nets along the bottom except when necessary.',
    shortTerm: 'Use tilapia as floc grazers where appropriate and strengthen routine solids management so visibility remains acceptable.',
  },

  // Ulva - TSS
  {
    speciesId: 'ulva',
    parameter: 'tss',
    score: 0,
    direction: 'too_high',
    immediate: 'Minimise upstream erosion and resuspension immediately and, if needed, start partial clarification to restore light penetration for photosynthesis.',
    shortTerm: 'Re-arrange flows so Ulva sits in cleaner, better-lit water while other units or devices handle most of the solids load.',
  },
  {
    speciesId: 'ulva',
    parameter: 'tss',
    score: 1,
    direction: 'too_high',
    immediate: 'Limit activities that stir up sediment near Ulva and, if possible, divert the worst turbidity away from seaweed lines.',
    shortTerm: 'Gradually improve upstream erosion control and solids handling so Ulva receives clearer water and better light penetration.',
  },

  // ============================================
  // ALKALINITY SUGGESTIONS
  // ============================================

  // Shrimp - Alkalinity
  {
    speciesId: 'shrimp',
    parameter: 'alkalinity',
    score: 0,
    direction: 'too_low',
    immediate: 'Add dissolved sodium bicarbonate or agricultural lime in small, spaced doses to raise alkalinity without shocking pH.',
    shortTerm: 'Plan a regular liming schedule so the system stays in the 100-150 mg/L CaCO₃ band that buffers pH and supports molting.',
  },
  {
    speciesId: 'shrimp',
    parameter: 'alkalinity',
    score: 0,
    direction: 'too_high',
    immediate: 'Carry out partial water exchanges with lower-alkalinity water to bring levels down safely.',
    shortTerm: 'Use careful acidification (e.g. organic acids) only if needed, while re-balancing liming and fertiliser inputs so alkalinity stays within a stable range.',
  },
  {
    speciesId: 'shrimp',
    parameter: 'alkalinity',
    score: 1,
    direction: 'too_low',
    immediate: 'Apply a modest corrective dose of dissolved bicarbonate or lime and recheck alkalinity after mixing.',
    shortTerm: 'Adjust routine liming frequency so alkalinity drifts back toward the middle of the 100-150 mg/L CaCO₃ range.',
  },
  {
    speciesId: 'shrimp',
    parameter: 'alkalinity',
    score: 1,
    direction: 'too_high',
    immediate: 'Start with small water exchanges using softer water rather than a single large flush.',
    shortTerm: 'Reduce or pause liming until alkalinity returns toward the target band, then resume at a lower maintenance dose.',
  },

  // Tilapia - Alkalinity
  {
    speciesId: 'tilapia',
    parameter: 'alkalinity',
    score: 0,
    direction: 'too_low',
    immediate: 'Apply dissolved agricultural lime or baking soda to increase buffering capacity and prevent sharp pH swings.',
    shortTerm: 'Maintain periodic small liming doses so pH swings stay limited and alkalinity remains within 50-150 mg/L CaCO₃.',
  },
  {
    speciesId: 'tilapia',
    parameter: 'alkalinity',
    score: 0,
    direction: 'too_high',
    immediate: 'Use gradual water exchange with softer water to reduce alkalinity without shocking fish.',
    shortTerm: 'Review fertiliser and liming practices so long-term alkalinity does not creep above the recommended range.',
  },
  {
    speciesId: 'tilapia',
    parameter: 'alkalinity',
    score: 1,
    direction: 'too_low',
    immediate: 'Add a smaller corrective dose of lime or bicarbonate and monitor pH and alkalinity over 24 hours.',
    shortTerm: 'Incorporate alkalinity checks into routine water-quality monitoring so you can correct downward drift early.',
  },
  {
    speciesId: 'tilapia',
    parameter: 'alkalinity',
    score: 1,
    direction: 'too_high',
    immediate: 'Make small, repeated water exchanges instead of a single large change.',
    shortTerm: 'Temporarily reduce or stop liming until alkalinity settles back toward the centre of the safe band.',
  },

  // Ulva - Alkalinity
  {
    speciesId: 'ulva',
    parameter: 'alkalinity',
    score: 0,
    direction: 'too_low',
    immediate: 'Add buffering agents such as agricultural lime to stabilise pH for Ulva and co-cultured species.',
    shortTerm: 'Plan preventative soil and water treatments so future fluctuations in CO₂ do not push alkalinity below 100 mg/L.',
  },
  {
    speciesId: 'ulva',
    parameter: 'alkalinity',
    score: 0,
    direction: 'too_high',
    immediate: 'Dilute with lower-alkalinity water and monitor pH closely to avoid rapid shifts.',
    shortTerm: 'Adjust any upstream liming or fertiliser inputs so the buffer level stays within the 100-150 mg/L CaCO₃ window.',
  },
  {
    speciesId: 'ulva',
    parameter: 'alkalinity',
    score: 1,
    direction: 'too_low',
    immediate: 'Apply a light liming dose and monitor both alkalinity and Ulva performance.',
    shortTerm: 'Adjust background liming so alkalinity stays within 100-150 mg/L CaCO₃ to support both algae and animals.',
  },
  {
    speciesId: 'ulva',
    parameter: 'alkalinity',
    score: 1,
    direction: 'too_high',
    immediate: 'Begin moderate water exchanges using softer water to nudge alkalinity downward.',
    shortTerm: 'Reduce liming intensity and check whether fertiliser formulations are contributing excess alkalinity.',
  },

  // ============================================
  // pH SUGGESTIONS
  // ============================================

  // Shrimp - pH
  {
    speciesId: 'shrimp',
    parameter: 'ph',
    score: 0,
    direction: 'too_low',
    immediate: 'Add lime or sodium bicarbonate gradually to raise pH while monitoring ammonia toxicity.',
    shortTerm: 'Investigate the source of acidity (excess CO₃, organic decay) and address root causes to maintain pH 7.5-8.5.',
  },
  {
    speciesId: 'shrimp',
    parameter: 'ph',
    score: 0,
    direction: 'too_high',
    immediate: 'Increase water exchange and reduce algae blooms that drive pH up during the day.',
    shortTerm: 'Balance photosynthesis and respiration by adjusting stocking and shading to prevent extreme pH swings.',
  },
  {
    speciesId: 'shrimp',
    parameter: 'ph',
    score: 1,
    direction: 'too_low',
    immediate: 'Add a small dose of lime or bicarbonate and recheck pH after mixing.',
    shortTerm: 'Monitor diurnal pH patterns and adjust alkalinity management to keep pH stable in the optimal range.',
  },
  {
    speciesId: 'shrimp',
    parameter: 'ph',
    score: 1,
    direction: 'too_high',
    immediate: 'Increase gentle water exchange during peak pH hours.',
    shortTerm: 'Consider adding shade or adjusting algae management to reduce afternoon pH spikes.',
  },

  // Tilapia - pH
  {
    speciesId: 'tilapia',
    parameter: 'ph',
    score: 0,
    direction: 'too_low',
    immediate: 'Apply lime or baking soda and increase aeration to help stabilise pH.',
    shortTerm: 'Maintain adequate alkalinity buffering to prevent acid stress on tilapia.',
  },
  {
    speciesId: 'tilapia',
    parameter: 'ph',
    score: 0,
    direction: 'too_high',
    immediate: 'Increase water exchange to dilute high-pH water and reduce algae-driven pH elevation.',
    shortTerm: 'Control dense algae blooms and maintain consistent water turnover to moderate pH fluctuations.',
  },
  {
    speciesId: 'tilapia',
    parameter: 'ph',
    score: 1,
    direction: 'too_low',
    immediate: 'Add a corrective dose of buffering agent and monitor the response.',
    shortTerm: 'Strengthen routine alkalinity management to prevent pH dropping below 7.0.',
  },
  {
    speciesId: 'tilapia',
    parameter: 'ph',
    score: 1,
    direction: 'too_high',
    immediate: 'Schedule water exchanges during peak pH periods (late afternoon).',
    shortTerm: 'Balance algal productivity with water exchange so pH stays within 7.0-8.5.',
  },

  // Ulva - pH
  {
    speciesId: 'ulva',
    parameter: 'ph',
    score: 0,
    direction: 'too_low',
    immediate: 'Increase buffering with lime and ensure CO₂ levels are balanced.',
    shortTerm: 'Ulva photosynthesis naturally raises pH; check for issues blocking light or reducing algae health.',
  },
  {
    speciesId: 'ulva',
    parameter: 'ph',
    score: 0,
    direction: 'too_high',
    immediate: 'Increase water exchange to moderate extremely high pH that stresses co-cultured animals.',
    shortTerm: 'Consider reducing Ulva density or increasing animal respiration load to balance pH.',
  },
  {
    speciesId: 'ulva',
    parameter: 'ph',
    score: 1,
    direction: 'too_low',
    immediate: 'Add modest buffering and check light levels reaching Ulva.',
    shortTerm: 'Ensure Ulva is photosynthesising actively, which naturally maintains higher pH.',
  },
  {
    speciesId: 'ulva',
    parameter: 'ph',
    score: 1,
    direction: 'too_high',
    immediate: 'Moderate water exchange to balance pH without stressing Ulva.',
    shortTerm: 'Adjust system balance so pH remains in the 8.0-9.5 range optimal for Ulva.',
  },

  // ============================================
  // AMMONIA SUGGESTIONS
  // ============================================

  // Shrimp - Ammonia
  {
    speciesId: 'shrimp',
    parameter: 'ammonia',
    score: 0,
    direction: 'too_high',
    immediate: 'Stop feeding immediately, increase aeration, and begin partial water exchange to dilute toxic ammonia.',
    shortTerm: 'Review feeding rates, biofloc health, and nitrification capacity. Add probiotic bacteria or reduce stocking if needed.',
  },
  {
    speciesId: 'shrimp',
    parameter: 'ammonia',
    score: 1,
    direction: 'too_high',
    immediate: 'Reduce feeding by 25% and boost carbon addition to enhance microbial ammonia uptake in biofloc.',
    shortTerm: 'Monitor TAN daily and adjust feeding and carbon dosing until ammonia consistently stays below 0.5 mg/L.',
  },

  // Tilapia - Ammonia
  {
    speciesId: 'tilapia',
    parameter: 'ammonia',
    score: 0,
    direction: 'too_high',
    immediate: 'Halt feeding, maximise aeration, and perform water exchanges to rapidly reduce ammonia.',
    shortTerm: 'Reduce stocking density or improve biological filtration to maintain safe ammonia levels long-term.',
  },
  {
    speciesId: 'tilapia',
    parameter: 'ammonia',
    score: 1,
    direction: 'too_high',
    immediate: 'Cut back feeding and avoid disturbing sediments that release ammonia.',
    shortTerm: 'Enhance nitrification by improving biofilter maintenance or adding beneficial bacteria.',
  },

  // Ulva - Ammonia (needs some ammonia as nutrient)
  {
    speciesId: 'ulva',
    parameter: 'ammonia',
    score: 0,
    direction: 'too_low',
    immediate: 'Ulva is nutrient-limited. Consider increasing animal stocking or organic inputs upstream.',
    shortTerm: 'Rebalance the system so Ulva receives adequate ammonia (1.0-2.0 mg/L) for healthy growth.',
  },
  {
    speciesId: 'ulva',
    parameter: 'ammonia',
    score: 0,
    direction: 'too_high',
    immediate: 'Increase water flow through Ulva beds to prevent localised toxicity while utilising excess nutrients.',
    shortTerm: 'Expand Ulva cultivation area or harvest more frequently to increase ammonia uptake capacity.',
  },
  {
    speciesId: 'ulva',
    parameter: 'ammonia',
    score: 1,
    direction: 'too_low',
    immediate: 'Monitor Ulva colour and growth; slight nutrient limitation is acceptable short-term.',
    shortTerm: 'Adjust flow from animal ponds to provide more nutrient-rich water to Ulva units.',
  },
  {
    speciesId: 'ulva',
    parameter: 'ammonia',
    score: 1,
    direction: 'too_high',
    immediate: 'Ensure good water circulation and consider harvesting Ulva more frequently.',
    shortTerm: 'Balance the system by adding more Ulva biomass or reducing animal nutrient output.',
  },
];

/**
 * Get suggestions for a specific species and parameter
 */
export function getSuggestions(
  speciesId: string,
  parameter: ParameterKey,
  score: Score,
  direction: Direction
): Suggestion | undefined {
  return SPECIES_SUGGESTIONS.find(
    (s) =>
      s.speciesId === speciesId &&
      s.parameter === parameter &&
      s.score === score &&
      s.direction === direction
  );
}

/**
 * Get all suggestions for a species
 */
export function getSuggestionsForSpecies(speciesId: string): Suggestion[] {
  return SPECIES_SUGGESTIONS.filter((s) => s.speciesId === speciesId);
}

