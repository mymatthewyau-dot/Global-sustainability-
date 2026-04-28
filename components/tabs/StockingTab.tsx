'use client';

import { SensorReading, StockingRecommendation } from '@/types';

interface StockingTabProps {
  latestReading: SensorReading | null;
  recommendations: StockingRecommendation[];
  initialStockingDensity: number;
}

function paramBar(value: number, max: number, color: string) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ height: 6, borderRadius: 3, background: '#163455', overflow: 'hidden', margin: '4px 0' }}>
      <div style={{ height: '100%', borderRadius: 3, background: color, width: `${pct}%` }} />
    </div>
  );
}

// ── IMTA Farm Layout SVG ───────────────────────────────────────────────────────

function ImtaFarmSVG() {
  return (
    <svg viewBox="0 0 400 218" style={{ width: '100%', height: 'auto', display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="mW2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3z" fill="#F4D03F" />
        </marker>
        <marker id="mG2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3z" fill="#2ECC71" />
        </marker>

        {/* Red Snapper symbol */}
        <symbol id="RS" viewBox="0 0 44 28" overflow="visible">
          <path d="M34,14 L44,7 L41,14 L44,21 Z" fill="#D04820" stroke="#A03010" strokeWidth="0.8" />
          <ellipse cx="18" cy="14" rx="16" ry="7" fill="#FF6040" stroke="#A03010" strokeWidth="1.2" />
          <ellipse cx="15" cy="15" rx="9" ry="3.5" fill="#FF8060" opacity="0.35" />
          <path d="M10,7 Q17,1 24,7" fill="#D04820" stroke="#A03010" strokeWidth="0.8" />
          <path d="M14,17 Q18,23 22,20" fill="#D04820" stroke="#A03010" strokeWidth="0.9" strokeLinecap="round" />
          <circle cx="9" cy="12" r="3.5" fill="#fff" stroke="#A03010" strokeWidth="0.8" />
          <circle cx="9.5" cy="12.5" r="2" fill="#1A1A2E" />
          <circle cx="10.2" cy="11.8" r="0.7" fill="#fff" />
          <path d="M2,14 Q1,13 2,12" fill="none" stroke="#A03010" strokeWidth="1" strokeLinecap="round" />
        </symbol>

        {/* Oyster symbol */}
        <symbol id="OY" viewBox="0 0 22 15" overflow="visible">
          <ellipse cx="11" cy="11" rx="10" ry="4.5" fill="#C8A87A" stroke="#8B6914" strokeWidth="0.8" />
          <ellipse cx="11" cy="7"  rx="8"  ry="5.5" fill="#E8D5A0" stroke="#8B6914" strokeWidth="0.8" />
          <ellipse cx="11" cy="7"  rx="4"  ry="3"   fill="#F5EDD0" />
        </symbol>

        {/* Healthy seaweed symbol */}
        <symbol id="SW" viewBox="0 0 14 52" overflow="visible">
          <path d="M7,51 Q7,37 7,22 Q7,10 7,0" fill="none" stroke="#27AE60" strokeWidth="1.6" />
          <path d="M7,40 Q2,33 1,25 Q6,28 7,36" fill="#27AE60" opacity="0.9" />
          <path d="M7,27 Q12,20 13,13 Q8,16 7,24" fill="#2ECC71" opacity="0.9" />
          <path d="M7,15 Q2,9 1,3 Q6,6 7,13"    fill="#27AE60" opacity="0.7" />
        </symbol>

        {/* Fouled/degraded seaweed symbol */}
        <symbol id="SWF" viewBox="0 0 14 52" overflow="visible">
          <path d="M7,51 Q7,37 7,22 Q7,10 7,0" fill="none" stroke="#7A6248" strokeWidth="1.6" />
          <path d="M7,40 Q2,33 1,25 Q6,28 7,36" fill="#9E7D5A" opacity="0.8" />
          <path d="M7,27 Q12,20 13,13 Q8,16 7,24" fill="#C4A07A" opacity="0.7" />
          <path d="M7,15 Q2,9 1,3 Q6,6 7,13"    fill="#7A6248" opacity="0.6" />
          {/* epiphyte fuzz */}
          <path d="M5,36 Q3,34 4,32" fill="none" stroke="#5A8A4A" strokeWidth="0.7" opacity="0.6" />
          <path d="M9,24 Q11,22 10,20" fill="none" stroke="#5A8A4A" strokeWidth="0.7" opacity="0.6" />
        </symbol>
      </defs>

      {/* Full background */}
      <rect width="400" height="218" fill="#071A2E" />

      {/* Water background — cage area */}
      <rect x="4" y="4" width="246" height="210" fill="#08254A" rx="3" />

      {/* ── 4 NET CAGES (2×2 grid) ── */}

      {/* Cage 1 — top-left */}
      <rect x="10" y="14" width="104" height="83" fill="#0D2440" stroke="#1E4A6B" strokeWidth="1.5" rx="3" />
      {/* Cage 2 — top-right */}
      <rect x="136" y="14" width="104" height="83" fill="#0D2440" stroke="#1E4A6B" strokeWidth="1.5" rx="3" />
      {/* Cage 3 — bottom-left */}
      <rect x="10" y="121" width="104" height="83" fill="#0D2440" stroke="#1E4A6B" strokeWidth="1.5" rx="3" />
      {/* Cage 4 — bottom-right · Zone 4 · no filtration */}
      <rect x="136" y="121" width="104" height="83" fill="#1C0A08" stroke="#EF4444" strokeWidth="1.5" rx="3" strokeDasharray="5 2" />
      <rect x="136" y="121" width="104" height="83" fill="#EF444406" rx="3" />

      {/* Cage labels */}
      <text x="62"  y="11"  textAnchor="middle" fill="#4A7FA0" fontSize="7" fontFamily="system-ui">Cage 1 · 800</text>
      <text x="188" y="11"  textAnchor="middle" fill="#4A7FA0" fontSize="7" fontFamily="system-ui">Cage 2 · 800</text>
      <text x="62"  y="214" textAnchor="middle" fill="#4A7FA0" fontSize="7" fontFamily="system-ui">Cage 3 · 800</text>
      <text x="188" y="214" textAnchor="middle" fill="#EF4444" fontSize="7.5" fontFamily="system-ui" fontWeight="700">Zone 4 · 800 ✕</text>

      {/* Snapper fish icons — one per cage */}
      <use href="#RS" x="22"  y="45" width="68" height="43" />
      <use href="#RS" x="148" y="45" width="68" height="43" />
      <use href="#RS" x="22"  y="152" width="68" height="43" />
      <use href="#RS" x="148" y="152" width="68" height="43" />

      {/* ── CORRIDORS ── */}

      {/* Corridor H-top: between Cage 1 & Cage 2 (x=114–136) — OYSTERS */}
      <rect x="114" y="14" width="22" height="83" fill="#C8A87A0D" />
      <line x1="119" y1="17" x2="119" y2="94" stroke="#8B6914" strokeWidth="0.7" strokeDasharray="2 3" opacity="0.5" />
      <line x1="125" y1="17" x2="125" y2="94" stroke="#8B6914" strokeWidth="0.7" strokeDasharray="2 3" opacity="0.5" />
      <line x1="131" y1="17" x2="131" y2="94" stroke="#8B6914" strokeWidth="0.7" strokeDasharray="2 3" opacity="0.5" />
      <use href="#OY" x="111" y="26" width="22" height="15" />
      <use href="#OY" x="111" y="50" width="22" height="15" />
      <use href="#OY" x="111" y="74" width="22" height="15" />

      {/* Corridor V-left: between Cage 1 & Cage 3 (y=97–121) — OYSTERS */}
      <rect x="10" y="97" width="104" height="24" fill="#C8A87A0D" />
      <line x1="14"  y1="103" x2="110" y2="103" stroke="#8B6914" strokeWidth="0.7" strokeDasharray="2 3" opacity="0.5" />
      <line x1="14"  y1="109" x2="110" y2="109" stroke="#8B6914" strokeWidth="0.7" strokeDasharray="2 3" opacity="0.5" />
      <line x1="14"  y1="115" x2="110" y2="115" stroke="#8B6914" strokeWidth="0.7" strokeDasharray="2 3" opacity="0.5" />
      <use href="#OY" x="22"  y="95" width="22" height="15" />
      <use href="#OY" x="52"  y="95" width="22" height="15" />
      <use href="#OY" x="82"  y="95" width="22" height="15" />

      {/* Corridor H-bottom: between Cage 3 & Cage 4 (x=114–136) — OYSTERS */}
      <rect x="114" y="121" width="22" height="83" fill="#C8A87A0D" />
      <line x1="119" y1="124" x2="119" y2="201" stroke="#8B6914" strokeWidth="0.7" strokeDasharray="2 3" opacity="0.5" />
      <line x1="125" y1="124" x2="125" y2="201" stroke="#8B6914" strokeWidth="0.7" strokeDasharray="2 3" opacity="0.5" />
      <line x1="131" y1="124" x2="131" y2="201" stroke="#8B6914" strokeWidth="0.7" strokeDasharray="2 3" opacity="0.5" />
      <use href="#OY" x="111" y="133" width="22" height="15" />
      <use href="#OY" x="111" y="157" width="22" height="15" />
      <use href="#OY" x="111" y="181" width="22" height="15" />

      {/* Corridor V-right: between Cage 2 & Cage 4 (y=97–121) — ZONE 4 EMPTY */}
      <rect x="136" y="97" width="104" height="24" fill="#EF444418" />
      <text x="188" y="113" textAnchor="middle" fill="#EF4444" fontSize="7.5" fontFamily="system-ui" fontWeight="700">✕ No oyster filtration</text>

      {/* Flow: organics → oysters */}
      <path d="M114,56 Q107,62 111,72" fill="none" stroke="#F4D03F" strokeWidth="1.2" strokeDasharray="4 3" markerEnd="url(#mW2)" />

      {/* Flow: dissolved N → Sargassum */}
      <path d="M250,109 Q262,109 272,109" fill="none" stroke="#2ECC71" strokeWidth="1.2" strokeDasharray="4 3" markerEnd="url(#mG2)" />

      {/* ── DIVIDER ── */}
      <line x1="250" y1="8" x2="250" y2="210" stroke="#163455" strokeWidth="1" />

      {/* ── SARGASSUM EASTERN BOUNDARY ── */}
      <rect x="252" y="4" width="144" height="210" fill="#060E08" rx="2" />
      <text x="324" y="13" textAnchor="middle" fill="#27AE60" fontSize="7" fontFamily="system-ui" fontWeight="700">S. hemiphyllum · Eastern Boundary</text>

      {/* Ropes 1–3: healthy (green) */}
      <use href="#SW"  x="256" y="18" width="14" height="52" />
      <use href="#SW"  x="270" y="26" width="14" height="52" />
      <use href="#SW"  x="256" y="82" width="14" height="52" />
      <use href="#SW"  x="270" y="90" width="14" height="52" />
      <use href="#SW"  x="256" y="146" width="14" height="52" />

      {/* Ropes 4–8: fouled (brownish-degraded) */}
      <use href="#SWF" x="288" y="18" width="14" height="52" />
      <use href="#SWF" x="302" y="24" width="14" height="52" />
      <use href="#SWF" x="316" y="16" width="14" height="52" />
      <use href="#SWF" x="330" y="22" width="14" height="52" />
      <use href="#SWF" x="344" y="18" width="14" height="52" />
      <use href="#SWF" x="288" y="82" width="14" height="52" />
      <use href="#SWF" x="302" y="88" width="14" height="52" />
      <use href="#SWF" x="316" y="80" width="14" height="52" />
      <use href="#SWF" x="330" y="86" width="14" height="52" />
      <use href="#SWF" x="344" y="82" width="14" height="52" />
      <use href="#SWF" x="288" y="146" width="14" height="52" />
      <use href="#SWF" x="302" y="152" width="14" height="52" />
      <use href="#SWF" x="316" y="144" width="14" height="52" />

      {/* Seaweed legend */}
      <rect x="254" y="172" width="140" height="40" rx="3" fill="#071A2E" opacity="0.92" />
      <rect x="258" y="178" width="6" height="6" rx="1" fill="#27AE60" />
      <text x="268" y="184" fill="#27AE60" fontSize="7" fontFamily="system-ui">Ropes 1–3 · functional (~130 kg)</text>
      <rect x="258" y="189" width="6" height="6" rx="1" fill="#9E7D5A" />
      <text x="268" y="195" fill="#F59E0B" fontSize="7" fontFamily="system-ui">Ropes 4–8 · fouled by epiphytes</text>
      <text x="258" y="207" fill="#EF4444" fontSize="7" fontFamily="system-ui" fontWeight="600">58% thalli colonised · 34% uptake</text>
    </svg>
  );
}

// ── Trophic Balance panel ──────────────────────────────────────────────────────

function TrophicBalance() {
  const cards = [
    {
      icon: '🐠',
      name: 'Fed Species',
      sub: 'Red Snapper · Lutjanus argentimaculatus',
      color: '#FF6040',
      count: '3,200',
      unit: 'individuals · 4.0 fish/m³',
      role: 'Above optimal range (2.5–3.0/m³). FCR 2.14 vs baseline 1.58 — 35% efficiency decline from chronic stress.',
      badge: { label: '⚠ Stress indicators · above optimal density', bg: '#F4D03F22', color: '#F4D03F' },
      borderColor: '#F4D03F33',
    },
    {
      icon: '🦪',
      name: 'Organic Extractive',
      sub: 'Hong Kong Oyster · Crassostrea hongkongensis',
      color: '#C8A87A',
      count: '24,000',
      unit: 'individuals · 75% zone coverage',
      role: 'Zone 4 (200 m³) unfiltered since Q3 2024. 40% re-filtration in covered zones. Particulate P accumulating.',
      badge: { label: '✗ Zone 4 uncovered · spatial imbalance', bg: '#FF6B6B22', color: '#FF6B6B' },
      borderColor: '#FF6B6B33',
    },
    {
      icon: '🌿',
      name: 'Inorganic Extractive',
      sub: 'Sargassum · Sargassum hemiphyllum',
      color: '#2ECC71',
      count: '176 kg',
      unit: 'functional / 420 kg total wet wt.',
      role: '58% of thalli fouled by Ulva/Cladophora epiphytes. N uptake 0.31 g/kg/d vs design 0.82 g/kg/d.',
      badge: { label: '✗ Severely degraded · 34% efficiency', bg: '#FF6B6B22', color: '#FF6B6B' },
      borderColor: '#FF6B6B33',
    },
  ];

  return (
    <div style={{ background: '#0D2440', borderRadius: 12, border: '1px solid #163455', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 10, color: '#8BA3B8', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>Trophic Balance</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cards.map((c) => (
          <div key={c.name} style={{ background: '#071A2E', borderRadius: 10, border: `1px solid ${c.borderColor}`, padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, width: 26, textAlign: 'center', flexShrink: 0, marginTop: 1 }}>{c.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 3 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: c.color }}>{c.name}</div>
                  <div style={{ fontSize: 9, color: '#8BA3B8', fontStyle: 'italic' }}>{c.sub}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1, color: c.color }}>{c.count}</div>
                  <div style={{ fontSize: 9, color: '#8BA3B8' }}>{c.unit}</div>
                </div>
              </div>
              <div style={{ fontSize: 9.5, color: '#8BA3B8', lineHeight: 1.4, marginBottom: 5 }}>{c.role}</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 8.5, padding: '2px 7px', borderRadius: 5, fontWeight: 700, background: c.badge.bg, color: c.badge.color }}>{c.badge.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Daily nitrogen budget */}
      <div style={{ paddingTop: 8, borderTop: '1px solid #163455', fontSize: 9.5, color: '#8BA3B8', lineHeight: 1.7 }}>
        <div style={{ color: '#CBD5E1', fontWeight: 600, marginBottom: 2, fontSize: 10 }}>Daily N Budget</div>
        <div><span style={{ color: '#EF4444' }}>▲ Input:</span> ~15.6 g TAN/day (fish 11.4 + feed waste 4.2)</div>
        <div><span style={{ color: '#EF4444' }}>▼ Removal:</span> ~130 g N/day at 34% Sargassum capacity</div>
        <div><span style={{ color: '#EF4444' }}>⚠ Surplus:</span> ~214 g N/day accumulating as nitrate-N</div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function StockingTab({ latestReading, recommendations, initialStockingDensity }: StockingTabProps) {

  return (
    <div>
      {/* TOP GRID: Farm SVG + Trophic Balance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div style={{ background: '#0D2440', borderRadius: 12, border: '1px solid #163455', padding: 14 }}>
          <div style={{ fontSize: 10, color: '#8BA3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, fontWeight: 600 }}>IMTA Farm Layout — 3.8 ha · 4 Net Cages · 800 m³</div>
          <ImtaFarmSVG />
        </div>
        <TrophicBalance />
      </div>

      {/* Legend row */}
      <div style={{ background: '#0D2440', borderRadius: 12, border: '1px solid #163455', padding: 14, marginBottom: 12, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#C8D8E8', padding: '0 16px', borderRight: '1px solid #163455', whiteSpace: 'nowrap' }}>
          <div style={{ width: 32, height: 0, borderTop: '2px dashed #F4D03F', flexShrink: 0 }} />
          <span>💩 Organic waste</span>
          <span style={{ fontSize: 10, color: '#8BA3B8' }}>Snapper → oysters</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#C8D8E8', padding: '0 16px', borderRight: '1px solid #163455', whiteSpace: 'nowrap' }}>
          <div style={{ width: 32, height: 0, borderTop: '2px dashed #2ECC71', flexShrink: 0 }} />
          <span>🌿 Dissolved nutrients</span>
          <span style={{ fontSize: 10, color: '#8BA3B8' }}>Water → Sargassum</span>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#C8D8E8', paddingLeft: 16, whiteSpace: 'nowrap' }}>
          ⚠️ Zone 4 corridor <span style={{ color: '#EF4444', fontWeight: 700 }}>no oyster filtration</span>
        </div>
      </div>

      {/* Stats row — case study water quality */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 12 }}>
        <div style={{ background: '#0D2440', borderRadius: 10, border: '1px solid #163455', padding: '10px 12px' }}>
          <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, marginBottom: 2, color: '#EF4444' }}>4.2</div>
          <div style={{ fontSize: 10, color: '#8BA3B8' }}>mg/L — DO</div>
          <div style={{ fontSize: 9, color: '#6B8FAF', marginTop: 1 }}>Target ≥ 6.0</div>
          {paramBar(4.2, 10, '#EF4444')}
          <span style={{ display: 'inline-block', fontSize: 9, padding: '2px 6px', borderRadius: 5, marginTop: 2, fontWeight: 600, background: '#EF444422', color: '#EF4444' }}>Critical</span>
        </div>
        <div style={{ background: '#0D2440', borderRadius: 10, border: '1px solid #163455', padding: '10px 12px' }}>
          <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, marginBottom: 2, color: '#EF4444' }}>0.48</div>
          <div style={{ fontSize: 10, color: '#8BA3B8' }}>mg/L — TAN</div>
          <div style={{ fontSize: 9, color: '#6B8FAF', marginTop: 1 }}>Safe &lt; 0.10</div>
          {paramBar(0.48, 0.6, '#EF4444')}
          <span style={{ display: 'inline-block', fontSize: 9, padding: '2px 6px', borderRadius: 5, marginTop: 2, fontWeight: 600, background: '#EF444422', color: '#EF4444' }}>4.8× threshold</span>
        </div>
        <div style={{ background: '#0D2440', borderRadius: 10, border: '1px solid #163455', padding: '10px 12px' }}>
          <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, marginBottom: 2, color: '#F59E0B' }}>3.8</div>
          <div style={{ fontSize: 10, color: '#8BA3B8' }}>mg/L — Nitrate-N</div>
          <div style={{ fontSize: 9, color: '#6B8FAF', marginTop: 1 }}>Target &lt; 2.0</div>
          {paramBar(3.8, 6, '#F59E0B')}
          <span style={{ display: 'inline-block', fontSize: 9, padding: '2px 6px', borderRadius: 5, marginTop: 2, fontWeight: 600, background: '#F59E0B22', color: '#F59E0B' }}>Elevated</span>
        </div>
        <div style={{ background: '#0D2440', borderRadius: 10, border: '1px solid #163455', padding: '10px 12px' }}>
          <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, marginBottom: 2, color: '#EF4444' }}>2.14</div>
          <div style={{ fontSize: 10, color: '#8BA3B8' }}>FCR current</div>
          <div style={{ fontSize: 9, color: '#6B8FAF', marginTop: 1 }}>Baseline 1.58</div>
          {paramBar(2.14, 3, '#EF4444')}
          <span style={{ display: 'inline-block', fontSize: 9, padding: '2px 6px', borderRadius: 5, marginTop: 2, fontWeight: 600, background: '#EF444422', color: '#EF4444' }}>35% decline</span>
        </div>
      </div>

      {/* Analysis grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* System Failure Analysis */}
        <div style={{ background: '#0D2440', borderRadius: 12, border: '1px solid #163455', padding: 14 }}>
          <div style={{ fontSize: 10, color: '#8BA3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, fontWeight: 600 }}>System Failure Analysis</div>

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 4, marginBottom: 6, padding: '0 0 4px', borderBottom: '1px solid #163455' }}>
            {['Parameter', 'Design / Current', 'Gap'].map((h) => (
              <div key={h} style={{ fontSize: 9, color: '#6B8FAF', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{h}</div>
            ))}
          </div>

          {/* Row 1: Sargassum N uptake */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 4, padding: '8px 0', borderBottom: '1px solid #163455', alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', marginBottom: 2 }}>🌿 Sargassum N uptake</div>
              <div style={{ fontSize: 9, color: '#8BA3B8', lineHeight: 1.4 }}>Inorganic extractive layer</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#00C896' }}>Design: 344 g N/day</div>
              <div style={{ fontSize: 10, color: '#EF4444', marginTop: 2 }}>Actual: ~130 g N/day</div>
            </div>
            <div style={{ fontSize: 9, color: '#8BA3B8', lineHeight: 1.4 }}>214 g/day unprocessed — accumulating as nitrate</div>
          </div>

          {/* Row 2: Oyster coverage */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 4, padding: '8px 0', borderBottom: '1px solid #163455', alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', marginBottom: 2 }}>🦪 Oyster coverage</div>
              <div style={{ fontSize: 9, color: '#8BA3B8', lineHeight: 1.4 }}>Organic filtration zone</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#00C896' }}>Design: 100%</div>
              <div style={{ fontSize: 10, color: '#F59E0B', marginTop: 2 }}>Actual: ~75%</div>
            </div>
            <div style={{ fontSize: 9, color: '#8BA3B8', lineHeight: 1.4 }}>Zone 4 (200 m³) zero filtration since Q3 2024</div>
          </div>

          {/* Row 3: Uneaten feed */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 4, padding: '8px 0', borderBottom: '1px solid #163455', alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', marginBottom: 2 }}>🍖 Uneaten feed</div>
              <div style={{ fontSize: 9, color: '#8BA3B8', lineHeight: 1.4 }}>Organic load input</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#00C896' }}>Design: &lt;1.2 kg/day</div>
              <div style={{ fontSize: 10, color: '#F59E0B', marginTop: 2 }}>Actual: ~2.8 kg/day</div>
            </div>
            <div style={{ fontSize: 9, color: '#8BA3B8', lineHeight: 1.4 }}>+1.6 kg/day excess beyond system capacity</div>
          </div>

          {/* Row 4: FCR */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 4, padding: '8px 0', borderBottom: '1px solid #163455', alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', marginBottom: 2 }}>🐠 Snapper FCR</div>
              <div style={{ fontSize: 9, color: '#8BA3B8', lineHeight: 1.4 }}>Feed conversion ratio</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#00C896' }}>Baseline: 1.58</div>
              <div style={{ fontSize: 10, color: '#EF4444', marginTop: 2 }}>Current: 2.14</div>
            </div>
            <div style={{ fontSize: 9, color: '#8BA3B8', lineHeight: 1.4 }}>35% decline — sub-clinical chronic stress across cohort</div>
          </div>

          {/* Row 5: TAN */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 4, padding: '8px 0', alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', marginBottom: 2 }}>⚗️ TAN</div>
              <div style={{ fontSize: 9, color: '#8BA3B8', lineHeight: 1.4 }}>Total ammonia nitrogen</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#00C896' }}>Safe: &lt;0.10 mg/L</div>
              <div style={{ fontSize: 10, color: '#EF4444', marginTop: 2 }}>Current: 0.48 mg/L</div>
            </div>
            <div style={{ fontSize: 9, color: '#8BA3B8', lineHeight: 1.4 }}>4.8× threshold · NH₃ fraction at gill-damage level (pH 8.0, 29.6°C)</div>
          </div>
        </div>

        {/* Recommendations */}
        <div style={{ background: '#0D2440', borderRadius: 12, border: '1px solid #163455', padding: 14 }}>
          <div style={{ fontSize: 10, color: '#8BA3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, fontWeight: 600 }}>Corrective Action Plan</div>

          {/* Rec 1: Reduce snapper density */}
          <div style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid #163455' }}>
            <div style={{ fontSize: 18, width: 26, textAlign: 'center', flexShrink: 0, marginTop: 1, color: '#EF4444', fontWeight: 700 }}>↓</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#EF4444' }}>Reduce snapper density 25%</div>
                <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 4, fontWeight: 700, background: '#EF444422', color: '#EF4444', whiteSpace: 'nowrap' }}>48 h</span>
              </div>
              <div style={{ fontSize: 11, color: '#8BA3B8', lineHeight: 1.45, marginBottom: 4 }}>
                3,200 → 2,400 individuals · 4.0 → 3.0 fish/m³ (optimal). Removes 800 fish (~306 kg, avg 382 g) from Cage 4 and upper size quartile. TAN excretion drops 11.4 → 8.6 g/day.
              </div>
              <div style={{ fontSize: 10, color: '#00C896', marginBottom: 4 }}>TAN below 0.10 mg/L within 18–22 days of intervention</div>
              <span style={{ display: 'inline-block', fontSize: 9, padding: '2px 6px', borderRadius: 5, fontWeight: 600, background: '#FF6B6B22', color: '#FF6B6B' }}>
                Critical · Targets: TAN, FCR
              </span>
            </div>
          </div>

          {/* Rec 2: Increase oysters */}
          <div style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid #163455' }}>
            <div style={{ fontSize: 18, width: 26, textAlign: 'center', flexShrink: 0, marginTop: 1, color: '#F59E0B', fontWeight: 700 }}>+</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B' }}>Increase oysters 25%</div>
                <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 4, fontWeight: 700, background: '#F59E0B22', color: '#F59E0B', whiteSpace: 'nowrap' }}>3 weeks</span>
              </div>
              <div style={{ fontSize: 11, color: '#8BA3B8', lineHeight: 1.45, marginBottom: 4 }}>
                24,000 → 30,000 C. hongkongensis. Add 6,000 spat-on-shell (15–20 mm) from Lingayen or Bolinao (~45 km). Populate Zone 4 first (4 longlines × 1,500). Reaches 100% zone coverage and ~72,000 L/hr filtration.
              </div>
              <div style={{ fontSize: 10, color: '#00C896', marginBottom: 4 }}>6–8 weeks to functional capacity · breaks Zone 4 re-filtration pattern</div>
              <span style={{ display: 'inline-block', fontSize: 9, padding: '2px 6px', borderRadius: 5, fontWeight: 600, background: '#F4D03F22', color: '#F4D03F' }}>
                Moderate · Targets: organic filtration, phosphate
              </span>
            </div>
          </div>

          {/* Rec 3: Rehabilitate Sargassum */}
          <div style={{ display: 'flex', gap: 10, padding: '8px 0' }}>
            <div style={{ fontSize: 18, width: 26, textAlign: 'center', flexShrink: 0, marginTop: 1, color: '#2ECC71', fontWeight: 700 }}>↑</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#2ECC71' }}>Rehabilitate S. hemiphyllum +60%</div>
                <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 4, fontWeight: 700, background: '#2ECC7122', color: '#2ECC71', whiteSpace: 'nowrap' }}>48 h</span>
              </div>
              <div style={{ fontSize: 11, color: '#8BA3B8', lineHeight: 1.45, marginBottom: 4 }}>
                176 → 480 kg functional biomass. Ropes 1–3 (&lt;35% fouling): manual epiphyte removal → ~130 kg recovery. Ropes 4–8 (&gt;60% fouling, necrotic): strip + reseed with BFAR-certified germlings at 70 kg/rope → ~350 kg new stock.
              </div>
              <div style={{ fontSize: 10, color: '#F59E0B', marginBottom: 2 }}>PHP 4,200/rope × 5 ropes = PHP 21,000 (≈ USD 365)</div>
              <div style={{ fontSize: 10, color: '#00C896', marginBottom: 4 }}>PHP 280/day feed saving offsets cost in ~75 days · N extraction ≥394 g/day at Week 8</div>
              <span style={{ display: 'inline-block', fontSize: 9, padding: '2px 6px', borderRadius: 5, fontWeight: 600, background: '#FF6B6B22', color: '#FF6B6B' }}>
                Critical · Targets: N, DO, nitrate
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 8-week projected outcome */}
      <div style={{ background: '#071A2E', borderRadius: 10, border: '1px solid #2ECC7130', padding: '12px 16px', marginTop: 12 }}>
        <div style={{ fontSize: 10, color: '#2ECC71', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 6 }}>Projected System State · Week 8 Post-Intervention</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, fontSize: 10, color: '#8BA3B8', lineHeight: 1.6 }}>
          <div><span style={{ color: '#FF6040', fontWeight: 600 }}>Snapper</span><br />2,400 ind. · 3.0 fish/m³<br />TAN ~8.6 g/day</div>
          <div><span style={{ color: '#C8A87A', fontWeight: 600 }}>Oysters</span><br />30,000 ind. · 100% zones<br />~68,000 L/hr filtration</div>
          <div><span style={{ color: '#2ECC71', fontWeight: 600 }}>Sargassum</span><br />~480 kg functional<br />~394 g N/day removal</div>
          <div><span style={{ color: '#00C896', fontWeight: 600 }}>Water Quality</span><br />TAN &lt;0.10 by Day 22<br />Nitrate-N toward 2.0 mg/L</div>
        </div>
      </div>
    </div>
  );
}
