'use client';

import { useState, useMemo } from 'react';
import { format, formatDistanceToNow, differenceInDays, differenceInHours } from 'date-fns';
import { db, id } from '@/lib/instant';
import { useFarm } from '@/lib/farm-context';
import { SensorReading, WQIScore } from '@/types';
import { calculateWQI } from '@/lib/wqi-calculator';

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

function getEutrophicationRisk(reading: SensorReading): { level: string; color: string; thumbPct: number } {
  if (reading.phosphorus > 0.2 || reading.nitrogen > 5)
    return { level: 'HIGH RISK', color: '#EF4444', thumbPct: 85 };
  if (reading.phosphorus > 0.1 || reading.nitrogen > 2)
    return { level: 'MODERATE RISK', color: '#F59E0B', thumbPct: 55 };
  return { level: 'LOW RISK', color: '#00C896', thumbPct: 15 };
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

// ── Trend chart helpers ────────────────────────────────────────────────────────

function getTrendLabel(readings: SensorReading[]): string {
  if (readings.length < 2) return 'Trend';
  const oldest = new Date(readings[readings.length - 1].timestamp);
  const newest = new Date(readings[0].timestamp);
  const days = differenceInDays(newest, oldest);
  const hours = differenceInHours(newest, oldest);
  if (days >= 6) return '7-Day Trend';
  if (days >= 2) return `${days + 1}-Day Trend`;
  if (hours >= 1) return `${hours}h Trend`;
  return 'Recent Trend';
}

function getXLabel(r: SensorReading, spanDays: number): string {
  const d = new Date(r.timestamp);
  if (spanDays >= 2) return format(d, 'EEE');      // Mon, Tue …
  if (spanDays >= 1) return format(d, 'HH:mm');    // 14:30
  return format(d, 'HH:mm');
}

// ── TrendChart component ───────────────────────────────────────────────────────

function TrendChart({ readings }: { readings: SensorReading[] }) {
  const W = 340, H = 200;
  const pad = { top: 12, right: 10, bottom: 28, left: 36 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  // Use up to 14 most-recent readings, oldest first for left→right
  const pts = readings.slice(0, 14).reverse();
  const n = pts.length;

  const spanDays = n >= 2
    ? differenceInDays(new Date(pts[n - 1].timestamp), new Date(pts[0].timestamp))
    : 0;

  const label = getTrendLabel(readings);

  // Scales (fixed ranges so lines are comparable across sessions)
  const doMax = 10, nMax = 6, pMax = 0.3;

  const xOf = (i: number) => pad.left + (n > 1 ? (i / (n - 1)) * chartW : chartW / 2);
  const yOf = (v: number, max: number) => pad.top + chartH - Math.min(1, v / max) * chartH;

  const line = (vals: number[], max: number) =>
    pts.map((r, i) => `${xOf(i)},${yOf(vals[i], max)}`).join(' ');

  const doVals  = pts.map((r) => r.dissolvedOxygen);
  const nVals   = pts.map((r) => r.nitrogen);
  const pVals   = pts.map((r) => r.phosphorus);

  // x-axis labels: pick up to 5 evenly spaced
  const xLabels = pts
    .map((r, i) => ({ i, label: getXLabel(r, spanDays) }))
    .filter((_, i, arr) => {
      if (arr.length <= 5) return true;
      const step = Math.ceil(arr.length / 5);
      return i % step === 0 || i === arr.length - 1;
    });

  // y-axis ticks (DO scale on left)
  const yTicks = [0, 2.5, 5, 7.5, 10];

  if (n < 1) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B8FAF', fontSize: 11 }}>
        Log a reading to see trends
      </div>
    );
  }

  return (
    <div>
      <div style={{ color: '#6B8FAF', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: '#00C896' }}>— DO</span>
        <span style={{ fontSize: 11, color: '#F59E0B' }}>— Nitrogen</span>
        <span style={{ fontSize: 11, color: '#6B8FAF' }}>-- Phosphorus</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {/* Grid lines */}
        {yTicks.map((v) => {
          const y = yOf(v, doMax);
          return (
            <g key={v}>
              <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#163455" strokeWidth="0.5" strokeDasharray="3,3" />
              <text x={pad.left - 4} y={y + 3.5} fill="#6B8FAF" fontSize="8" textAnchor="end" fontFamily="sans-serif">{v}</text>
            </g>
          );
        })}
        {/* Nitrogen safe threshold (2 mg/L mapped on DO scale for reference) */}
        <line x1={pad.left} y1={yOf(2, doMax)} x2={W - pad.right} y2={yOf(2, doMax)} stroke="#EF4444" strokeWidth="1" strokeDasharray="5,4" opacity="0.45" />
        <text x={W - pad.right + 2} y={yOf(2, doMax) + 3} fill="#EF4444" fontSize="7" fontFamily="sans-serif">⚠</text>
        {/* Baseline axis */}
        <line x1={pad.left} y1={pad.top + chartH} x2={W - pad.right} y2={pad.top + chartH} stroke="#1E4A6E" strokeWidth="1" />

        {n >= 2 && (
          <>
            {/* Phosphorus (dashed, scaled 0–0.3 on same canvas) */}
            <polyline
              points={pts.map((r, i) => `${xOf(i)},${yOf(r.phosphorus, pMax)}`).join(' ')}
              fill="none" stroke="#6B8FAF" strokeWidth="1.5" strokeDasharray="5,3"
              strokeLinejoin="round" strokeLinecap="round"
            />
            {/* Nitrogen (scaled 0–6) */}
            <polyline
              points={line(nVals, nMax)}
              fill="none" stroke="#F59E0B" strokeWidth="2"
              strokeLinejoin="round" strokeLinecap="round"
            />
            {/* DO (scaled 0–10) */}
            <polyline
              points={line(doVals, doMax)}
              fill="none" stroke="#00C896" strokeWidth="2.5"
              strokeLinejoin="round" strokeLinecap="round"
            />
            {/* Data-point circles */}
            {pts.map((r, i) => {
              const nColor = r.nitrogen > 2 ? '#EF4444' : '#F59E0B';
              return (
                <g key={i}>
                  <circle cx={xOf(i)} cy={yOf(r.dissolvedOxygen, doMax)} r="3.5" fill="#00C896" stroke="#071A2E" strokeWidth="1.5" />
                  <circle cx={xOf(i)} cy={yOf(r.nitrogen, nMax)} r="3.5" fill={nColor} stroke="#071A2E" strokeWidth="1.5" />
                </g>
              );
            })}
          </>
        )}
        {n === 1 && (
          <>
            <circle cx={xOf(0)} cy={yOf(doVals[0], doMax)} r="4" fill="#00C896" stroke="#071A2E" strokeWidth="1.5" />
            <circle cx={xOf(0)} cy={yOf(nVals[0], nMax)} r="4" fill="#F59E0B" stroke="#071A2E" strokeWidth="1.5" />
            <text x={xOf(0)} y={pad.top + chartH + 18} fill="#6B8FAF" fontSize="9" textAnchor="middle" fontFamily="sans-serif">Now</text>
          </>
        )}
        {/* X-axis labels */}
        {n >= 2 && xLabels.map(({ i, label: lbl }) => (
          <text key={i} x={xOf(i)} y={H - 4} fill="#6B8FAF" fontSize="9" textAnchor="middle" fontFamily="sans-serif">{lbl}</text>
        ))}
      </svg>
      {n === 1 && (
        <div style={{ color: '#6B8FAF', fontSize: 10, marginTop: 6, textAlign: 'center' }}>
          Log more readings to see a trend line
        </div>
      )}
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

  const recent5 = readings.slice(0, 5);

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

  const eutroph = getEutrophicationRisk(latestReading);
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

      {/* Eutrophication Risk */}
      <div style={{ background: '#0D2440', borderRadius: 12, padding: 18, border: '1px solid #163455', marginBottom: 14 }}>
        <div style={{ color: '#6B8FAF', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>Eutrophication Risk</div>
        <div style={{ color: eutroph.color, fontSize: 22, fontWeight: 700, marginBottom: 14 }}>{eutroph.level}</div>
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <div style={{ background: 'linear-gradient(90deg,#00C896 0%,#F59E0B 50%,#EF4444 100%)', width: '100%', height: 14, borderRadius: 20, opacity: 0.65 }} />
          <div style={{ position: 'absolute', top: '50%', left: `${eutroph.thumbPct}%`, transform: 'translate(-50%,-50%)', width: 20, height: 20, background: eutroph.color, borderRadius: '50%', border: '3px solid #FFFFFF', boxShadow: `0 0 10px ${eutroph.color}88` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#00C896' }}>Safe</span>
          <span style={{ fontSize: 11, color: '#F59E0B' }}>Moderate</span>
          <span style={{ fontSize: 11, color: '#EF4444' }}>Critical</span>
        </div>
      </div>

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

      {/* Trend Chart + Recent Readings */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        {/* Trend Chart */}
        <div style={{ background: '#0D2440', borderRadius: 12, padding: 18, border: '1px solid #163455', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TrendChart readings={readings} />
        </div>

        {/* Recent Readings */}
        <div style={{ background: '#0D2440', borderRadius: 12, padding: 16, border: '1px solid #163455', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#6B8FAF', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 12 }}>Recent Readings</div>
          {recent5.length === 0 ? (
            <div style={{ color: '#6B8FAF', fontSize: 11 }}>No readings yet.</div>
          ) : (
            recent5.map((r) => (
              <div key={r.id ?? r.timestamp} style={{ background: '#163455', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 600 }}>
                    {format(new Date(r.timestamp), 'MMM d, HH:mm')}
                  </span>
                  <span style={{ background: '#0A1F35', color: '#6B8FAF', borderRadius: 4, padding: '2px 7px', fontSize: 9 }}>Manual</span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ color: '#6B8FAF', fontSize: 11 }}>P <strong style={{ color: '#fff' }}>{r.phosphorus}</strong></span>
                  <span style={{ color: '#6B8FAF', fontSize: 11 }}>N <strong style={{ color: r.nitrogen > 2 ? '#F59E0B' : '#fff' }}>{r.nitrogen}</strong></span>
                  <span style={{ color: '#6B8FAF', fontSize: 11 }}>DO <strong style={{ color: '#00C896' }}>{r.dissolvedOxygen}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
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
