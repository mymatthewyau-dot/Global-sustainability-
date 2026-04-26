'use client';

import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { db, id } from '@/lib/instant';
import { useFarm } from '@/lib/farm-context';
import { SensorReading, WQIScore } from '@/types';
import { calculateWQI } from '@/lib/wqi-calculator';
import { SIX_MONTH_HISTORY, LATEST_READING } from '@/lib/cci-data';
import {
  calculateCCI,
  getTrophicState,
  getTrophicColor,
  getTrophicRiskLabel,
  getDOStatus,
  getDOStatusColor,
} from '@/lib/cci-calculator';

interface RiskTabProps {
  latestReading: SensorReading | null;
  readings: SensorReading[];
  wqi: WQIScore | null;
  farmId: string;
}

function getParamStatus(param: 'do' | 'phosphorus' | 'nitrogen', value: number): { label: string; color: string; barPct: number } {
  if (param === 'do') {
    if (value >= 5.0) return { label: 'Good', color: '#00C896', barPct: Math.min(100, (value / 10) * 100) };
    if (value >= 4.0) return { label: 'Moderate', color: '#F59E0B', barPct: (value / 10) * 100 };
    if (value >= 3.0) return { label: 'Low', color: '#F59E0B', barPct: (value / 10) * 100 };
    return { label: 'Critical', color: '#EF4444', barPct: (value / 10) * 100 };
  }
  if (param === 'phosphorus') {
    if (value <= 0.05) return { label: 'Optimal', color: '#00C896', barPct: Math.min(100, (value / 0.3) * 100) };
    if (value <= 0.10) return { label: 'Elevated', color: '#F59E0B', barPct: (value / 0.3) * 100 };
    if (value <= 0.20) return { label: 'Elevated ↑', color: '#F59E0B', barPct: (value / 0.3) * 100 };
    return { label: 'Critical', color: '#EF4444', barPct: Math.min(100, (value / 0.3) * 100) };
  }
  if (value <= 1.0) return { label: 'Optimal', color: '#00C896', barPct: Math.min(100, (value / 6) * 100) };
  if (value <= 2.0) return { label: 'Elevated', color: '#F59E0B', barPct: (value / 6) * 100 };
  if (value <= 5.0) return { label: 'Elevated ↑', color: '#F59E0B', barPct: (value / 6) * 100 };
  return { label: 'Critical', color: '#EF4444', barPct: Math.min(100, (value / 6) * 100) };
}


function getFarmSummary(reading: SensorReading): string {
  const doStatus = reading.dissolvedOxygen >= 5
    ? `DO is healthy at ${reading.dissolvedOxygen} mg/L`
    : `DO is low at ${reading.dissolvedOxygen} mg/L`;
  const nStatus = reading.nitrogen > 2
    ? `nitrogen is elevated at ${reading.nitrogen} mg/L`
    : `nitrogen is normal at ${reading.nitrogen} mg/L`;
  const pStatus = reading.phosphorus > 0.1 ? 'phosphorus is elevated' : 'phosphorus is stable';
  const condition =
    reading.phosphorus > 0.2 || reading.nitrogen > 5 || reading.dissolvedOxygen < 3 ? 'poor condition'
    : reading.phosphorus > 0.1 || reading.nitrogen > 2 || reading.dissolvedOxygen < 4 ? 'moderate condition'
    : 'good condition';
  return `Your farm is in ${condition}. ${doStatus}. ${nStatus[0].toUpperCase() + nStatus.slice(1)} and ${pStatus}.`;
}

// ── SixMonthTrendChart component ──────────────────────────────────────────────

function SixMonthTrendChart() {
  const W = 340, H = 200;
  const pad = { top: 16, right: 12, bottom: 30, left: 36 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const data = SIX_MONTH_HISTORY;
  const n = data.length;

  const xLabels = data.filter((_, i) => i % 4 === 0 || i === n - 1);
  const xOf = (i: number) => pad.left + (i / (n - 1)) * chartW;
  const yOf = (v: number) => pad.top + chartH - (v / 100) * chartH;
  const polyPts = (key: 'nScore' | 'pScore' | 'doScore') =>
    data.map((d, i) => `${xOf(i)},${yOf(d[key])}`).join(' ');
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div>
      <div style={{ color: '#6B8FAF', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>
        6-Month Trend — Apr to Oct (Weekly)
      </div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: '#00C896' }}>— DO Score</span>
        <span style={{ fontSize: 11, color: '#F59E0B' }}>— N Score</span>
        <span style={{ fontSize: 11, color: '#8B5CF6' }}>— P Score</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
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
            <text key={d.date} x={xOf(i)} y={H - 4} fill="#6B8FAF" fontSize="9" textAnchor="middle" fontFamily="sans-serif">
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function CCICircularityWidget() {
  const { nScore, pScore, doScore } = LATEST_READING;
  const cci = calculateCCI(nScore, pScore, doScore);
  const trophicState = getTrophicState(nScore, pScore);
  const trophicColor = getTrophicColor(trophicState);
  const doStatus = getDOStatus(doScore);
  const doColor = getDOStatusColor(doStatus);

  const R = 44, cx = 60, cy = 60, strokeW = 9;
  const sectorAngle = (2 * Math.PI) / 3;

  const segments: { key: string; score: number; color: string }[] = [
    { key: 'DO', score: doScore, color: '#00C896' },
    { key: 'N',  score: nScore,  color: '#F59E0B' },
    { key: 'P',  score: pScore,  color: '#8B5CF6' },
  ];

  function arcPath(score: number, idx: number) {
    const startAngle = -Math.PI / 2 + idx * sectorAngle + 0.04;
    const endAngle   = startAngle + sectorAngle * (score / 100) - 0.04;
    const x1 = cx + R * Math.cos(startAngle);
    const y1 = cy + R * Math.sin(startAngle);
    const x2 = cx + R * Math.cos(endAngle);
    const y2 = cy + R * Math.sin(endAngle);
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
  }

  function arcBg(idx: number) {
    const startAngle = -Math.PI / 2 + idx * sectorAngle + 0.04;
    const endAngle   = -Math.PI / 2 + (idx + 1) * sectorAngle - 0.04;
    const x1 = cx + R * Math.cos(startAngle);
    const y1 = cy + R * Math.sin(startAngle);
    const x2 = cx + R * Math.cos(endAngle);
    const y2 = cy + R * Math.sin(endAngle);
    return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;
  }

  return (
    <div style={{ background: '#0D2440', borderRadius: 12, padding: 16, border: '1px solid #163455', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160 }}>
      <div style={{ color: '#6B8FAF', fontSize: 9, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>CCI Score</div>
      <svg width={120} height={120} viewBox="0 0 120 120">
        {segments.map((seg, i) => (
          <path key={`bg-${seg.key}`} d={arcBg(i)} fill="none" stroke="#163455" strokeWidth={strokeW} strokeLinecap="round" />
        ))}
        {segments.map((seg, i) => (
          <path key={`arc-${seg.key}`} d={arcPath(seg.score, i)} fill="none" stroke={seg.color} strokeWidth={strokeW} strokeLinecap="round" />
        ))}
        <text x={cx} y={cy - 4} fill="#FFFFFF" fontSize="14" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
          {cci.total}%
        </text>
        <text x={cx} y={cy + 10} fill="#6B8FAF" fontSize="7" textAnchor="middle" fontFamily="sans-serif">CCI</text>
        {cci.exceedsASC && (
          <text x={cx} y={cy + 22} fill="#00C896" fontSize="6" textAnchor="middle" fontFamily="sans-serif">✓ ASC</text>
        )}
      </svg>
      <div style={{ marginTop: 10, width: '100%' }}>
        {segments.map((seg) => (
          <div key={seg.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color }} />
              <span style={{ color: '#6B8FAF', fontSize: 10 }}>{seg.key}</span>
            </div>
            <span style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 600 }}>{seg.score}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #163455', paddingTop: 6, marginTop: 4 }}>
          <div style={{ color: trophicColor, fontSize: 9, fontWeight: 600 }}>{trophicState}</div>
          <div style={{ color: doColor, fontSize: 9, marginTop: 2 }}>DO: {doStatus}</div>
        </div>
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

  // ── No data state ────────────────────────────────────────────────────────────
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

  const doStatus = getParamStatus('do',          latestReading.dissolvedOxygen);
  const pStatus  = getParamStatus('phosphorus',  latestReading.phosphorus);
  const nStatus  = getParamStatus('nitrogen',    latestReading.nitrogen);

  const dangerAlerts: { title: string; msg: string }[] = [];
  if (latestReading.nitrogen > 2)
    dangerAlerts.push({ title: '⚠ Nitrogen Elevated', msg: `Nitrogen at ${latestReading.nitrogen} mg/L — above safe threshold (2 mg/L). Consider reducing feed input.` });
  if (latestReading.phosphorus > 0.1)
    dangerAlerts.push({ title: '⚠ Phosphorus Elevated', msg: `Phosphorus at ${latestReading.phosphorus} mg/L — above recommended level (0.1 mg/L).` });
  if (latestReading.dissolvedOxygen < 4)
    dangerAlerts.push({ title: '⚠ Low Dissolved Oxygen', msg: `DO at ${latestReading.dissolvedOxygen} mg/L — below minimum threshold (4 mg/L). Increase aeration immediately.` });

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

      {/* Eutrophication Risk — Trophic State */}
      {(() => {
        const trophicState = getTrophicState(LATEST_READING.nScore, LATEST_READING.pScore);
        const trophicColor = getTrophicColor(trophicState);
        const riskLabel    = getTrophicRiskLabel(trophicState);
        const doStatus     = getDOStatus(LATEST_READING.doScore);
        const doColor      = getDOStatusColor(doStatus);
        const thumbPct = trophicState === 'Oligotrophic' ? 10 : trophicState === 'Mesotrophic' ? 38 : trophicState === 'Eutrophic' ? 65 : 88;
        return (
          <div style={{ background: '#0D2440', borderRadius: 12, padding: 18, border: '1px solid #163455', marginBottom: 14 }}>
            <div style={{ color: '#6B8FAF', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>Eutrophication Risk</div>
            <div style={{ color: trophicColor, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{riskLabel}</div>
            <div style={{ color: '#6B8FAF', fontSize: 11, marginBottom: 14 }}>Trophic State: <span style={{ color: trophicColor, fontWeight: 600 }}>{trophicState}</span></div>
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <div style={{ background: 'linear-gradient(90deg,#00C896 0%,#3B82F6 33%,#F59E0B 66%,#EF4444 100%)', width: '100%', height: 14, borderRadius: 20, opacity: 0.7 }} />
              <div style={{ position: 'absolute', top: '50%', left: `${thumbPct}%`, transform: 'translate(-50%,-50%)', width: 20, height: 20, background: trophicColor, borderRadius: '50%', border: '3px solid #FFFFFF', boxShadow: `0 0 10px ${trophicColor}88` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 10, color: '#00C896' }}>Oligotrophic</span>
              <span style={{ fontSize: 10, color: '#3B82F6' }}>Mesotrophic</span>
              <span style={{ fontSize: 10, color: '#F59E0B' }}>Eutrophic</span>
              <span style={{ fontSize: 10, color: '#EF4444' }}>Hyper-eutrophic</span>
            </div>
            <div style={{ background: '#071A2E', borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <div style={{ color: '#6B8FAF', fontSize: 9, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 8 }}>Reference Thresholds</div>
              {[
                { state: 'Oligotrophic',    n: '< 0.3 mg/L',   p: '< 0.008 mg/L', cond: 'Clear, healthy water',        color: '#00C896' },
                { state: 'Mesotrophic',     n: '0.3–0.5 mg/L', p: '~0.027 mg/L',  cond: 'Moderate nutrients, balanced', color: '#3B82F6' },
                { state: 'Eutrophic',       n: '0.5–1.5 mg/L', p: '~0.084 mg/L',  cond: 'Algal blooms, O₂ depletion',  color: '#F59E0B' },
                { state: 'Hyper-eutrophic', n: '> 1.5 mg/L',   p: '> 0.1 mg/L',   cond: 'Severe blooms, dead zones',   color: '#EF4444' },
              ].map((row) => (
                <div key={row.state} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0',
                  borderBottom: '1px solid #163455', opacity: row.state === trophicState ? 1 : 0.45,
                }}>
                  <div style={{ width: 3, height: 16, background: row.color, borderRadius: 2, flexShrink: 0 }} />
                  <span style={{ color: row.color, fontSize: 9, fontWeight: 700, minWidth: 90 }}>{row.state}</span>
                  <span style={{ color: '#6B8FAF', fontSize: 9, minWidth: 72 }}>N: {row.n}</span>
                  <span style={{ color: '#6B8FAF', fontSize: 9, minWidth: 80 }}>P: {row.p}</span>
                  <span style={{ color: '#9CA3AF', fontSize: 9 }}>{row.cond}</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#071A2E', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: doColor, boxShadow: `0 0 6px ${doColor}` }} />
              <div>
                <div style={{ color: '#6B8FAF', fontSize: 9, textTransform: 'uppercase', letterSpacing: '1px' }}>DO Consequence</div>
                <div style={{ color: doColor, fontSize: 11, fontWeight: 600 }}>{doStatus} — Score {LATEST_READING.doScore}/100</div>
                <div style={{ color: '#6B8FAF', fontSize: 9, marginTop: 2 }}>
                  Normal: DO &gt; 6–8 mg/L · Hypoxia: &lt; 2 mg/L · Anoxia: ≈ 0–0.5 mg/L
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Parameters */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ color: '#6B8FAF', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>Parameters</div>
        {[
          { name: 'Dissolved Oxygen (DO)', value: latestReading.dissolvedOxygen, unit: 'mg/L', status: doStatus, valColor: doStatus.color },
          { name: 'Phosphorus',            value: latestReading.phosphorus,      unit: 'mg/L', status: pStatus,  valColor: pStatus.color  === '#00C896' ? '#FFFFFF' : pStatus.color  },
          { name: 'Nitrogen',              value: latestReading.nitrogen,         unit: 'mg/L', status: nStatus,  valColor: nStatus.color  === '#00C896' ? '#FFFFFF' : nStatus.color  },
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

      {/* 6-Month Trend + CCI Circularity Widget */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ background: '#0D2440', borderRadius: 12, padding: 18, border: '1px solid #163455', flex: 1 }}>
          <SixMonthTrendChart />
        </div>
        <CCICircularityWidget />
      </div>

      {/* Alerts */}
      <div>
        <div style={{ color: '#6B8FAF', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>Alerts</div>
        {dangerAlerts.map((a) => (
          <div key={a.title} style={{ background: '#1A0D0D', border: '1px solid #3B1515', borderRadius: 12, padding: '14px 18px', marginBottom: 8 }}>
            <div style={{ color: '#EF4444', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{a.title}</div>
            <div style={{ color: '#9CA3AF', fontSize: 12 }}>{a.msg}</div>
          </div>
        ))}
        {latestReading.dissolvedOxygen >= 5 && (
          <div style={{ background: '#0A1F15', border: '1px solid #0A3320', borderRadius: 12, padding: '14px 18px', marginBottom: 8 }}>
            <div style={{ color: '#00C896', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>✓ DO Levels Healthy</div>
            <div style={{ color: '#9CA3AF', fontSize: 12 }}>Dissolved oxygen within ideal range. No action needed.</div>
          </div>
        )}
        {wqi && wqi.overall >= 90 && (
          <div style={{ background: '#0A1F15', border: '1px solid #0A3320', borderRadius: 12, padding: '14px 18px', marginBottom: 8 }}>
            <div style={{ color: '#00C896', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>✓ Excellent Water Quality</div>
            <div style={{ color: '#9CA3AF', fontSize: 12 }}>WQI score of {wqi.overall} — all parameters in optimal range.</div>
          </div>
        )}
        {dangerAlerts.length === 0 && (!wqi || wqi.overall < 90) && latestReading.dissolvedOxygen >= 4 && (
          <div style={{ background: '#0A1F15', border: '1px solid #0A3320', borderRadius: 12, padding: '14px 18px' }}>
            <div style={{ color: '#00C896', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>✓ No Critical Alerts</div>
            <div style={{ color: '#9CA3AF', fontSize: 12 }}>All parameters are within acceptable ranges. Continue monitoring.</div>
          </div>
        )}
      </div>
    </div>
  );
}
