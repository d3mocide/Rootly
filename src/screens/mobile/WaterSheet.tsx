import type { Plant } from '../../types/plant';
import { T } from '../../tokens';
import { Button } from '../../components';
import { PlantArt } from '../../components/PlantArt';

interface Props {
  plant: Plant;
  onConfirm: () => void;
  onClose: () => void;
}

export function WaterSheet({ plant, onConfirm, onClose }: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(23,61,44,0.4)', backdropFilter: 'blur(2px)' }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, background: T.paper,
        borderRadius: '28px 28px 0 0', padding: '12px 22px 38px',
        boxShadow: '0 -8px 30px rgba(30,42,34,.18)',
      }}>
        <div style={{ width: 40, height: 5, borderRadius: 99, background: T.stone300, margin: '0 auto 18px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 84, height: 84, borderRadius: '50%', background: T.sprout, display: 'grid', placeItems: 'center' }}>
            <PlantArt kind={plant.kind} size={64} />
          </div>
          <h2 style={{ margin: '14px 0 0', fontFamily: T.display, fontWeight: 700, fontSize: 22, color: T.ink, letterSpacing: '-0.02em' }}>
            Water {plant.name}?
          </h2>
          <p style={{ margin: '6px 0 0', fontFamily: T.sans, fontSize: 14.5, color: T.ink2, textAlign: 'center', lineHeight: 1.5, maxWidth: 280 }}>
            Rootly will log this and reset the moisture estimate. Next reminder in about {plant.every} days.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
          <Button variant="secondary" size="lg" full onClick={onClose}>Not now</Button>
          <Button variant="primary" size="lg" icon="check" full onClick={onConfirm}>Log watering</Button>
        </div>
      </div>
    </div>
  );
}
