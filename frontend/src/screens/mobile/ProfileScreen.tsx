import React, { useState } from 'react';
import type { Plant } from '../../types/plant';
import { T } from '../../tokens';
import { Button, StatusPill, MoistureRing, Sparkline, SectionHeader, Icon } from '../../components';
import { PlantArt } from '../../components/PlantArt';
import { useUnits, formatLength } from '../../units';

interface Props {
  plant: Plant;
  onBack: () => void;
  onWater: (p: Plant) => void;
  onEdit: (p: Plant) => void;
  onDelete: (p: Plant) => void;
  onLogGrowth: (p: Plant) => void;
  onFertilize: (p: Plant) => void;
  onPrune: (p: Plant) => void;
}

export function ProfileScreen({ plant, onBack, onWater, onEdit, onDelete, onLogGrowth, onFertilize, onPrune }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const units = useUnits();

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

  const stat = (label: string, value: string) => (
    <div style={{ flex: 1, background: T.card, borderRadius: 16, padding: '14px 14px', boxShadow: '0 1px 2px rgba(30,42,34,.05)' }}>
      <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.ink3, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
      <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 17, color: T.ink, marginTop: 6, letterSpacing: '-0.01em' }}>{value}</div>
    </div>
  );

  return (
    <div style={{ height: '100%', position: 'relative', background: T.paper }}>
      <div style={{ height: '100%', overflowY: 'auto' }}>
        {/* hero */}
        <div style={{
          background: `linear-gradient(160deg, ${T.sprout}, ${T.sproutDeep})`,
          padding: '58px 20px 26px', position: 'relative',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={onBack} style={glassBtn}>
              <Icon name="chevronLeft" size={20} color={T.ink} />
            </button>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowMenu(!showMenu)} style={glassBtn}>
                <Icon name="more" size={20} color={T.ink} />
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 6 }}>
            <PlantArt icon={plant.icon} size={120} />
            <h1 style={{ margin: '10px 0 0', fontFamily: T.display, fontWeight: 700, fontSize: 27, color: T.ink, letterSpacing: '-0.02em' }}>{plant.name}</h1>
            <div style={{ fontFamily: T.sans, fontStyle: 'italic', fontSize: 14, color: T.ink3, marginTop: 2 }}>{plant.species}</div>
            <div style={{ marginTop: 12 }}><StatusPill status={plant.status} /></div>
          </div>
        </div>

        <div style={{ padding: '22px 20px 150px' }}>
          {/* moisture + note */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 18, background: T.card,
            borderRadius: 20, padding: '18px 20px', boxShadow: '0 2px 6px rgba(30,42,34,.06)',
          }}>
            <MoistureRing value={plant.moisture} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 18, color: T.ink, letterSpacing: '-0.01em' }}>{plant.note}</div>
              <div style={{ fontFamily: T.sans, fontSize: 13.5, color: T.ink2, marginTop: 6, lineHeight: 1.5 }}>
                {plant.status === 'dry' ? 'Rootly suggests watering today.' : `Next water in about ${plant.every - 2} days.`}
              </div>
            </div>
          </div>

          {/* care stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12, marginTop: 14 }}>
            {stat('Watering', `Every ${plant.every}d`)}
            {plant.fertilizeEvery !== null && stat('Fertilizing', `Every ${plant.fertilizeEvery}d`)}
            {plant.pruneEvery !== null && stat('Pruning', `Every ${plant.pruneEvery}d`)}
            {plant.light && stat('Light', plant.light.split(',')[0])}
            {stat('Room', plant.room)}
          </div>

          {/* growth */}
          <div style={{ marginTop: 24 }}>
            <SectionHeader action="Log growth" onAction={() => onLogGrowth(plant)}>Growth</SectionHeader>
            {!plant.growth || plant.growth.length < 2 ? (
              <div style={{
                background: T.card, borderRadius: 20, padding: '24px 20px',
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
              <div style={{ background: T.card, borderRadius: 20, padding: '18px 20px', boxShadow: '0 2px 6px rgba(30,42,34,.06)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 26, fontWeight: 500, color: T.canopy }}>
                    +{formatLength(plant.growth[plant.growth.length - 1] - plant.growth[0], units)}
                  </span>
                  <span style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3 }}>over 7 weeks</span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <Sparkline data={plant.growth} width={300} />
                </div>
              </div>
            )}
          </div>

          {/* activity */}
          <div style={{ marginTop: 24 }}>
            <SectionHeader>Recent activity</SectionHeader>
            <div style={{ background: T.card, borderRadius: 18, boxShadow: '0 2px 6px rgba(30,42,34,.06)', overflow: 'hidden' }}>
              {activity.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px',
                  borderTop: i ? `1px solid ${T.stone100}` : 'none',
                }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: T.linen, display: 'grid', placeItems: 'center' }}>
                    <Icon name={a.icon} size={16} color={a.color} />
                  </div>
                  <div style={{ flex: 1, fontFamily: T.sans, fontSize: 14.5, color: T.ink, fontWeight: 500 }}>{a.text}</div>
                  <span style={{ fontFamily: T.sans, fontSize: 12.5, color: T.ink3 }}>{a.when}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* sticky water button */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 20px calc(30px + var(--sab))',
        background: `linear-gradient(to top, ${T.paper} 62%, transparent)`,
        display: 'flex', flexDirection: 'column', gap: 8, zIndex: 10
      }}>
        <Button variant="primary" size="lg" full onClick={() => onWater(plant)}>Water now</Button>
        <div style={{ display: 'flex', gap: 10 }}>
          {plant.fertilizeEvery !== null && (
            <Button variant="secondary" size="md" full onClick={() => onFertilize(plant)}>Fertilize</Button>
          )}
          {plant.pruneEvery !== null && (
            <Button variant="secondary" size="md" full onClick={() => onPrune(plant)}>Prune</Button>
          )}
        </div>
      </div>
    </div>
  );
}

const glassBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: '50%',
  background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)',
  border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer',
};
