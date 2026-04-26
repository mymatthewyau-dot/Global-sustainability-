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

function priorityColor(p: StockingRecommendation['priority']): string {
  if (p === 'High') return '#EF4444';
  if (p === 'Medium') return '#F59E0B';
  return '#00C896';
}

function priorityTagStyle(p: StockingRecommendation['priority']) {
  const colors: Record<string, { bg: string; color: string }> = {
    High:   { bg: '#FF6B6B22', color: '#FF6B6B' },
    Medium: { bg: '#F4D03F22', color: '#F4D03F' },
    Low:    { bg: '#00C89622', color: '#00C896' },
  };
  return colors[p];
}

// ── IMTA Farm Layout SVG ───────────────────────────────────────────────────────

function ImtaFarmSVG() {
  return (
    <svg viewBox="0 0 400 220" style={{ width: '100%', height: 'auto', display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="ec"><ellipse cx="200" cy="112" rx="188" ry="100" /></clipPath>
        <marker id="mW" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3z" fill="#F4D03F" /></marker>
        <marker id="mG" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3z" fill="#2ECC71" /></marker>

        {/* Tilapia symbol */}
        <symbol id="T" viewBox="0 0 44 28" overflow="visible">
          <path d="M34,14 L44,7 L41,14 L44,21 Z" fill="#3DBDB5" stroke="#2B8A85" strokeWidth="0.8" />
          <ellipse cx="18" cy="14" rx="16" ry="6" fill="#4ECDC4" stroke="#2B8A85" strokeWidth="1.2" />
          <ellipse cx="16" cy="16" rx="10" ry="3" fill="#7EEAE4" opacity="0.3" />
          <polygon points="12,8 18,2 24,8" fill="#3DBDB5" stroke="#2B8A85" strokeWidth="0.8" />
          <path d="M14,17 Q18,22 21,20" fill="#3DBDB5" stroke="#2B8A85" strokeWidth="0.9" strokeLinecap="round" />
          <circle cx="9" cy="12" r="3.5" fill="#fff" stroke="#2B8A85" strokeWidth="0.8" />
          <circle cx="9.5" cy="12.5" r="2" fill="#1A5276" />
          <circle cx="10.2" cy="11.8" r="0.7" fill="#fff" />
          <path d="M2,14 Q1,13 2,12" fill="none" stroke="#2B8A85" strokeWidth="1" strokeLinecap="round" />
        </symbol>

        {/* Salmon symbol */}
        <symbol id="S" viewBox="0 0 44 28" overflow="visible">
          <path d="M34,14 L44,7 L41,14 L44,21 Z" fill="#E07050" stroke="#C0553A" strokeWidth="0.8" />
          <ellipse cx="18" cy="14" rx="16" ry="6" fill="#FF8C69" stroke="#C0553A" strokeWidth="1.2" />
          <ellipse cx="16" cy="16" rx="10" ry="3" fill="#FFAD90" opacity="0.3" />
          <polygon points="12,8 18,2 24,8" fill="#E07050" stroke="#C0553A" strokeWidth="0.8" />
          <path d="M14,17 Q18,22 21,20" fill="#E07050" stroke="#C0553A" strokeWidth="0.9" strokeLinecap="round" />
          <circle cx="9" cy="12" r="3.5" fill="#fff" stroke="#C0553A" strokeWidth="0.8" />
          <circle cx="9.5" cy="12.5" r="2" fill="#1A3A5C" />
          <circle cx="10.2" cy="11.8" r="0.7" fill="#fff" />
          <path d="M2,14 Q1,13 2,12" fill="none" stroke="#C0553A" strokeWidth="1" strokeLinecap="round" />
        </symbol>

        {/* Oyster symbol */}
        <symbol id="O" viewBox="0 0 38 24" overflow="visible">
          <ellipse cx="19" cy="19" rx="17" ry="7" fill="#C8A87A" stroke="#8B6914" strokeWidth="1.1" />
          <ellipse cx="19" cy="13" rx="14" ry="7.5" fill="#E8D5A0" stroke="#8B6914" strokeWidth="1.1" />
          <ellipse cx="19" cy="13" rx="8" ry="4.5" fill="#F5EDD0" />
          <path d="M6,15 Q19,9 32,15" fill="none" stroke="#8B6914" strokeWidth="0.6" opacity="0.4" />
          <circle cx="25" cy="10" r="3.2" fill="#fff" stroke="#8B6914" strokeWidth="0.8" />
          <circle cx="25.8" cy="10.5" r="1.6" fill="#5D4037" />
          <circle cx="26.4" cy="10" r="0.6" fill="#fff" />
          <path d="M21,15 Q23,18 26,16" fill="none" stroke="#8B6914" strokeWidth="0.8" strokeLinecap="round" />
        </symbol>

        {/* Seaweed symbol */}
        <symbol id="W" viewBox="0 0 18 52" overflow="visible">
          <path d="M9,51 Q9,42 9,33 Q9,24 9,15 Q9,7 9,0" fill="none" stroke="#27AE60" strokeWidth="1.8" />
          <path d="M9,40 Q3,34 2,26 Q7,29 9,36" fill="#27AE60" opacity="0.9" />
          <path d="M9,28 Q15,22 16,15 Q11,18 9,25" fill="#2ECC71" opacity="0.9" />
          <path d="M9,16 Q3,10 2,4 Q7,7 9,13" fill="#27AE60" opacity="0.75" />
          <path d="M9,6 Q14,2 15,0 Q10,1 9,5" fill="#2ECC71" opacity="0.6" />
        </symbol>
      </defs>

      {/* Pond ellipse */}
      <ellipse cx="200" cy="112" rx="188" ry="100" fill="#08254A" stroke="#163455" strokeWidth="1.5" />

      {/* Zone backgrounds */}
      <rect x="12"  y="12" width="44"  height="200" fill="#2ECC7110" clipPath="url(#ec)" />
      <rect x="56"  y="12" width="108" height="165" fill="#00C89610" clipPath="url(#ec)" />
      <rect x="164" y="12" width="116" height="165" fill="#FF8C6908" clipPath="url(#ec)" />
      <rect x="280" y="12" width="108" height="200" fill="#2ECC7110" clipPath="url(#ec)" />

      {/* Zone separator hints */}
      <line x1="56"  y1="22" x2="56"  y2="38" stroke="#2ECC7128" strokeWidth="1" strokeDasharray="4 3" />
      <line x1="164" y1="22" x2="164" y2="38" stroke="#00C89628" strokeWidth="1" strokeDasharray="4 3" />
      <line x1="280" y1="22" x2="280" y2="38" stroke="#FF8C6928" strokeWidth="1" strokeDasharray="4 3" />

      {/* Zone labels */}
      <text x="34"  y="24" textAnchor="middle" fill="#2ECC71" fontSize="7.5" fontFamily="system-ui" fontWeight="700">SEAWEED</text>
      <text x="110" y="24" textAnchor="middle" fill="#00C896"  fontSize="7.5" fontFamily="system-ui" fontWeight="700">FED SPECIES</text>
      <text x="222" y="24" textAnchor="middle" fill="#FF8C69"  fontSize="7.5" fontFamily="system-ui" fontWeight="700">ORGANIC EXT.</text>
      <text x="315" y="24" textAnchor="middle" fill="#2ECC71"  fontSize="7.5" fontFamily="system-ui" fontWeight="700">SEAWEED</text>

      {/* Left seaweed */}
      <use href="#W" x="15" y="38" width="18" height="52" />
      <use href="#W" x="30" y="55" width="16" height="45" />
      <use href="#W" x="20" y="108" width="18" height="52" />

      {/* Right seaweed */}
      <use href="#W" x="282" y="38" width="18" height="52" />
      <use href="#W" x="298" y="60" width="16" height="45" />
      <use href="#W" x="310" y="108" width="18" height="52" />
      <line x1="326" y1="30" x2="326" y2="160" stroke="#163455" strokeWidth="1" opacity="0.5" />
      <line x1="342" y1="30" x2="342" y2="160" stroke="#163455" strokeWidth="1" opacity="0.5" />
      <use href="#W" x="319" y="42" width="18" height="52" />
      <use href="#W" x="335" y="65" width="16" height="45" />

      {/* Fish */}
      <use href="#T" x="62" y="45"  width="56" height="36" />
      <use href="#T" x="95" y="92"  width="48" height="31" />
      <use href="#S" x="60" y="128" width="56" height="36" />
      <use href="#S" x="100" y="158" width="44" height="28" />

      {/* Fish count labels */}
      <rect x="64" y="33" width="34" height="13" rx="5" fill="#071A2E" opacity="0.85" />
      <text x="81" y="43" textAnchor="middle" fill="#4ECDC4" fontSize="8" fontFamily="system-ui">3,000 🐟</text>
      <rect x="64" y="116" width="34" height="13" rx="5" fill="#071A2E" opacity="0.85" />
      <text x="81" y="126" textAnchor="middle" fill="#FF8C69" fontSize="8" fontFamily="system-ui">2,000 🐠</text>

      {/* Oyster cage lines */}
      <line x1="193" y1="32" x2="193" y2="175" stroke="#8B6914" strokeWidth="1" opacity="0.15" strokeDasharray="4 4" />
      <line x1="225" y1="32" x2="225" y2="175" stroke="#8B6914" strokeWidth="1" opacity="0.15" strokeDasharray="4 4" />
      <line x1="257" y1="32" x2="257" y2="175" stroke="#8B6914" strokeWidth="1" opacity="0.15" strokeDasharray="4 4" />
      <line x1="193" y1="32" x2="257" y2="32"  stroke="#8B6914" strokeWidth="1.2" opacity="0.5" />

      {/* Oysters 3×3 grid */}
      <use href="#O" x="175" y="48"  width="40" height="25" />
      <use href="#O" x="175" y="88"  width="40" height="25" />
      <use href="#O" x="175" y="128" width="40" height="25" />
      <use href="#O" x="207" y="60"  width="40" height="25" />
      <use href="#O" x="207" y="100" width="40" height="25" />
      <use href="#O" x="207" y="140" width="40" height="25" />
      <use href="#O" x="239" y="52"  width="36" height="23" />
      <use href="#O" x="239" y="92"  width="36" height="23" />
      <use href="#O" x="239" y="132" width="36" height="23" />

      {/* Oyster count label */}
      <rect x="183" y="30" width="28" height="12" rx="4" fill="#071A2E" opacity="0.85" />
      <text x="197" y="40" textAnchor="middle" fill="#C8A87A" fontSize="7.5" fontFamily="system-ui">1,000 🦪</text>

      {/* Flow: organics fish → oysters */}
      <path d="M 155,107 Q 168,95 174,82" fill="none" stroke="#F4D03F" strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#mW)" />
      <rect x="122" y="73" width="52" height="12" rx="3" fill="#071A2E" opacity="0.82" />
      <text x="148" y="82" textAnchor="middle" fill="#F4D03F" fontSize="7.5" fontFamily="system-ui">💩 organics</text>

      {/* Flow: nutrients fish → left seaweed */}
      <path d="M 64,72 Q 50,66 44,60" fill="none" stroke="#2ECC71" strokeWidth="1.3" strokeDasharray="4 3" markerEnd="url(#mG)" />
      <rect x="4" y="58" width="36" height="11" rx="3" fill="#071A2E" opacity="0.82" />
      <text x="22" y="67" textAnchor="middle" fill="#2ECC71" fontSize="7" fontFamily="system-ui">nutrients</text>

      {/* Flow: nutrients oysters → right seaweed */}
      <path d="M 155,95 Q 268,85 282,78" fill="none" stroke="#2ECC71" strokeWidth="1.3" strokeDasharray="4 3" markerEnd="url(#mG)" />

      {/* Dissolved nutrient particles */}
      <circle cx="42"  cy="108" r="1.8" fill="#00C896" opacity="0.45" />
      <circle cx="38"  cy="126" r="1.4" fill="#00C896" opacity="0.3" />
      <circle cx="46"  cy="143" r="1.8" fill="#00C896" opacity="0.4" />
    </svg>
  );
}

// ── Trophic Balance panel ──────────────────────────────────────────────────────

function TrophicBalance() {
  const cards = [
    {
      icon: '🐟', name: 'Fed Species', sub: 'Tilapia + Salmon', color: '#00C896',
      count: '5,000', unit: 'individuals',
      role: 'Require active feeding. Produce organic waste + dissolved nutrients.',
      badge: { label: '⚠ High density', bg: '#F4D03F22', color: '#F4D03F' },
      borderColor: '#F4D03F33',
    },
    {
      icon: '🦪', name: 'Organic Extractive', sub: 'Oysters · Mussels', color: '#C8A87A',
      count: '1,000', unit: 'individuals',
      role: 'Filter organic particles. Need 5× more to balance 5,000 fish.',
      badge: { label: '✗ Underpopulated', bg: '#FF6B6B22', color: '#FF6B6B' },
      borderColor: '#FF6B6B33',
    },
    {
      icon: '🌿', name: 'Inorganic Extractive', sub: 'Seaweed · Kelp', color: '#2ECC71',
      count: '0', unit: 'not present',
      role: 'Absorb dissolved N + P. Missing = ammonia accumulates.',
      badge: { label: '✗ Missing from farm', bg: '#FF6B6B22', color: '#FF6B6B' },
      borderColor: '#FF6B6B33',
    },
  ];

  return (
    <div style={{ background: '#0D2440', borderRadius: 12, border: '1px solid #163455', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 10, color: '#8BA3B8', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>Trophic Balance</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {cards.map((c) => (
          <div key={c.name} style={{ background: '#071A2E', borderRadius: 10, border: `1px solid ${c.borderColor}`, padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{c.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: c.color }}>{c.name}</div>
                <div style={{ fontSize: 9, color: '#8BA3B8' }}>{c.sub}</div>
              </div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1, color: c.color }}>{c.count}</div>
            <div style={{ fontSize: 10, color: '#8BA3B8' }}>{c.unit}</div>
            <div style={{ fontSize: 10, color: '#8BA3B8', marginTop: 4, lineHeight: 1.4 }}>{c.role}</div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9, padding: '2px 6px', borderRadius: 5, fontWeight: 700, marginTop: 5, background: c.badge.bg, color: c.badge.color }}>{c.badge.label}</span>
          </div>
        ))}
      </div>

      {/* Donut chart + legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 4, borderTop: '1px solid #163455' }}>
        <svg width="68" height="68" viewBox="0 0 68 68" style={{ flexShrink: 0 }}>
          <circle cx="34" cy="34" r="26" fill="none" stroke="#00C896" strokeWidth="12" strokeDasharray="81 163" strokeDashoffset="0" transform="rotate(-90 34 34)" />
          <circle cx="34" cy="34" r="26" fill="none" stroke="#FF8C69" strokeWidth="12" strokeDasharray="54 163" strokeDashoffset="-81" transform="rotate(-90 34 34)" />
          <circle cx="34" cy="34" r="26" fill="none" stroke="#C8A87A" strokeWidth="12" strokeDasharray="28 163" strokeDashoffset="-135" transform="rotate(-90 34 34)" />
          <circle cx="34" cy="34" r="18" fill="#071A2E" />
          <text x="34" y="31" textAnchor="middle" fontSize="8" fill="#E0EAF4" fontWeight="700">3:2:1</text>
          <text x="34" y="41" textAnchor="middle" fontSize="7" fill="#8BA3B8">current</text>
        </svg>
        <div style={{ fontSize: 11, color: '#8BA3B8', lineHeight: 1.6 }}>
          <div><span style={{ color: '#00C896' }}>●</span> Tilapia 50%</div>
          <div><span style={{ color: '#FF8C69' }}>●</span> Salmon 33%</div>
          <div><span style={{ color: '#C8A87A' }}>●</span> Oyster 17%</div>
          <div style={{ marginTop: 3, fontSize: 10, color: '#FF6B6B' }}>Target: add seaweed</div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function StockingTab({ latestReading, recommendations, initialStockingDensity }: StockingTabProps) {
  if (!latestReading) {
    return (
      <div style={{ color: '#6B8FAF', fontSize: 13, textAlign: 'center', padding: 40 }}>
        No sensor data available. Log a reading in the Risk tab first.
      </div>
    );
  }

  const { dissolvedOxygen, phosphorus, nitrogen, stockingDensity } = latestReading;

  const nutrientStatus =
    phosphorus > 0.2 || nitrogen > 5 ? { label: 'Critical', color: '#EF4444' }
    : phosphorus > 0.1 || nitrogen > 2 ? { label: 'Elevated', color: '#F59E0B' }
    : { label: 'Normal', color: '#00C896' };

  const doStatus = dissolvedOxygen >= 5 ? { label: 'Good',     color: '#00C896' }
    : dissolvedOxygen >= 4             ? { label: 'Moderate', color: '#F59E0B' }
    :                                    { label: 'Low',      color: '#EF4444' };

  const densityStatus = stockingDensity > 40 ? { label: 'High',     color: '#EF4444' }
    : stockingDensity > 25                   ? { label: 'Moderate', color: '#F59E0B' }
    :                                          { label: 'Normal',   color: '#00C896' };

  return (
    <div>
      {/* Subtitle */}
      <div style={{ color: '#8BA3B8', fontSize: 12, marginBottom: 14 }}>
        IMTA framework · Current density: {stockingDensity} fish/m³
      </div>

      {/* TOP GRID: Farm SVG + Trophic Balance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        {/* IMTA Farm Layout */}
        <div style={{ background: '#0D2440', borderRadius: 12, border: '1px solid #163455', padding: 14 }}>
          <div style={{ fontSize: 10, color: '#8BA3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, fontWeight: 600 }}>IMTA Farm Layout</div>
          <ImtaFarmSVG />
        </div>

        {/* Trophic Balance */}
        <TrophicBalance />
      </div>

      {/* Key Row */}
      <div style={{ background: '#0D2440', borderRadius: 12, border: '1px solid #163455', padding: 14, marginBottom: 12, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#C8D8E8', padding: '0 16px', borderRight: '1px solid #163455', whiteSpace: 'nowrap' }}>
          <div style={{ width: 32, height: 0, borderTop: '2px dashed #F4D03F', flexShrink: 0 }} />
          <span>💩 Organic waste</span>
          <span style={{ fontSize: 10, color: '#8BA3B8' }}>Fish → oysters</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#C8D8E8', padding: '0 16px', borderRight: '1px solid #163455', whiteSpace: 'nowrap' }}>
          <div style={{ width: 32, height: 0, borderTop: '2px dashed #2ECC71', flexShrink: 0 }} />
          <span>🌿 Dissolved nutrients</span>
          <span style={{ fontSize: 10, color: '#8BA3B8' }}>Fish → seaweed</span>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#C8D8E8', paddingLeft: 16, whiteSpace: 'nowrap' }}>
          ⚠️ Problem zones <span style={{ color: '#FF6B6B', fontWeight: 700 }}>glow red</span>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 12 }}>
        <div style={{ background: '#0D2440', borderRadius: 10, border: '1px solid #163455', padding: '10px 12px' }}>
          <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, marginBottom: 2, color: densityStatus.color }}>{stockingDensity}</div>
          <div style={{ fontSize: 10, color: '#8BA3B8' }}>fish / m³ (current)</div>
          <span style={{ display: 'inline-block', fontSize: 9, padding: '2px 6px', borderRadius: 5, marginTop: 4, fontWeight: 600, background: densityStatus.color + '22', color: densityStatus.color }}>{densityStatus.label}</span>
        </div>
        <div style={{ background: '#0D2440', borderRadius: 10, border: '1px solid #163455', padding: '10px 12px' }}>
          <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, marginBottom: 2, color: '#CBD5E1' }}>{initialStockingDensity}</div>
          <div style={{ fontSize: 10, color: '#8BA3B8' }}>fish / m³ (initial)</div>
          <span style={{ display: 'inline-block', fontSize: 9, padding: '2px 6px', borderRadius: 5, marginTop: 4, fontWeight: 600, background: '#163455', color: '#6B8FAF' }}>Baseline</span>
        </div>
        <div style={{ background: '#0D2440', borderRadius: 10, border: '1px solid #163455', padding: '10px 12px' }}>
          <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, marginBottom: 2, color: doStatus.color }}>{dissolvedOxygen}</div>
          <div style={{ fontSize: 10, color: '#8BA3B8' }}>mg/L — DO</div>
          <span style={{ display: 'inline-block', fontSize: 9, padding: '2px 6px', borderRadius: 5, marginTop: 4, fontWeight: 600, background: doStatus.color + '22', color: doStatus.color }}>{doStatus.label}</span>
        </div>
        <div style={{ background: '#0D2440', borderRadius: 10, border: '1px solid #163455', padding: '10px 12px' }}>
          <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, marginBottom: 2, color: nutrientStatus.color }}>P+N</div>
          <div style={{ fontSize: 10, color: '#8BA3B8' }}>Phosphorus + Nitrogen</div>
          <span style={{ display: 'inline-block', fontSize: 9, padding: '2px 6px', borderRadius: 5, marginTop: 4, fontWeight: 600, background: nutrientStatus.color + '22', color: nutrientStatus.color }}>{nutrientStatus.label}</span>
        </div>
      </div>

      {/* Analysis Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Parameter Analysis */}
        <div style={{ background: '#0D2440', borderRadius: 12, border: '1px solid #163455', padding: 14 }}>
          <div style={{ fontSize: 10, color: '#8BA3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, fontWeight: 600 }}>Parameter → Root Cause</div>

          <div style={{ padding: '8px 0', borderBottom: '1px solid #163455' }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3, color: doStatus.color }}>
              {doStatus.color === '#00C896' ? '🟢' : doStatus.color === '#F59E0B' ? '🟡' : '🔴'} Dissolved Oxygen ({dissolvedOxygen} mg/L)
            </div>
            <div style={{ fontSize: 10, color: '#8BA3B8', marginBottom: 2 }}>
              {dissolvedOxygen >= 5 ? 'Optimal — no density concern' : dissolvedOxygen >= 4 ? 'Moderate — high stocking is reducing DO' : 'Critical — density must be reduced'}
            </div>
            {paramBar(dissolvedOxygen, 10, doStatus.color)}
            <div style={{ fontSize: 10, marginTop: 3, color: doStatus.color }}>
              {dissolvedOxygen >= 5 ? '✓ Acceptable range (≥5 mg/L)' : '⚠ Below optimal threshold (5 mg/L)'}
            </div>
          </div>

          <div style={{ padding: '8px 0', borderBottom: '1px solid #163455' }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3, color: phosphorus > 0.1 ? '#F59E0B' : '#00C896' }}>
              {phosphorus > 0.2 ? '🔴' : phosphorus > 0.1 ? '🟡' : '🟢'} Phosphorus ({phosphorus} mg/L)
            </div>
            <div style={{ fontSize: 10, color: '#8BA3B8', marginBottom: 2 }}>
              {phosphorus > 0.2 ? 'High — excess waste load. Reduce density.' : phosphorus > 0.1 ? 'Elevated — moderate reduction advised' : 'Optimal — waste load under control'}
            </div>
            {paramBar(phosphorus, 0.3, phosphorus > 0.1 ? '#F59E0B' : '#00C896')}
            <div style={{ fontSize: 10, marginTop: 3, color: phosphorus > 0.1 ? '#F59E0B' : '#00C896' }}>
              {phosphorus > 0.1 ? '⚠ Above safe limit (0.1 mg/L)' : '✓ Within safe range (≤0.1 mg/L)'}
            </div>
          </div>

          <div style={{ padding: '8px 0' }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3, color: nitrogen > 2 ? '#F59E0B' : '#00C896' }}>
              {nitrogen > 5 ? '🔴' : nitrogen > 2 ? '🟡' : '🟢'} Nitrogen ({nitrogen} mg/L)
            </div>
            <div style={{ fontSize: 10, color: '#8BA3B8', marginBottom: 2 }}>
              {nitrogen > 5 ? 'High — nitrogen accumulating from fish waste' : nitrogen > 2 ? 'Elevated — ease nutrient load via density reduction' : 'Optimal — nitrogen well managed'}
            </div>
            {paramBar(nitrogen, 6, nitrogen > 2 ? (nitrogen > 5 ? '#EF4444' : '#F59E0B') : '#00C896')}
            <div style={{ fontSize: 10, marginTop: 3, color: nitrogen > 2 ? '#F59E0B' : '#00C896' }}>
              {nitrogen > 2 ? '⚠ Above safe threshold (2 mg/L)' : '✓ Within safe range (≤2 mg/L)'}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div style={{ background: '#0D2440', borderRadius: 12, border: '1px solid #163455', padding: 14 }}>
          <div style={{ fontSize: 10, color: '#8BA3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, fontWeight: 600 }}>Recommendations</div>
          {recommendations.map((rec, i) => {
            const tag = priorityTagStyle(rec.priority);
            return (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < recommendations.length - 1 ? '1px solid #163455' : 'none' }}>
                <div style={{ fontSize: 18, width: 28, textAlign: 'center', flexShrink: 0, marginTop: 1 }}>
                  {rec.direction === 'reduce' ? '↓' : rec.direction === 'increase' ? '↑' : '→'}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: priorityColor(rec.priority), marginBottom: 2 }}>{rec.action}</div>
                  <div style={{ fontSize: 11, color: '#8BA3B8', lineHeight: 1.45 }}>{rec.reason}</div>
                  <span style={{ display: 'inline-block', fontSize: 9, padding: '2px 6px', borderRadius: 5, marginTop: 4, fontWeight: 600, background: tag.bg, color: tag.color }}>
                    {rec.priority} priority{rec.percentChange ? ` · −${rec.percentChange}%` : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
