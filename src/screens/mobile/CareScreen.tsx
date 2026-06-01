import type { Plant } from '../../types/plant';
import { T, SectionHeader, Icon } from '../../components';
import { PlantArt } from '../../components/PlantArt';

interface Props {
  plants: Plant[];
  onOpen: (p: Plant) => void;
}

export function CareScreen({ plants, onOpen }: Props) {
  const groups = [
    { when: 'Today', items: plants.filter(p => p.status === 'dry').map(p => ({ p, action: 'Water' })) },
    { when: 'Tomorrow', items: plants.filter(p => p.status === 'soon').map(p => ({ p, action: 'Water' })) },
    { when: 'This week', items: plants.filter(p => p.status === 'thriving').map(p => ({ p, action: 'Check soil' })) },
  ];

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: T.paper }}>
      <div style={{ padding: '58px 20px 120px' }}>
        <h1 style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 30, color: T.ink, letterSpacing: '-0.03em' }}>Care</h1>

        {/* seasonal nudge */}
        <div style={{
          marginTop: 18, background: T.sunSoft, border: '1px solid #F0D9B4',
          borderRadius: 20, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start',
        }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Icon name="cloudSun" size={20} color={T.sunDeep} />
          </div>
          <div>
            <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, color: '#6b4a14' }}>Autumn is coming</div>
            <div style={{ fontFamily: T.sans, fontSize: 13.5, color: '#7a5a25', marginTop: 3, lineHeight: 1.5 }}>
              Rootly is easing back watering as days get shorter. Most plants will need less water soon.
            </div>
          </div>
        </div>

        {groups.filter(g => g.items.length > 0).map(g => (
          <div key={g.when} style={{ marginTop: 24 }}>
            <SectionHeader>{g.when}</SectionHeader>
            <div style={{ background: T.card, borderRadius: 18, boxShadow: '0 2px 6px rgba(30,42,34,.06)', overflow: 'hidden' }}>
              {g.items.map((it, i) => (
                <div key={it.p.id} onClick={() => onOpen(it.p)} style={{
                  display: 'flex', alignItems: 'center', gap: 13, padding: '12px 16px',
                  cursor: 'pointer', borderTop: i ? `1px solid ${T.stone100}` : 'none',
                }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: T.sprout, display: 'grid', placeItems: 'center' }}>
                    <PlantArt kind={it.p.kind} size={34} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 600, color: T.ink }}>{it.p.name}</div>
                    <div style={{ fontFamily: T.sans, fontSize: 12.5, color: T.ink3, marginTop: 1 }}>{it.p.room}</div>
                  </div>
                  <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.fern, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Icon name={it.action === 'Water' ? 'droplet' : 'check'} size={15} color={T.fern} stroke={2} />
                    {it.action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
