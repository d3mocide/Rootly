import type { Plant } from '../../types/plant';
import { T, Button, StatusPill, MoistureRing, Sparkline, SectionHeader, Icon } from '../../components';
import { PlantArt } from '../../components/PlantArt';

interface Props {
  plant: Plant | null;
  onClose: () => void;
  onWater: (p: Plant) => void;
}

export function ProfilePanel({ plant, onClose, onWater }: Props) {
  if (!plant) return null;

  const activity = [
    { icon: 'droplet', text: 'Watered', when: plant.lastWater, color: '#5E8FB8' },
    { icon: 'ruler', text: 'Logged growth +2cm', when: '2 weeks ago', color: T.fern },
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
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="primary" size="sm" icon="droplet" onClick={() => onWater(plant)}>Water now</Button>
              <button style={glassBtn}><Icon name="more" size={19} color={T.ink} /></button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <PlantArt kind={plant.kind} size={80} />
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
          <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
            {(['droplets', 'sun', 'home'] as const).map((icon, i) => {
              const values = [`Every ${plant.every}d`, plant.light.split(',')[0], plant.room];
              const labels = ['Watering', 'Light', 'Room'];
              return (
                <div key={icon} style={{ flex: 1, background: T.card, borderRadius: 14, padding: '12px 14px', boxShadow: '0 1px 2px rgba(30,42,34,.05)' }}>
                  <Icon name={icon} size={18} color={T.fern} />
                  <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, color: T.ink, marginTop: 8 }}>{values[i]}</div>
                  <div style={{ fontFamily: T.sans, fontSize: 11.5, color: T.ink3, marginTop: 1 }}>{labels[i]}</div>
                </div>
              );
            })}
          </div>

          {/* growth */}
          <div style={{ marginTop: 22 }}>
            <SectionHeader action="Log growth">Growth</SectionHeader>
            <div style={{ background: T.card, borderRadius: 18, padding: '16px 18px', boxShadow: '0 2px 6px rgba(30,42,34,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: T.mono, fontSize: 24, fontWeight: 500, color: T.canopy }}>+{plant.growth[plant.growth.length - 1] - plant.growth[0]}cm</span>
                <span style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3 }}>over 7 weeks</span>
              </div>
              <div style={{ marginTop: 10 }}>
                <Sparkline data={plant.growth} width={420} />
              </div>
            </div>
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
