import { T, Icon } from '../../components';
import { Topbar } from './Topbar';

const MAP: Record<string, [string, string, string]> = {
  growth: ['Growth', 'See per-plant growth charts and season totals here.', 'chart'],
  care: ['Care', 'Your watering schedule, grouped by day, lives here.', 'bell'],
};

export function PlaceholderDesktop({ tab }: { tab: string }) {
  const [title, desc, icon] = MAP[tab] ?? ['', '', 'home'];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title={title} search={false} />
      <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 340 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: T.sprout, display: 'grid', placeItems: 'center', margin: '0 auto' }}>
            <Icon name={icon} size={34} color={T.canopy} stroke={1.7} />
          </div>
          <h2 style={{ fontFamily: T.display, fontWeight: 700, fontSize: 24, color: T.ink, margin: '18px 0 0', letterSpacing: '-0.02em' }}>{title}</h2>
          <p style={{ fontFamily: T.sans, fontSize: 15, color: T.ink2, margin: '8px 0 0', lineHeight: 1.55 }}>{desc}</p>
          <p style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3, margin: '10px 0 0' }}>Coming soon — Today &amp; Plants are the fully-built views.</p>
        </div>
      </div>
    </div>
  );
}
