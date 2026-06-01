import type { Plant } from '../../types/plant';
import { T, Button, PlantRow, SectionHeader, Card, Icon } from '../../components';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Props {
  plants: Plant[];
  onOpen: (p: Plant) => void;
  onWater: (p: Plant) => void;
  onWaterAll: () => void;
}

export function TodayScreen({ plants, onOpen, onWater, onWaterAll }: Props) {
  const needs = plants.filter(p => p.status === 'dry' || p.status === 'soon');
  const well = plants.filter(p => p.status === 'thriving' || p.status === 'watered');
  const dryCount = plants.filter(p => p.status === 'dry').length;
  const day = DAYS[new Date().getDay()];

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: T.paper, WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
      <div style={{ padding: '58px 20px 120px' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: T.sans, fontSize: 13.5, color: T.ink3, fontWeight: 600 }}>{greeting()} · {day}</div>
            <h1 style={{ margin: '4px 0 0', fontFamily: T.display, fontWeight: 700, fontSize: 30, color: T.ink, letterSpacing: '-0.03em' }}>Today</h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ width: 40, height: 40, borderRadius: '50%', background: T.card, border: `1px solid ${T.stone100}`, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <Icon name="bell" size={21} color={T.ink2} />
            </button>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: T.sun, display: 'grid', placeItems: 'center', fontFamily: T.display, fontWeight: 700, color: '#3a2c12', fontSize: 15 }}>M</div>
          </div>
        </div>

        {/* summary hero */}
        <div style={{
          marginTop: 20, background: T.canopy, borderRadius: 24, padding: '20px 22px',
          color: T.onDark, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -18, top: -18, opacity: 0.14 }}>
            <Icon name="droplet" size={150} color="#fff" stroke={1.2} />
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: T.sans, fontSize: 13.5, fontWeight: 600, color: T.sageSoft }}>This morning</div>
            <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 25, letterSpacing: '-0.02em', marginTop: 5, lineHeight: 1.15 }}>
              {dryCount} {dryCount === 1 ? 'plant' : 'plants'} could use a drink.
            </div>
            <div style={{ marginTop: 16 }}>
              <Button variant="accent" size="sm" icon="droplet" onClick={onWaterAll}>Water all</Button>
            </div>
          </div>
        </div>

        {/* needs care */}
        {needs.length > 0 && (
          <div style={{ marginTop: 26 }}>
            <SectionHeader>Needs care today</SectionHeader>
            <Card pad={0}>
              {needs.map((p, i) => <PlantRow key={p.id} plant={p} onClick={() => onOpen(p)} onWater={onWater} last={i === needs.length - 1} />)}
            </Card>
          </div>
        )}

        {/* doing well */}
        <div style={{ marginTop: 26 }}>
          <SectionHeader action="See all">Doing well</SectionHeader>
          <Card pad={0}>
            {well.map((p, i) => <PlantRow key={p.id} plant={p} onClick={() => onOpen(p)} onWater={onWater} last={i === well.length - 1} />)}
          </Card>
        </div>
      </div>
    </div>
  );
}
