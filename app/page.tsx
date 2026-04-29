'use client';

import { useState, useMemo } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AuthButton from '@/components/AuthButton';
import RiskTab from '@/components/tabs/RiskTab';
import StockingTab from '@/components/tabs/StockingTab';
import EcoLabelTab from '@/components/tabs/EcoLabelTab';
import { db } from '@/lib/instant';
import { useFarm } from '@/lib/farm-context';
import { calculateWQI } from '@/lib/wqi-calculator';
import {
  nMgLToScore,
  pMgLToScore,
  doMgLToScore,
  EUTROPHICATION_WEIGHTS,
  getTrophicState,
  getTrophicColor,
  getTrophicRiskLabel,
} from '@/lib/cci-calculator';
import { generateStockingRecommendations } from '@/lib/stocking-recommendations';
import { convertToSensorReading } from '@/lib/sensor-data-instant';
import { SensorReading, WQIScore } from '@/types';

const TABS = ['Eutrophication', 'Stocking', 'Eco-label'] as const;
type Tab = typeof TABS[number];

const BG     = '#071A2E';
const CARD   = '#0D2440';
const BORDER = '#163455';
const MUTED  = '#6B8FAF';
const GREEN  = '#00C896';

function DashboardContent() {
  const { farm } = useFarm();
  const [activeTab, setActiveTab] = useState<Tab>('Eutrophication');

  const sensorQuery = farm
    ? { sensorReadings: { $: { where: { farmId: farm.id } } } }
    : null;

  const { isLoading, data } = db.useQuery(sensorQuery as any) as {
    isLoading: boolean;
    data?: { sensorReadings?: any[] };
  };

  const readings: SensorReading[] = useMemo(() => {
    if (!data?.sensorReadings) return [];
    return data.sensorReadings
      .map(convertToSensorReading)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [data]);

  const latestReading = readings[0] ?? null;

  const wqi: WQIScore | null = useMemo(() => {
    if (!latestReading) return null;
    return calculateWQI(latestReading);
  }, [latestReading]);

  const eutrScore = useMemo(() => {
    if (!latestReading) return null;
    const nScore  = nMgLToScore(latestReading.nitrogen);
    const pScore  = pMgLToScore(latestReading.phosphorus);
    const doScore = doMgLToScore(latestReading.dissolvedOxygen);
    const composite = Math.round(
      EUTROPHICATION_WEIGHTS.p  * pScore  +
      EUTROPHICATION_WEIGHTS.n  * nScore  +
      EUTROPHICATION_WEIGHTS.do * doScore,
    );
    const trophicState = getTrophicState(nScore, pScore);
    return {
      composite,
      trophicState,
      color: getTrophicColor(trophicState),
      riskLabel: getTrophicRiskLabel(trophicState),
    };
  }, [latestReading]);

  const stockingRecs = useMemo(() => {
    if (!latestReading) return [];
    return generateStockingRecommendations(latestReading);
  }, [latestReading]);

  if (!farm) return null;

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: `3px solid ${GREEN}`, borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: MUTED, fontSize: 14 }}>Loading water quality data…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#CBD5E1' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 24px 40px' }}>

        {/* Eutrophication Risk Score Header */}
        <div style={{ background: CARD, borderRadius: 12, padding: '14px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${BORDER}` }}>
          <div>
            <div style={{ color: MUTED, fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 3 }}>Eutrophication Risk Score</div>
            <div style={{ color: eutrScore ? eutrScore.color : MUTED, fontSize: 28, fontWeight: 700 }}>
              {eutrScore ? eutrScore.composite : '—'} <span style={{ fontSize: 13, color: MUTED, fontWeight: 400 }}>/ 100</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ background: '#0A1F35', borderRadius: 8, padding: '7px 14px', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, background: GREEN, borderRadius: '50%', boxShadow: `0 0 6px ${GREEN}` }} />
              <span style={{ color: GREEN, fontSize: 11, fontWeight: 600 }}>Connected</span>
            </div>
            {eutrScore && (
              <div style={{ background: eutrScore.color + '22', borderRadius: 8, padding: '7px 14px', border: `1px solid ${eutrScore.color}` }}>
                <span style={{ color: eutrScore.color, fontSize: 13, fontWeight: 600 }}>{eutrScore.trophicState}</span>
              </div>
            )}
            <AuthButton />
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 20px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                background: activeTab === tab ? GREEN : BORDER,
                color: activeTab === tab ? BG : MUTED,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'Eutrophication' && (
          <RiskTab
            latestReading={latestReading}
            readings={readings}
            wqi={wqi}
            farmId={farm.id}
          />
        )}
        {activeTab === 'Stocking' && (
          <StockingTab
            latestReading={latestReading}
            recommendations={stockingRecs}
            initialStockingDensity={farm.initialStockingDensity ?? 0}
          />
        )}
        {activeTab === 'Eco-label' && (
          <EcoLabelTab
            latestReading={latestReading}
            wqi={wqi}
            farm={farm}
          />
        )}

      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
