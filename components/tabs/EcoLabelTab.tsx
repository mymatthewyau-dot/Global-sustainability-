'use client';

import { useState, useMemo } from 'react';
import { SensorReading, WQIScore, Farm, LabelScore } from '@/types';
import { scoreEcoLabels } from '@/lib/eco-label-scoring';
import { LATEST_READING } from '@/lib/cci-data';
import { calculateCCI, CCI_WEIGHTS, ASC_THRESHOLD } from '@/lib/cci-calculator';

const CARD   = '#0D2440';
const BG     = '#071A2E';
const BORDER = '#163455';
const MUTED  = '#6B8FAF';
const GREEN  = '#00C896';
const AMBER  = '#F59E0B';
const BLUE   = '#3B82F6';
const RED    = '#EF4444';

function scoreColor(score: number): string {
  if (score >= 75) return GREEN;
  if (score >= 50) return AMBER;
  if (score >= 30) return BLUE;
  return RED;
}

interface Props {
  latestReading: SensorReading | null;
  wqi: WQIScore | null;
  farm: Farm;
}

function CCIEligibilityWidget() {
  const { nScore, pScore, doScore } = LATEST_READING;
  const cci = calculateCCI(nScore, pScore, doScore);
  const nComp  = parseFloat((CCI_WEIGHTS.n  * nScore).toFixed(1));
  const pComp  = parseFloat((CCI_WEIGHTS.p  * pScore).toFixed(1));
  const doComp = parseFloat((CCI_WEIGHTS.do * doScore).toFixed(1));
  const eligible = cci.exceedsASC;

  return (
    <div style={{
      background: eligible ? 'linear-gradient(135deg,#071E12 0%,#071A2E 100%)' : '#0D2440',
      border: `1.5px solid ${eligible ? GREEN : BORDER}`,
      borderRadius: 14,
      padding: 20,
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        {/* Left: formula breakdown */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ color: GREEN, fontSize: 13, fontWeight: 700 }}>♻ Circularity Index (CCI)</div>
            {eligible && (
              <span style={{ background: '#0A3320', border: `1px solid ${GREEN}`, borderRadius: 20, color: GREEN, fontSize: 10, fontWeight: 700, padding: '2px 10px' }}>
                ✓ Exceeds ASC Threshold
              </span>
            )}
          </div>
          <div style={{ color: MUTED, fontSize: 10, marginBottom: 10 }}>
            Weights: N={Math.round(CCI_WEIGHTS.n * 100)}% · P={Math.round(CCI_WEIGHTS.p * 100)}% · DO={Math.round(CCI_WEIGHTS.do * 100)}%
          </div>

          {/* Calculation rows */}
          <div style={{ background: BG, borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
            {[
              { label: 'N  (Nitrogen)',          weight: CCI_WEIGHTS.n,  score: nScore,  comp: nComp,  color: '#F59E0B' },
              { label: 'P  (Phosphorus)',         weight: CCI_WEIGHTS.p,  score: pScore,  comp: pComp,  color: '#8B5CF6' },
              { label: 'DO (Dissolved Oxygen)',   weight: CCI_WEIGHTS.do, score: doScore, comp: doComp, color: '#00C896' },
            ].map(({ label, weight, score, comp, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 170 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ color: '#CBD5E1', fontSize: 11 }}>{label}</span>
                </div>
                <span style={{ color: MUTED, fontSize: 11 }}>
                  {(weight * 100).toFixed(0)}% × {score}
                </span>
                <span style={{ color: color, fontSize: 12, fontWeight: 700, minWidth: 36, textAlign: 'right' }}>
                  = {comp}
                </span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
              <span style={{ color: MUTED, fontSize: 11 }}>
                {nComp} + {pComp} + {doComp}
              </span>
              <span style={{ color: eligible ? GREEN : AMBER, fontSize: 18, fontWeight: 800 }}>
                = {cci.total}%
              </span>
            </div>
          </div>

          {/* Threshold bar */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ position: 'relative', background: '#163455', borderRadius: 20, height: 10, overflow: 'visible' }}>
              <div style={{
                background: `linear-gradient(90deg,${eligible ? GREEN : AMBER},${eligible ? '#007A5E' : '#B45309'})`,
                width: `${Math.min(100, cci.total)}%`,
                height: '100%',
                borderRadius: 20,
              }} />
              {/* 48% threshold marker */}
              <div style={{
                position: 'absolute', top: -4, left: `${ASC_THRESHOLD}%`,
                width: 2, height: 18, background: '#FFFFFF', opacity: 0.6, borderRadius: 1,
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
              <span style={{ color: MUTED, fontSize: 10 }}>0%</span>
              <span style={{ color: '#FFFFFF', fontSize: 10 }}>
                ASC threshold: <strong style={{ color: eligible ? GREEN : AMBER }}>{ASC_THRESHOLD}%</strong>
              </span>
              <span style={{ color: MUTED, fontSize: 10 }}>100%</span>
            </div>
          </div>
        </div>

        {/* Right: big score + verdict */}
        <div style={{ textAlign: 'center', minWidth: 110 }}>
          <div style={{ color: MUTED, fontSize: 9, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>Peak CCI</div>
          <div style={{
            color: eligible ? GREEN : AMBER,
            fontSize: 42, fontWeight: 800, lineHeight: 1,
            textShadow: eligible ? `0 0 24px ${GREEN}55` : undefined,
          }}>
            {cci.total}%
          </div>
          <div style={{ color: MUTED, fontSize: 9, marginTop: 4 }}>Winter/Spring</div>
          {eligible && (
            <div style={{ marginTop: 12, background: '#0A3320', border: `1px solid ${GREEN}`, borderRadius: 8, padding: '8px 10px' }}>
              <div style={{ color: GREEN, fontSize: 10, fontWeight: 700, lineHeight: 1.4 }}>
                ✓ Reliably exceeds 50%<br />✓ Exceeds 48% ASC Score 2 threshold
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      {eligible && (
        <div style={{ marginTop: 14, background: '#071A2E', border: `1px solid ${GREEN}44`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 22 }}>🏅</div>
          <div>
            <div style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
              Your farm is eligible to apply for an Eco-label
            </div>
            <div style={{ color: MUTED, fontSize: 11 }}>
              CCI of {cci.total}% exceeds the ASC Score 2 threshold of {ASC_THRESHOLD}%. Track your certification journey below.
            </div>
          </div>
          <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
            <span style={{ background: `linear-gradient(135deg,${GREEN} 0%,#007A5E 100%)`, color: BG, borderRadius: 8, padding: '8px 14px', fontSize: 11, fontWeight: 700 }}>
              Start Application →
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EcoLabelTab({ latestReading, wqi, farm }: Props) {
  const labels = useMemo(
    () => scoreEcoLabels(latestReading, wqi, farm),
    [latestReading, wqi, farm],
  );

  const [discoverOpen, setDiscoverOpen] = useState(true);
  const [activeIds, setActiveIds] = useState<string[]>(['ASC', 'GlobalG.A.P.']);
  const [selectedId, setSelectedId] = useState<string>('ASC');

  function toggleActive(id: string) {
    setActiveIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (!next.includes(selectedId) && next.length > 0) setSelectedId(next[0]);
      return next;
    });
  }

  const activeLabels = labels.filter((l) => activeIds.includes(l.id));
  const selected = labels.find((l) => l.id === selectedId) ?? activeLabels[0] ?? labels[0];

  const metCount = selected ? selected.criteria.filter((c) => c.met).length : 0;
  const totalCount = selected ? selected.criteria.length : 0;
  const weeksToComplete = selected
    ? Math.max(1, Math.round(((totalCount - metCount) / totalCount) * 12))
    : 0;

  const combinedPremium = activeLabels.reduce((sum, l) => sum + l.revenuePremium, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ color: '#FFFFFF', fontSize: 17, fontWeight: 700 }}>Eco-label Progress</div>
          <div style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>Track your certification journey and unlock revenue premiums</div>
        </div>
        <button
          onClick={() => setDiscoverOpen((o) => !o)}
          style={{ background: 'linear-gradient(135deg,#00C896 0%,#007A5E 100%)', color: BG, border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}
        >
          <span>✦</span> Discover Labels
        </button>
      </div>

      {/* CCI Eligibility Widget */}
      <CCIEligibilityWidget />

      {/* Discover Panel */}
      {discoverOpen && (
        <div style={{ background: BG, border: `1.5px solid ${GREEN}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ color: GREEN, fontSize: 14, fontWeight: 700 }}>✦ &nbsp;Labels You Could Qualify For</div>
            <div style={{ color: MUTED, fontSize: 12, cursor: 'pointer' }} onClick={() => setDiscoverOpen(false)}>✕ close</div>
          </div>
          <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 12px', marginBottom: 12, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div style={{ color: GREEN, fontSize: 14, flexShrink: 0 }}>◎</div>
            <div style={{ color: MUTED, fontSize: 11, lineHeight: 1.6 }}>
              Scores are calculated live from your <strong style={{ color: '#CBD5E1' }}>current WQI</strong>, <strong style={{ color: '#CBD5E1' }}>water parameters</strong>, and <strong style={{ color: '#CBD5E1' }}>IMTA duration</strong>.
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {labels.map((label) => {
              const col = scoreColor(label.score);
              const isActive = activeIds.includes(label.id);
              return (
                <div key={label.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12 }}>
                  <div style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{label.name}</div>
                  <div style={{ color: MUTED, fontSize: 9, marginBottom: 8 }}>{label.fullName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <div style={{ flex: 1, background: BG, borderRadius: 20, height: 5, overflow: 'hidden' }}>
                      <div style={{ background: col, width: `${label.score}%`, height: '100%', borderRadius: 20 }} />
                    </div>
                    <span style={{ color: col, fontSize: 10, fontWeight: 700, minWidth: 30, textAlign: 'right' }}>{label.score}%</span>
                  </div>
                  <div style={{ color: MUTED, fontSize: 9, lineHeight: 1.5, marginBottom: 8 }}>
                    {label.criteria.filter((c) => c.met).length} of {label.criteria.length} criteria met · {label.region}
                  </div>
                  <div style={{ color: MUTED, fontSize: 9 }}>Revenue premium</div>
                  <div style={{ color: col, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
                    +${label.revenuePremium.toLocaleString()} / yr&nbsp;&nbsp;<span style={{ color: MUTED, fontSize: 9 }}>avg +{label.revenuePct}%</span>
                  </div>
                  <button
                    onClick={() => toggleActive(label.id)}
                    style={{
                      width: '100%',
                      background: isActive ? '#0A3320' : BORDER,
                      border: isActive ? `1px solid ${GREEN}` : 'none',
                      borderRadius: 7,
                      color: isActive ? GREEN : '#CBD5E1',
                      fontSize: 10,
                      padding: 6,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {isActive ? '✓ Tracking' : '+ Add to my labels'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Labels Row */}
      <div style={{ color: MUTED, fontSize: 9, textTransform: 'uppercase', letterSpacing: '1.8px', marginBottom: 10 }}>
        Your Active Labels ({activeLabels.length})
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {activeLabels.map((label) => {
          const col = scoreColor(label.score);
          const isSelected = label.id === selectedId;
          return (
            <div
              key={label.id}
              onClick={() => setSelectedId(label.id)}
              style={{
                background: isSelected ? '#0A2035' : CARD,
                border: `1.5px solid ${isSelected ? col : BORDER}`,
                borderRadius: 10,
                padding: '10px 14px',
                minWidth: 160,
                flex: 1,
                position: 'relative',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
            >
              {isSelected && (
                <div style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, background: col, borderRadius: '50%', boxShadow: `0 0 6px ${col}` }} />
              )}
              <div style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{label.name}</div>
              <div style={{ color: MUTED, fontSize: 10, marginBottom: 8 }}>{label.fullName} · {label.region}</div>
              <div style={{ background: BG, borderRadius: 20, height: 5, marginBottom: 5, overflow: 'hidden' }}>
                <div style={{ background: `linear-gradient(90deg,${col},${col}BB)`, width: `${label.score}%`, height: '100%', borderRadius: 20 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: col, fontSize: 11, fontWeight: 700 }}>{label.score}%</span>
                <span style={{ color: MUTED, fontSize: 9 }}>{label.criteria.filter((c) => c.met).length} of {label.criteria.length} criteria met</span>
              </div>
            </div>
          );
        })}
        {/* Add label chip */}
        <div
          onClick={() => setDiscoverOpen(true)}
          style={{ background: BG, border: `1.5px dashed ${BORDER}`, borderRadius: 10, padding: '10px 18px', minWidth: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, color: MUTED, fontSize: 11, cursor: 'pointer' }}
        >
          <span style={{ fontSize: 20, color: BORDER }}>+</span>
          <span>Add label</span>
        </div>
      </div>

      {activeLabels.length === 0 ? (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 32, textAlign: 'center', color: MUTED, fontSize: 13 }}>
          No labels tracked yet. Click <strong style={{ color: '#CBD5E1' }}>Discover Labels</strong> to add one.
        </div>
      ) : selected && (
        <>
          {/* Overall Progress */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 600 }}>{selected.name} Certification — Overall Progress</div>
                <div style={{ color: MUTED, fontSize: 10, marginTop: 6 }}>
                  {metCount} criteria met · {totalCount - metCount} remaining · Est. completion ~{weeksToComplete} weeks
                </div>
              </div>
              <div style={{ color: scoreColor(selected.score), fontSize: 20, fontWeight: 800 }}>{selected.score}%</div>
            </div>
            <div style={{ background: BG, borderRadius: 20, height: 12, overflow: 'hidden', position: 'relative' }}>
              <div style={{ background: `linear-gradient(90deg,${scoreColor(selected.score)},${scoreColor(selected.score)}BB)`, width: `${selected.score}%`, height: '100%', borderRadius: 20 }} />
              <div style={{ position: 'absolute', top: 0, left: '33%', height: '100%', width: 2, background: '#FFFFFF', opacity: 0.3 }} />
              <div style={{ position: 'absolute', top: 0, left: '66%', height: '100%', width: 2, background: '#FFFFFF', opacity: 0.3 }} />
            </div>
          </div>

          {/* Journey + Financials */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

            {/* Certification Journey */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18 }}>
              <div style={{ color: MUTED, fontSize: 9, textTransform: 'uppercase', letterSpacing: '1.8px', marginBottom: 12 }}>
                Certification Journey · {selected.name}
              </div>

              {selected.criteria.map((step, i) => {
                const isLast = i === selected.criteria.length - 1;
                const col = step.met ? GREEN : AMBER;
                return (
                  <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28, flexShrink: 0 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: step.met ? '#0A3320' : CARD,
                        border: `2px solid ${col}`,
                        color: col, fontSize: 11, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {step.met ? '✓' : <div style={{ width: 9, height: 9, background: col, borderRadius: '50%' }} />}
                      </div>
                      {!isLast && <div style={{ width: 2, background: step.met ? `${GREEN}66` : BORDER, flex: 1, minHeight: 14, margin: '3px 0' }} />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: isLast ? 0 : 14 }}>
                      <div style={{
                        color: step.met ? MUTED : '#FFFFFF',
                        fontSize: 12, fontWeight: 600, marginBottom: 2,
                        textDecoration: step.met ? 'line-through' : 'none',
                      }}>
                        {step.name}
                      </div>
                      <div style={{ color: step.met ? MUTED : '#CBD5E1', fontSize: 10, marginBottom: 5, lineHeight: 1.5 }}>{step.detail}</div>
                      <span style={{
                        display: 'inline-block', borderRadius: 20, fontSize: 9, padding: '2px 8px',
                        background: step.met ? '#0A3320' : '#2D1A00',
                        color: step.met ? GREEN : AMBER,
                      }}>
                        {step.met ? 'Achieved' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Finish line */}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <div style={{ width: 28, flexShrink: 0 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: BG, border: `1.5px solid ${BLUE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>🏁</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: BLUE, fontSize: 12, fontWeight: 600, marginBottom: 2 }}>Submit {selected.name} Application</div>
                  <div style={{ color: MUTED, fontSize: 10, marginBottom: 5 }}>
                    Unlock +${selected.revenuePremium.toLocaleString()}/yr premium across certified markets
                  </div>
                  <span style={{ display: 'inline-block', borderRadius: 20, fontSize: 9, padding: '2px 8px', background: BG, color: BLUE, border: `1px solid #1E3A5F` }}>Finish Line</span>
                </div>
              </div>
            </div>

            {/* Financial Return */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ color: MUTED, fontSize: 9, textTransform: 'uppercase', letterSpacing: '1.8px' }}>Financial Return · {selected.name}</div>

              <div style={{ background: 'linear-gradient(135deg,#0A3320 0%,#082818 100%)', border: `1px solid ${GREEN}`, borderRadius: 10, padding: 16, textAlign: 'center' }}>
                <div style={{ color: MUTED, fontSize: 10, marginBottom: 4 }}>Estimated Annual Revenue Premium</div>
                <div style={{ color: GREEN, fontSize: 28, fontWeight: 800 }}>+${selected.revenuePremium.toLocaleString()}</div>
                <div style={{ color: MUTED, fontSize: 10, marginTop: 2 }}>+{selected.revenuePct}% above uncertified market price · {selected.region}</div>
              </div>

              <div>
                {[
                  { key: 'Certification cost (one-time)', val: `~$${selected.certCost.toLocaleString()}`, color: AMBER },
                  { key: 'Annual audit fee',              val: `~$${selected.annualAudit.toLocaleString()} / yr`, color: AMBER },
                  { key: 'Break-even point',              val: `~${Math.ceil(selected.certCost / (selected.revenuePremium / 12))} months`, color: '#FFFFFF' },
                  { key: 'Net benefit (Year 1)',           val: `+$${(selected.revenuePremium - selected.certCost - selected.annualAudit).toLocaleString()}`, color: GREEN },
                  { key: 'Net benefit (Year 2+)',          val: `+$${(selected.revenuePremium - selected.annualAudit).toLocaleString()} / yr`, color: GREEN },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #163455' }}>
                    <span style={{ color: MUTED, fontSize: 11 }}>{row.key}</span>
                    <span style={{ color: row.color, fontSize: 12, fontWeight: 600 }}>{row.val}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: BG, borderRadius: 6, padding: 10 }}>
                <div style={{ color: MUTED, fontSize: 10, marginBottom: 6 }}>Estimated Timeline to Certification</div>
                <div style={{ display: 'flex', gap: 3 }}>
                  <div style={{ background: scoreColor(selected.score), width: `${selected.score}%`, height: 8, borderRadius: 3 }} />
                  <div style={{ background: AMBER, width: `${Math.min(20, 100 - selected.score)}%`, height: 8, borderRadius: 3 }} />
                  <div style={{ background: BORDER, flex: 1, height: 8, borderRadius: 3 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ color: MUTED, fontSize: 9 }}>Now</span>
                  <span style={{ color: GREEN, fontSize: 9, fontWeight: 700 }}>← You are here</span>
                  <span style={{ color: MUTED, fontSize: 9 }}>~{weeksToComplete} wks</span>
                </div>
              </div>

              {activeLabels.length > 1 && (
                <div style={{ background: BG, borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ color: MUTED, fontSize: 9, textTransform: 'uppercase', letterSpacing: '1.8px', marginBottom: 4 }}>Combined potential (all active labels)</div>
                  <div style={{ color: GREEN, fontSize: 18, fontWeight: 800 }}>+${combinedPremium.toLocaleString()} / yr</div>
                  <div style={{ color: MUTED, fontSize: 10, marginTop: 2 }}>
                    {activeLabels.map((l) => `${l.name} ($${l.revenuePremium.toLocaleString()})`).join(' + ')} if all certified
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
