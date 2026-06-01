import type { Plant } from '../../types/plant';
import { T, Button, StatusPill, MoistureRing, Sparkline, SectionHeader, Icon } from '../../components';
import { PlantArt } from '../../components/PlantArt';

interface Props {
  plant: Plant;
  onBack: () => void;
  onWater: (p: Plant) => void;
}

export function ProfileScreen({ plant, onBack, onWater }: Props) {
  const activity = [
    { icon: 'droplet', text: 'Watered', when: plant.lastWater, color: '#5E8FB8' },
    { icon: 'ruler', text: 'Logged growth +2cm', when: '2 weeks ago', color: T.fern },
    { icon: 'pencil', text: `Moved to ${plant.room}`, when: '1 month ago', color: T.ink3 },
  ];

  const stat = (icon: string, label: string, value: string) => (
    <div style={{ flex: 1, background: T.card, borderRadius: 16, padding: '14px 14px', boxShadow: '0 1px 2px rgba(30,42,34,.05)' }}>
      <Icon name={icon} size={19} color={T.fern} />
      <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 17, color: T.ink, marginTop: 8, letterSpacing: '-0.01em' }}>{value}</div>
      <div style={{ fontFamily: T.sans, fontSize: 11.5, color: T.ink3, marginTop: 1 }}>{label}</div>
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
            <button style={glassBtn}>
              <Icon name="more" size={20} color={T.ink} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 6 }}>
            <PlantArt kind={plant.kind} size={120} />
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
          <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
            {stat('droplets', 'Watering', `Every ${plant.every}d`)}
            {stat('sun', 'Light', plant.light.split(',')[0])}
            {stat('home', 'Room', plant.room)}
          </div>

          {/* growth */}
          <div style={{ marginTop: 24 }}>
            <SectionHeader action="Log growth">Growth</SectionHeader>
            <div style={{ background: T.card, borderRadius: 20, padding: '18px 20px', boxShadow: '0 2px 6px rgba(30,42,34,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: T.mono, fontSize: 26, fontWeight: 500, color: T.canopy }}>
                  +{plant.growth[plant.growth.length - 1] - plant.growth[0]}cm
                </span>
                <span style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3 }}>over 7 weeks</span>
              </div>
              <div style={{ marginTop: 12 }}>
                <Sparkline data={plant.growth} width={300} />
              </div>
            </div>
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
        position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 20px 30px',
        background: `linear-gradient(to top, ${T.paper} 62%, transparent)`,
      }}>
        <Button variant="primary" size="lg" icon="droplet" full onClick={() => onWater(plant)}>Water now</Button>
      </div>
    </div>
  );
}

const glassBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: '50%',
  background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)',
  border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer',
};
