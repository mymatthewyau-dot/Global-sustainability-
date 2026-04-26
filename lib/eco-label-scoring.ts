import { SensorReading, WQIScore, Farm, LabelScore } from '@/types';

function daysSince(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000);
}

export function scoreEcoLabels(
  reading: SensorReading | null,
  wqi: WQIScore | null,
  farm: Farm,
): LabelScore[] {
  const imtaDays = daysSince(farm.imtaStartDate);
  const wqiScore = wqi?.overall ?? 0;
  const do_ = reading?.dissolvedOxygen ?? 0;
  const p = reading?.phosphorus ?? 0;
  const n = reading?.nitrogen ?? 0;
  const sd = reading?.stockingDensity ?? 0;
  const hasReadings = reading !== null;

  const asc: LabelScore = {
    id: 'ASC',
    name: 'ASC',
    fullName: 'Aquaculture Stewardship Council',
    region: 'Asia-Pacific',
    revenuePremium: 12400,
    revenuePct: 18,
    certCost: 2800,
    annualAudit: 900,
    criteria: [
      {
        name: 'Water Quality Baseline',
        met: wqiScore >= 70,
        detail: wqiScore >= 70
          ? `WQI ${wqiScore} ≥ 70 — sustained baseline confirmed`
          : `WQI ${wqiScore} below required 70`,
      },
      {
        name: 'Dissolved Oxygen ≥ 5 mg/L',
        met: do_ >= 5,
        detail: do_ >= 5
          ? `DO ${do_} mg/L — within optimal range`
          : `DO ${do_} mg/L — below 5 mg/L threshold`,
      },
      {
        name: 'Ammonia / Nitrogen Control',
        met: n <= 2,
        detail: n <= 2
          ? `Nitrogen ${n} mg/L — TAN under control`
          : `Nitrogen ${n} mg/L — exceeds 2 mg/L limit`,
      },
      {
        name: 'Phosphorus Control',
        met: p <= 0.1,
        detail: p <= 0.1
          ? `Phosphorus ${p} mg/L — within safe range`
          : `Phosphorus ${p} mg/L — exceeds 0.1 mg/L limit`,
      },
      {
        name: 'IMTA System Active ≥ 60 Days',
        met: imtaDays >= 60,
        detail: imtaDays >= 60
          ? `IMTA running for ${imtaDays} days`
          : `Only ${imtaDays} days — needs 60 days minimum`,
      },
      {
        name: 'Chemical-Free Period',
        met: false,
        detail: '14-day antibiotic-free window — in progress',
      },
    ],
    score: 0,
  };
  asc.score = Math.round((asc.criteria.filter((c) => c.met).length / asc.criteria.length) * 100);

  const ggap: LabelScore = {
    id: 'GlobalG.A.P.',
    name: 'GlobalG.A.P.',
    fullName: 'Good Agricultural Practices',
    region: 'Global',
    revenuePremium: 8200,
    revenuePct: 12,
    certCost: 1900,
    annualAudit: 600,
    criteria: [
      {
        name: 'Water Quality Monitoring',
        met: hasReadings,
        detail: hasReadings
          ? 'Sensor readings logged — monitoring active'
          : 'No readings logged yet',
      },
      {
        name: 'WQI ≥ 60',
        met: wqiScore >= 60,
        detail: wqiScore >= 60
          ? `WQI ${wqiScore} meets minimum`
          : `WQI ${wqiScore} below required 60`,
      },
      {
        name: 'DO ≥ 4 mg/L',
        met: do_ >= 4,
        detail: do_ >= 4
          ? `DO ${do_} mg/L — acceptable`
          : `DO ${do_} mg/L — below 4 mg/L minimum`,
      },
      {
        name: 'Stocking Density Managed',
        met: sd > 0 && sd <= 40,
        detail: sd <= 40
          ? `${sd} fish/m³ — within managed range`
          : `${sd} fish/m³ — exceeds 40 fish/m³ threshold`,
      },
      {
        name: 'Traceability Records',
        met: false,
        detail: 'Traceability documentation not yet submitted',
      },
      {
        name: 'Feed Records Available',
        met: false,
        detail: 'Feed record logs not yet linked',
      },
      {
        name: 'Worker Safety Plan',
        met: false,
        detail: 'Safety management plan not yet uploaded',
      },
    ],
    score: 0,
  };
  ggap.score = Math.round((ggap.criteria.filter((c) => c.met).length / ggap.criteria.length) * 100);

  const fots: LabelScore = {
    id: 'Friend of the Sea',
    name: 'Friend of the Sea',
    fullName: 'World Sustainability Organization',
    region: 'Global',
    revenuePremium: 5600,
    revenuePct: 8,
    certCost: 1200,
    annualAudit: 400,
    criteria: [
      {
        name: 'WQI ≥ 80',
        met: wqiScore >= 80,
        detail: wqiScore >= 80
          ? `WQI ${wqiScore} meets high standard`
          : `WQI ${wqiScore} below required 80`,
      },
      {
        name: 'Low Stocking Density (≤ 25 fish/m³)',
        met: sd > 0 && sd <= 25,
        detail: sd <= 25
          ? `${sd} fish/m³ — low-impact density`
          : `${sd} fish/m³ — exceeds low-density threshold`,
      },
      {
        name: 'Polyculture / IMTA Active',
        met: imtaDays > 0,
        detail: imtaDays > 0
          ? `Multi-species system active for ${imtaDays} days`
          : 'IMTA not yet started',
      },
      {
        name: 'Wild-Capture Component',
        met: false,
        detail: 'IMTA farms generally do not qualify — check with certifier',
      },
      {
        name: 'Habitat Protection Plan',
        met: false,
        detail: 'Habitat impact assessment not yet filed',
      },
    ],
    score: 0,
  };
  fots.score = Math.round((fots.criteria.filter((c) => c.met).length / fots.criteria.length) * 100);

  return [asc, ggap, fots];
}
