import React, { useState } from 'react';
import type { Plant } from '../../types/plant';
import { T } from '../../tokens';
import { Button, StatusPill, MoistureRing, Sparkline, SectionHeader, Icon } from '../../components';
import { PlantArt } from '../../components/PlantArt';
import { useUnits, formatLength } from '../../units';

interface Props {
  plant: Plant | null;
  onClose: () => void;
  onWater: (p: Plant) => void;
  onEdit: (p: Plant) => void;
  onDelete: (p: Plant) => void;
  onLogGrowth: (p: Plant) => void;
  onFertilize: (p: Plant) => void;
  onPrune: (p: Plant) => void;
}

export function ProfilePanel({ plant, onClose, onWater, onEdit, onDelete, onLogGrowth, onFertilize, onPrune }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const units = useUnits();

  if (!plant) return null;
  
  const menuItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    border: 'none',
    background: 'none',
    padding: '10px 16px',
    fontFamily: T.sans,
    fontSize: 14,
    fontWeight: 600,
    color: T.ink,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background .15s',
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const activity = [
    { icon: 'droplet', text: 'Watered', when: formatDate(plant.lastWater), color: '#5E8FB8' },
    ...(plant.lastFertilize ? [{ icon: 'sparkles', text: 'Fertilized', when: formatDate(plant.lastFertilize), color: '#C8A2C8' }] : []),
    ...(plant.lastPrune ? [{ icon: 'scissors', text: 'Pruned', when: formatDate(plant.lastPrune), color: '#A0A0A0' }] : []),
    { icon: 'ruler', text: `Logged growth +${formatLength(2, units)}`, when: '2 weeks ago', color: T.fern },
    { icon: 'pencil', text: `Moved to ${plant.room}`, when: '1 month ago', color: T.ink3 },
  ];

  return (
    <>
      {/* scrim */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(23,61,44,0.25)', zIndex: 30 }} />

      {/* panel */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 520,
        background: T.paper, zIndex: 31,
        boxShadow: '-16px 0 48px rgba(30,42,34,.12)',
        display: 'flex', flexDirection: 'column',
        animation: 'rtSlide .24s cubic-bezier(.22,.61,.36,1)',
      }}>
        {/* header */}
        <div style={{
          background: `linear-gradient(160deg, ${T.sprout}, ${T.sproutDeep})`,
          padding: '24px 24px 20px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <button onClick={onClose} style={glassBtn}>
              <Icon name="x" size={19} color={T.ink} />
            </button>
            <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
              <Button variant="primary" size="sm" onClick={() => onWater(plant)}>Water now</Button>
              {plant.fertilizeEvery !== null && (
                <Button variant="secondary" size="sm" onClick={() => onFertilize(plant)}>Fertilize</Button>
              )}
              {plant.pruneEvery !== null && (
                <Button variant="secondary" size="sm" onClick={() => onPrune(plant)}>Prune</Button>
              )}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowMenu(!showMenu)} style={glassBtn}>
                  <Icon name="more" size={19} color={T.ink} />
                </button>
                {showMenu && (
                  <>
                    <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      background: T.card,
                      borderRadius: 14,
                      boxShadow: '0 8px 24px rgba(30,42,34,0.12)',
                      border: `1px solid ${T.stone100}`,
                      padding: '6px 0',
                      minWidth: 150,
                      zIndex: 41,
                      display: 'flex',
                      flexDirection: 'column',
                      animation: 'fadeIn .15s cubic-bezier(.22,.61,.36,1)',
                    }}>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onEdit(plant);
                        }}
                        style={menuItemStyle}
                        onMouseEnter={e => e.currentTarget.style.background = T.stone100}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <Icon name="pencil" size={15} color={T.ink2} />
                        <span>Edit Details</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onDelete(plant);
                        }}
                        style={{ ...menuItemStyle, color: '#BC5B49' }}
                        onMouseEnter={e => e.currentTarget.style.background = T.stone100}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <Icon name="trash" size={15} color="#BC5B49" />
                        <span>Delete Plant</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <PlantArt icon={plant.icon} size={80} />
            <div>
              <h2 style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 24, color: T.ink, letterSpacing: '-0.02em' }}>{plant.name}</h2>
              <div style={{ fontFamily: T.sans, fontStyle: 'italic', fontSize: 13, color: T.ink3, marginTop: 2 }}>{plant.species}</div>
              <div style={{ marginTop: 10 }}><StatusPill status={plant.status} /></div>
            </div>
          </div>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 40px' }}>
          {/* moisture + note */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, background: T.card,
            borderRadius: 20, padding: '18px 20px', boxShadow: '0 2px 6px rgba(30,42,34,.06)',
          }}>
            <MoistureRing value={plant.moisture} size={120} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 17, color: T.ink, letterSpacing: '-0.01em' }}>{plant.note}</div>
              <div style={{ fontFamily: T.sans, fontSize: 13.5, color: T.ink2, marginTop: 6, lineHeight: 1.5 }}>
                {plant.status === 'dry' ? 'Rootly suggests watering today.' : `Next water in about ${plant.every - 2} days.`}
              </div>
            </div>
          </div>

          {/* care stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginTop: 14 }}>
            <div style={{ background: T.card, borderRadius: 14, padding: '12px 14px', boxShadow: '0 1px 2px rgba(30,42,34,.05)' }}>
              <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.ink3, textTransform: 'uppercase', letterSpacing: '.05em' }}>Watering</div>
              <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, color: T.ink, marginTop: 6 }}>Every {plant.every}d</div>
            </div>
            {plant.fertilizeEvery !== null && (
              <div style={{ background: T.card, borderRadius: 14, padding: '12px 14px', boxShadow: '0 1px 2px rgba(30,42,34,.05)' }}>
                <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.ink3, textTransform: 'uppercase', letterSpacing: '.05em' }}>Fertilizing</div>
                <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, color: T.ink, marginTop: 6 }}>Every {plant.fertilizeEvery}d</div>
              </div>
            )}
            {plant.pruneEvery !== null && (
              <div style={{ background: T.card, borderRadius: 14, padding: '12px 14px', boxShadow: '0 1px 2px rgba(30,42,34,.05)' }}>
                <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.ink3, textTransform: 'uppercase', letterSpacing: '.05em' }}>Pruning</div>
                <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, color: T.ink, marginTop: 6 }}>Every {plant.pruneEvery}d</div>
              </div>
            )}
            {plant.light && (
              <div style={{ background: T.card, borderRadius: 14, padding: '12px 14px', boxShadow: '0 1px 2px rgba(30,42,34,.05)' }}>
                <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.ink3, textTransform: 'uppercase', letterSpacing: '.05em' }}>Light</div>
                <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, color: T.ink, marginTop: 6 }}>{plant.light.split(',')[0]}</div>
              </div>
            )}
            <div style={{ background: T.card, borderRadius: 14, padding: '12px 14px', boxShadow: '0 1px 2px rgba(30,42,34,.05)' }}>
              <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.ink3, textTransform: 'uppercase', letterSpacing: '.05em' }}>Room</div>
              <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, color: T.ink, marginTop: 6 }}>{plant.room}</div>
            </div>
          </div>

          {/* growth */}
          <div style={{ marginTop: 22 }}>
            <SectionHeader action="Log growth" onAction={() => onLogGrowth(plant)}>Growth</SectionHeader>
            {!plant.growth || plant.growth.length < 2 ? (
              <div style={{
                background: T.card, borderRadius: 18, padding: '24px 20px',
                boxShadow: '0 2px 6px rgba(30,42,34,.06)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', textAlign: 'center', gap: 10,
              }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: T.linen, display: 'grid', placeItems: 'center' }}>
                  <Icon name="ruler" size={20} color={T.ink3} />
                </div>
                <div>
                  <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, color: T.ink }}>No growth records yet</div>
                  <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3, marginTop: 4, maxWidth: 300, lineHeight: 1.4 }}>
                    Log your plant's measurements to track its progress over time.
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: T.card, borderRadius: 18, padding: '16px 18px', boxShadow: '0 2px 6px rgba(30,42,34,.06)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 24, fontWeight: 500, color: T.canopy }}>
                    +{formatLength(plant.growth[plant.growth.length - 1] - plant.growth[0], units)}
                  </span>
                  <span style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3 }}>over 7 weeks</span>
                </div>
                <div style={{ marginTop: 10 }}>
                  <Sparkline data={plant.growth} width={420} />
                </div>
              </div>
            )}
          </div>

          {/* activity */}
          <div style={{ marginTop: 22 }}>
            <SectionHeader>Recent activity</SectionHeader>
            <div style={{ background: T.card, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 6px rgba(30,42,34,.06)' }}>
              {activity.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                  borderTop: i ? `1px solid ${T.stone100}` : 'none',
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.linen, display: 'grid', placeItems: 'center' }}>
                    <Icon name={a.icon} size={15} color={a.color} />
                  </div>
                  <div style={{ flex: 1, fontFamily: T.sans, fontSize: 14, color: T.ink, fontWeight: 500 }}>{a.text}</div>
                  <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>{a.when}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const glassBtn: React.CSSProperties = {
  width: 38, height: 38, borderRadius: '50%',
  background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)',
  border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer',
};
