'use client';

import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { db, id } from '@/lib/instant';
import { useFarm } from '@/lib/farm-context';
import { SensorReading, WQIScore } from '@/types';
import { calculateWQI } from '@/lib/wqi-calculator';
import { SIX_MONTH_HISTORY } from '@/lib/cci-data';
import {
  EUTROPHICATION_WEIGHTS,
  nMgLToScore,
  pMgLToScore,
  doMgLToScore,
  getTrophicState,
  getTrophicColor,
  getTrophicRiskLabel,
  getDOStatus,
  getDOStatusColor,
  TrophicState,
  DOStatus,
} from '@/lib/cci-calculator';

interface RiskTabProps {
  latestReading: SensorReading | null;
  readings: SensorReading[];
  wqi: WQIScore | null;
  farmId: string;
}

// Research-aligned thresholds for progress bars
function getParamStatus(
  param: 'do' | 'phosphorus' | 'nitrogen',
  value: number,
): { label: string; color: string; barPct: number } {
  if (param === 'do') {
    if (value >= 6) return { label: 'Normal',         color: '#00C896', barPct: Math.min(100, (value / 10) * 100) };
    if (value >= 4) return { label: 'Moderate',       color: '#F59E0B', barPct: (value / 10) * 100 };
    if (value >= 2) return { label: 'Hypoxic',        color: '#F97316', barPct: (value / 10) * 100 };
    return            { label: 'Anoxic – Critical',   color: '#EF4444', barPct: (value / 10) * 100 };
  }
  if (param === 'phosphorus') {
    // Oligotrophic <0.008 · Mesotrophic <0.027 · Eutrophic <0.1 · Hyper ≥0.1
    if (value < 0.008) return { label: 'Oligotrophic',   color: '#00C896', barPct: Math.min(100, (value / 0.3) * 100) };
    if (value < 0.027) return { label: 'Mesotrophic',    color: '#3B82F6', barPct: Math.min(100, (value / 0.3) * 100) };
    if (value < 0.1)   return { label: 'Eutrophic',      color: '#F59E0B', barPct: Math.min(100, (value / 0.3) * 100) };
    return               { label: 'Hyper-eutrophic',     color: '#EF4444', barPct: Math.min(100, (value / 0.3) * 100) };
  }
  // nitrogen (NO₃-N): Oligotrophic <0.3 · Mesotrophic 0.3-0.5 · Eutrophic 0.5-1.5 · Hyper >1.5
  if (value < 0.3) return  { label: 'Oligotrophic',    color: '#00C896', barPct: Math.min(100, (value / 3) * 100) };
  if (value < 0.5) return  { label: 'Mesotrophic',     color: '#3B82F6', barPct: Math.min(100, (value / 3) * 100) };
  if (value < 1.5) return  { label: 'Eutrophic',       color: '#F59E0B', barPct: Math.min(100, (value / 3) * 100) };
  return                   { label: 'Hyper-eutrophic',  color: '#EF4444', barPct: Math.min(100, (value / 3) * 100) };
}

function getFarmSummary(reading: SensorReading): string {
  const doStr   = reading.dissolvedOxygen >= 6
    ? `DO is healthy at ${reading.dissolvedOxygen} mg/L`
    : `DO is low at ${reading.dissolvedOxygen} mg/L`;
  const nStr    = reading.nitrogen >= 0.5
    ? `nitrogen is elevated at ${reading.nitrogen} mg/L`
    : `nitrogen is normal at ${reading.nitrogen} mg/L`;
  const pStr    = reading.phosphorus >= 0.027 ? 'phosphorus is elevated' : 'phosphorus is stable';
  const condition =
    reading.phosphorus >= 0.1   || reading.nitrogen >= 1.5  || reading.dissolvedOxygen < 2 ? 'poor condition'
    : reading.phosphorus >= 0.027 || reading.nitrogen >= 0.5  || reading.dissolvedOxygen < 6 ? 'moderate condition'
    : 'good condition';
  return `Your farm is in ${condition}. ${doStr}. ${nStr[0].toUpperCase() + nStr.slice(1)} and ${pStr}.`;
}

// ── 6-Month Trend Chart ────────────────────────────────────────────────────────

function SixMonthTrendChart() {
  const W = 500, H = 195;
  const pad = { top: 16, right: 50, bottom: 34, left: 40 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const data = SIX_MONTH_HISTORY;
  const n = data.length;

  const xLabels = data.filter((_, i) => i % 5 === 0 || i === n - 1);
  const xOf = (i: number) => pad.left + (i / (n - 1)) * chartW;
  const yOf = (v: number) => pad.top + chartH - (v / 100) * chartH;
  const polyPts = (key: 'nScore' | 'pScore' | 'doScore') =>
    data.map((d, i) => `${xOf(i)},${yOf(d[key])}`).join(' ');
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div>
      <div style={{ color: '#6B8FAF', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>
        Historical Trend — Apr to Oct 2025 (Weekly)
      </div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: '#00C896' }}>— DO Score</span>
        <span style={{ fontSize: 11, color: '#F59E0B' }}>— N Score</span>
        <span style={{ fontSize: 11, color: '#8B5CF6' }}>— P Score</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
        {yTicks.map((v) => {
          const y = yOf(v);
          return (
            <g key={v}>
              <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#163455" strokeWidth="0.5" strokeDasharray="3,3" />
              <text x={pad.left - 4} y={y + 3.5} fill="#6B8FAF" fontSize="8" textAnchor="end" fontFamily="sans-serif">{v}</text>
            </g>
          );
        })}
        <line x1={pad.left} y1={pad.top + chartH} x2={W - pad.right} y2={pad.top + chartH} stroke="#1E4A6E" strokeWidth="1" />
        <polyline points={polyPts('pScore')} fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="5,3" strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={polyPts('nScore')} fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={polyPts('doScore')} fill="none" stroke="#00C896" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {(['doScore', 'nScore', 'pScore'] as const).map((key, ki) => {
          const last = data[n - 1];
          const v = last[key] as number;
          const colors = ['#00C896', '#F59E0B', '#8B5CF6'];
          return <circle key={key} cx={xOf(n - 1)} cy={yOf(v)} r="4" fill={colors[ki]} stroke="#071A2E" strokeWidth="1.5" />;
        })}
        {xLabels.map((d) => {
          const i = data.indexOf(d);
          return (
            <text key={d.date} x={xOf(i)} y={pad.top + chartH + 16} fill="#6B8FAF" fontSize="9" textAnchor="middle" fontFamily="sans-serif">
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ── Eutrophication Circularity Widget (individual parameter) ───────────────────

interface EutrParamData {
  key: string;
  score: number;
  weight: number;
  color: string;
  stateLabel: string;
  mgL: number;
  unit: string;
  targetScore: number;
  targetLabel: string;
}

function EutrophicationParamWidget({ data }: { data: EutrParamData }) {
  const cx = 45, cy = 45, R = 32, sw = 7;
  const startA = -Math.PI / 2;

  const arc = (pct: number) => {
    const p = Math.max(0.5, Math.min(99.5, pct));
    const sweep = 2 * Math.PI * (p / 100);
    const sx = cx + R * Math.cos(startA), sy = cy + R * Math.sin(startA);
    const ex = cx + R * Math.cos(startA + sweep), ey = cy + R * Math.sin(startA + sweep);
    return `M ${sx} ${sy} A ${R} ${R} 0 ${sweep > Math.PI ? 1 : 0} 1 ${ex} ${ey}`;
  };

  const delta = data.targetScore - data.score;

  return (
    <div style={{
      background: '#0D2440', borderRadius: 12, padding: 14,
      border: '1px solid #163455', flex: 1, minWidth: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 8 }}>
        <span style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 700 }}>{data.key}</span>
        <span style={{ background: data.color + '22', color: data.color, fontSize: 9, borderRadius: 10, padding: '2px 6px', fontWeight: 700 }}>
          {Math.round(data.weight * 100)}%
        </span>
      </div>
      <svg width={90} height={90} viewBox="0 0 90 90">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#163455" strokeWidth={sw} />
        <path d={arc(data.targetScore)} fill="none" stroke={data.color} strokeWidth={sw} strokeOpacity={0.2} strokeLinecap="round" />
        <path d={arc(data.score)} fill="none" stroke={data.color} strokeWidth={sw} strokeLinecap="round" />
        <text x={cx} y={cy - 2} fill="#FFFFFF" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">{data.score}</text>
        <text x={cx} y={cy + 10} fill="#6B8FAF" fontSize="7" textAnchor="middle" fontFamily="sans-serif">/100</text>
      </svg>
      <div style={{ color: data.color, fontSize: 10, fontWeight: 600, marginTop: 6 }}>{data.stateLabel}</div>
      <div style={{ color: '#6B8FAF', fontSize: 10, marginTop: 3 }}>{data.mgL} {data.unit}</div>
      <div style={{ color: '#6B8FAF', fontSize: 9, marginTop: 5, textAlign: 'center', lineHeight: 1.4 }}>
        {delta > 0 ? `+${delta} pts → ${data.targetLabel}` : '✓ At target'}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function RiskTab({ latestReading, readings, wqi, farmId }: RiskTabProps) {
  const { farm } = useFarm();
  const [doInput, setDoInput]   = useState('');
  const [pInput, setPInput]     = useState('');
  const [nInput, setNInput]     = useState('');
  const [sdInput, setSdInput]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmId) return;
    setSubmitting(true);
    setSubmitMsg('');
    try {
      const reading: SensorReading = {
        farmId,
        timestamp: new Date().toISOString(),
        dissolvedOxygen: parseFloat(doInput),
        phosphorus:      parseFloat(pInput),
        nitrogen:        parseFloat(nInput),
        stockingDensity: parseFloat(sdInput),
      };
      const wqiScore = calculateWQI(reading);
      const readingId = id();
      await db.transact([
        (db.tx as any).sensorReadings[readingId].update({
          farmId,
          timestamp:       Date.now(),
          dissolvedOxygen: reading.dissolvedOxygen,
          phosphorus:      reading.phosphorus,
          nitrogen:        reading.nitrogen,
          stockingDensity: reading.stockingDensity,
          wqiScore:        wqiScore.overall,
        }),
      ]);
      setDoInput(''); setPInput(''); setNInput(''); setSdInput('');
      setSubmitMsg('Reading logged successfully.');
    } catch {
      setSubmitMsg('Error logging reading.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── No data state ──────────────────────────────────────────────────────────
  if (!latestReading) {
    return (
      <div style={{ background: '#0D2440', borderRadius: 12, padding: 24, border: '1px solid #163455', textAlign: 'center' }}>
        <div style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>No data yet</div>
        <div style={{ color: '#6B8FAF', fontSize: 13, marginBottom: 20 }}>Log your first reading to start monitoring.</div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', textAlign: 'left' }}>
            {[
              { label: 'DO (mg/L)',           val: doInput,  set: setDoInput },
              { label: 'Phosphorus (mg/L)',    val: pInput,   set: setPInput },
              { label: 'Nitrogen (mg/L)',      val: nInput,   set: setNInput },
              { label: 'Stocking (fish/m³)',   val: sdInput,  set: setSdInput },
            ].map(({ label, val, set }) => (
              <div key={label} style={{ flex: 1, minWidth: 140 }}>
                <div style={{ color: '#6B8FAF', fontSize: 10, marginBottom: 4 }}>{label}</div>
                <input required type="number" step="any" value={val} onChange={(e) => set(e.target.value)}
                  style={{ background: '#163455', borderRadius: 8, padding: '8px 12px', border: '1px solid #1E4A6E', color: '#FFFFFF', fontSize: 13, width: '100%', outline: 'none' }} />
              </div>
            ))}
          </div>
          <button type="submit" disabled={submitting}
            style={{ background: '#00C896', borderRadius: 8, padding: '10px 20px', border: 'none', color: '#071A2E', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
            {submitting ? 'Logging…' : '+ Log Reading'}
          </button>
          {submitMsg && <div style={{ color: '#00C896', fontSize: 11, marginTop: 8 }}>{submitMsg}</div>}
        </form>
      </div>
    );
  }

  // ── Compute eutrophication scores from live mg/L readings ──────────────────
  const eutrNScore  = nMgLToScore(latestReading.nitrogen);
  const eutrPScore  = pMgLToScore(latestReading.phosphorus);
  const eutrDOScore = doMgLToScore(latestReading.dissolvedOxygen);

  // Composite risk (weighted)
  const compositeRisk = Math.round(
    EUTROPHICATION_WEIGHTS.p * eutrPScore +
    EUTROPHICATION_WEIGHTS.n * eutrNScore +
    EUTROPHICATION_WEIGHTS.do * eutrDOScore,
  );

  // Trophic state (worst of N and P drives overall state)
  const trophicState = getTrophicState(eutrNScore, eutrPScore);
  const trophicColor = getTrophicColor(trophicState);
  const riskLabel    = getTrophicRiskLabel(trophicState);

  // DO consequence
  const doOxyStatus      = getDOStatus(eutrDOScore);
  const doOxyStatusColor = getDOStatusColor(doOxyStatus);

  // Individual N trophic state (N boundaries only)
  const nState: TrophicState =
    eutrNScore >= 70 ? 'Oligotrophic' : eutrNScore >= 50 ? 'Mesotrophic' : eutrNScore >= 30 ? 'Eutrophic' : 'Hyper-eutrophic';

  // Individual P trophic state (P boundaries only)
  const pState: TrophicState =
    eutrPScore >= 66 ? 'Oligotrophic' : eutrPScore >= 45 ? 'Mesotrophic' : eutrPScore >= 20 ? 'Eutrophic' : 'Hyper-eutrophic';

  // Individual DO status (from score)
  const doStatusIndiv: DOStatus =
    eutrDOScore >= 65 ? 'Normal' : eutrDOScore >= 45 ? 'Moderate stress' : eutrDOScore >= 20 ? 'Hypoxic' : 'Anoxic';

  // Next-state targets for circularity widgets
  const nTarget = eutrNScore >= 70
    ? { score: 90, label: 'Ideal' }
    : eutrNScore >= 50 ? { score: 70, label: 'Oligotrophic' }
    : eutrNScore >= 30 ? { score: 50, label: 'Mesotrophic' }
    : { score: 30, label: 'Eutrophic' };

  const pTarget = eutrPScore >= 66
    ? { score: 90, label: 'Ideal' }
    : eutrPScore >= 45 ? { score: 66, label: 'Oligotrophic' }
    : eutrPScore >= 20 ? { score: 45, label: 'Mesotrophic' }
    : { score: 20, label: 'Eutrophic' };

  const doTarget = eutrDOScore >= 65
    ? { score: 90, label: 'Ideal' }
    : eutrDOScore >= 45 ? { score: 65, label: 'Normal' }
    : { score: 45, label: 'Moderate' };

  const eutrParams: EutrParamData[] = [
    {
      key: 'N (NO₃-N)',
      score: eutrNScore,
      weight: EUTROPHICATION_WEIGHTS.n,
      color: getTrophicColor(nState),
      stateLabel: nState,
      mgL: latestReading.nitrogen,
      unit: 'mg/L',
      targetScore: nTarget.score,
      targetLabel: nTarget.label,
    },
    {
      key: 'P (TP)',
      score: eutrPScore,
      weight: EUTROPHICATION_WEIGHTS.p,
      color: getTrophicColor(pState),
      stateLabel: pState,
      mgL: latestReading.phosphorus,
      unit: 'mg/L',
      targetScore: pTarget.score,
      targetLabel: pTarget.label,
    },
    {
      key: 'DO',
      score: eutrDOScore,
      weight: EUTROPHICATION_WEIGHTS.do,
      color: getDOStatusColor(doStatusIndiv),
      stateLabel: doStatusIndiv,
      mgL: latestReading.dissolvedOxygen,
      unit: 'mg/L',
      targetScore: doTarget.score,
      targetLabel: doTarget.label,
    },
  ];

  // Progress bar statuses (for Parameters section)
  const doBarStatus = getParamStatus('do',         latestReading.dissolvedOxygen);
  const pBarStatus  = getParamStatus('phosphorus', latestReading.phosphorus);
  const nBarStatus  = getParamStatus('nitrogen',   latestReading.nitrogen);

  // Alerts
  const dangerAlerts: { title: string; msg: string }[] = [];
  if (latestReading.nitrogen >= 0.5)
    dangerAlerts.push({ title: '⚠ Nitrogen Elevated', msg: `Nitrogen at ${latestReading.nitrogen} mg/L — above Eutrophic threshold (0.5 mg/L). Consider reducing feed input.` });
  if (latestReading.phosphorus >= 0.027)
    dangerAlerts.push({ title: '⚠ Phosphorus Elevated', msg: `Phosphorus at ${latestReading.phosphorus} mg/L — above safe Mesotrophic level (0.027 mg/L).` });
  if (latestReading.dissolvedOxygen < 6)
    dangerAlerts.push({ title: '⚠ Low Dissolved Oxygen', msg: `DO at ${latestReading.dissolvedOxygen} mg/L — below Normal threshold (6 mg/L). Increase aeration immediately.` });

  const thumbPct =
    trophicState === 'Oligotrophic' ? 10
    : trophicState === 'Mesotrophic' ? 38
    : trophicState === 'Eutrophic'   ? 65 : 88;

  return (
    <div>
      {/* Farm Summary */}
      <div style={{ background: '#0D2440', borderRadius: 12, padding: 18, border: '1px solid #163455', marginBottom: 14 }}>
        <div style={{ color: '#6B8FAF', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>Farm Summary</div>
        <div style={{ color: '#FFFFFF', fontSize: 13, lineHeight: 1.8 }}>
          {farm && (
            <span style={{ color: '#6B8FAF', fontSize: 11, display: 'block', marginBottom: 4 }}>
              {farm.name}{farm.location ? ` · ${farm.location}` : ''} · IMTA since {format(new Date(farm.imtaStartDate), 'MMM yyyy')}
            </span>
          )}
          {getFarmSummary(latestReading)}
        </div>
      </div>

      {/* Alerts */}
      {dangerAlerts.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ color: '#6B8FAF', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>Alerts</div>
          {dangerAlerts.map((a) => (
            <div key={a.title} style={{ background: '#1A0D0D', border: '1px solid #3B1515', borderRadius: 12, padding: '14px 18px', marginBottom: 8 }}>
              <div style={{ color: '#EF4444', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{a.title}</div>
              <div style={{ color: '#9CA3AF', fontSize: 12 }}>{a.msg}</div>
            </div>
          ))}
        </div>
      )}

      {/* Eutrophication Risk */}
      <div style={{ background: '#0D2440', borderRadius: 12, padding: 18, border: '1px solid #163455', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ color: '#6B8FAF', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Eutrophication Risk</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#6B8FAF', fontSize: 9, textTransform: 'uppercase', letterSpacing: '1px' }}>Composite Score</div>
            <div style={{ color: trophicColor, fontSize: 16, fontWeight: 700 }}>{compositeRisk}<span style={{ color: '#6B8FAF', fontSize: 10, fontWeight: 400 }}>/100</span></div>
          </div>
        </div>
        <div style={{ color: trophicColor, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{riskLabel}</div>
        <div style={{ color: '#6B8FAF', fontSize: 11, marginBottom: 14 }}>Trophic State: <span style={{ color: trophicColor, fontWeight: 600 }}>{trophicState === 'Oligotrophic' ? 'Low Risk' : trophicState === 'Mesotrophic' ? 'Medium Risk' : trophicState === 'Eutrophic' ? 'High Risk' : 'Critical Risk'}</span></div>

        {/* Gradient gauge */}
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <div style={{ background: 'linear-gradient(90deg,#00C896 0%,#3B82F6 33%,#F59E0B 66%,#EF4444 100%)', width: '100%', height: 14, borderRadius: 20, opacity: 0.7 }} />
          <div style={{ position: 'absolute', top: '50%', left: `${thumbPct}%`, transform: 'translate(-50%,-50%)', width: 20, height: 20, background: trophicColor, borderRadius: '50%', border: '3px solid #FFFFFF', boxShadow: `0 0 10px ${trophicColor}88` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 10, color: '#00C896' }}>Low Risk</span>
          <span style={{ fontSize: 10, color: '#3B82F6' }}>Medium Risk</span>
          <span style={{ fontSize: 10, color: '#F59E0B' }}>High Risk</span>
          <span style={{ fontSize: 10, color: '#EF4444' }}>Critical Risk</span>
        </div>

        {/* Reference table */}
        <div style={{ background: '#071A2E', borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <div style={{ color: '#6B8FAF', fontSize: 9, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 8 }}>Reference Thresholds (weekly monitoring)</div>
          {[
            { state: 'Low Risk',      n: '< 0.3 mg/L',   p: '< 0.008 mg/L',  cond: 'Clear, healthy water',        color: '#00C896', key: 'Oligotrophic' },
            { state: 'Medium Risk',   n: '0.3–0.5 mg/L', p: '~0.027 mg/L',   cond: 'Moderate nutrients, balanced', color: '#3B82F6', key: 'Mesotrophic' },
            { state: 'High Risk',     n: '0.5–1.5 mg/L', p: '~0.084 mg/L',   cond: 'Algal blooms, O₂ depletion',  color: '#F59E0B', key: 'Eutrophic' },
            { state: 'Critical Risk', n: '> 1.5 mg/L',   p: '> 0.1 mg/L',    cond: 'Severe blooms, dead zones',   color: '#EF4444', key: 'Hyper-eutrophic' },
          ].map((row) => (
            <div key={row.state} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0',
              borderBottom: '1px solid #163455', opacity: row.key === trophicState ? 1 : 0.45,
            }}>
              <div style={{ width: 3, height: 16, background: row.color, borderRadius: 2, flexShrink: 0 }} />
              <span style={{ color: row.color, fontSize: 9, fontWeight: 700, minWidth: 90 }}>{row.state}</span>
              <span style={{ color: '#6B8FAF', fontSize: 9, minWidth: 72 }}>N: {row.n}</span>
              <span style={{ color: '#6B8FAF', fontSize: 9, minWidth: 80 }}>P: {row.p}</span>
              <span style={{ color: '#9CA3AF', fontSize: 9 }}>{row.cond}</span>
            </div>
          ))}
        </div>

        {/* DO consequence */}
        <div style={{ background: '#071A2E', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: doOxyStatusColor, boxShadow: `0 0 6px ${doOxyStatusColor}`, flexShrink: 0 }} />
          <div>
            <div style={{ color: '#6B8FAF', fontSize: 9, textTransform: 'uppercase', letterSpacing: '1px' }}>DO Consequence</div>
            <div style={{ color: doOxyStatusColor, fontSize: 11, fontWeight: 600 }}>{doOxyStatus} — Score {eutrDOScore}/100</div>
            <div style={{ color: '#6B8FAF', fontSize: 9, marginTop: 2 }}>
              Normal: DO &gt; 6–8 mg/L · Hypoxia: &lt; 2 mg/L · Anoxia: ≈ 0–0.5 mg/L
            </div>
          </div>
        </div>
      </div>

      {/* Parameters */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ color: '#6B8FAF', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>Parameters</div>
        {[
          { name: 'Dissolved Oxygen (DO)', value: latestReading.dissolvedOxygen, unit: 'mg/L', status: doBarStatus, valColor: doBarStatus.color },
          { name: 'Phosphorus (TP)',        value: latestReading.phosphorus,      unit: 'mg/L', status: pBarStatus,  valColor: pBarStatus.color  === '#00C896' ? '#FFFFFF' : pBarStatus.color  },
          { name: 'Nitrogen (NO₃-N)',       value: latestReading.nitrogen,        unit: 'mg/L', status: nBarStatus,  valColor: nBarStatus.color  === '#00C896' ? '#FFFFFF' : nBarStatus.color  },
        ].map(({ name, value, unit, status, valColor }) => (
          <div key={name} style={{ background: '#0D2440', borderRadius: 12, padding: '14px 18px', border: `1px solid ${status.color !== '#00C896' ? '#3B2800' : '#163455'}`, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#6B8FAF', fontSize: 11, marginBottom: 3 }}>{name}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: valColor }}>{value} <span style={{ fontSize: 11, color: '#6B8FAF', fontWeight: 400 }}>{unit}</span></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: status.color, marginBottom: 6 }}>{status.label}</div>
              <div style={{ background: '#163455', borderRadius: 6, height: 6, width: 140 }}>
                <div style={{ background: status.color, height: 6, borderRadius: 6, width: `${Math.min(100, status.barPct)}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Entry */}
      <div style={{ background: '#0D2440', borderRadius: 12, padding: '16px 18px', border: '1px solid #163455', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ color: '#6B8FAF', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Manual Data Entry</div>
          <div style={{ color: '#6B8FAF', fontSize: 10 }}>Last logged: {formatDistanceToNow(new Date(latestReading.timestamp))} ago</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            {[
              { label: 'DO (mg/L)',         val: doInput,  set: setDoInput,  placeholder: String(latestReading.dissolvedOxygen) },
              { label: 'Phosphorus (mg/L)', val: pInput,   set: setPInput,   placeholder: String(latestReading.phosphorus) },
              { label: 'Nitrogen (mg/L)',   val: nInput,   set: setNInput,   placeholder: String(latestReading.nitrogen) },
              { label: 'Stocking (fish/m³)',val: sdInput,  set: setSdInput,  placeholder: String(latestReading.stockingDensity) },
            ].map(({ label, val, set, placeholder }) => (
              <div key={label} style={{ flex: 1, minWidth: 100 }}>
                <div style={{ color: '#6B8FAF', fontSize: 10, marginBottom: 4 }}>{label}</div>
                <input required type="number" step="any" value={val} placeholder={placeholder}
                  onChange={(e) => set(e.target.value)}
                  style={{ background: '#163455', borderRadius: 8, padding: '8px 12px', border: '1px solid #1E4A6E', color: '#FFFFFF', fontSize: 13, width: '100%', outline: 'none' }} />
              </div>
            ))}
          </div>
          <button type="submit" disabled={submitting}
            style={{ background: '#00C896', borderRadius: 8, padding: 10, border: 'none', color: '#071A2E', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Logging…' : '+ Log Reading'}
          </button>
          {submitMsg && <div style={{ color: '#00C896', fontSize: 11, marginTop: 8 }}>{submitMsg}</div>}
        </form>
      </div>

      {/* 6-Month Trend Chart */}
      <div style={{ background: '#0D2440', borderRadius: 12, padding: 18, border: '1px solid #163455', marginBottom: 10 }}>
        <SixMonthTrendChart />
      </div>

      {/* Eutrophication Circularity Widgets (N · P · DO) */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ color: '#6B8FAF', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>
          Parameter Circularity — weighted 0-100 · ghost arc = next target
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {eutrParams.map((p) => <EutrophicationParamWidget key={p.key} data={p} />)}
        </div>
      </div>

    </div>
  );
}
