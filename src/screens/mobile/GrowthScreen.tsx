import type { Plant } from '../../types/plant';
import { T, Sparkline, SectionHeader } from '../../components';
import { PlantArt } from '../../components/PlantArt';

interface Props {
  plants: Plant[];
  onOpen: (p: Plant) => void;
}

export function GrowthScreen({ plants, onOpen }: Props) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: T.paper }}>
      <div style={{ padding: '58px 20px 120px' }}>
        <h1 style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 30, color: T.ink, letterSpacing: '-0.03em' }}>Growth</h1>

        {/* season hero */}
        <div style={{ marginTop: 18, background: T.canopy, borderRadius: 24, padding: '20px 22px', color: T.onDark }}>
          <div style={{ fontFamily: T.sans, fontSize: 13.5, fontWeight: 600, color: T.sageSoft }}>Across all plants</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 5 }}>
            <span style={{ fontFamily: T.mono, fontSize: 38, fontWeight: 500, letterSpacing: '-0.02em' }}>+19cm</span>
            <span style={{ fontFamily: T.sans, fontSize: 14, color: T.sageSoft }}>this season</span>
          </div>
          <div style={{ marginTop: 8, color: '#cfe0c6' }}>
            <Sparkline data={[8, 9, 11, 12, 14, 16, 19]} width={300} height={50} color="#A9C2A1" />
          </div>
        </div>

        {/* by plant */}
        <div style={{ marginTop: 24 }}>
          <SectionHeader>By plant</SectionHeader>
          <div style={{ background: T.card, borderRadius: 18, boxShadow: '0 2px 6px rgba(30,42,34,.06)', overflow: 'hidden' }}>
            {plants.map((p, i) => (
              <div key={p.id} onClick={() => onOpen(p)} style={{
                display: 'flex', alignItems: 'center', gap: 13, padding: '12px 16px',
                cursor: 'pointer', borderTop: i ? `1px solid ${T.stone100}` : 'none',
              }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: T.sprout, display: 'grid', placeItems: 'center' }}>
                  <PlantArt kind={p.kind} size={34} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 600, color: T.ink }}>{p.name}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 12, color: T.fern, marginTop: 1 }}>+{p.growth[p.growth.length - 1] - p.growth[0]}cm</div>
                </div>
                <Sparkline data={p.growth} width={84} height={34} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
