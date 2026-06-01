import { RootlyMark, Icon } from '../../components/Icon';
import { T, Button } from '../../components';
import type { TabId } from '../mobile/TabBar';

interface SidebarProps {
  active: TabId;
  onNav: (tab: TabId) => void;
  onAdd: () => void;
}

const NAV_ITEMS: { id: TabId; label: string; icon: string }[] = [
  { id: 'today', label: 'Today', icon: 'home' },
  { id: 'plants', label: 'Plants', icon: 'leaf' },
  { id: 'growth', label: 'Growth', icon: 'chart' },
  { id: 'care', label: 'Care', icon: 'bell' },
];

export function Sidebar({ active, onNav, onAdd }: SidebarProps) {
  return (
    <div style={{
      width: 248, flexShrink: 0, background: T.paper, borderRight: `1px solid ${T.stone100}`,
      display: 'flex', flexDirection: 'column', padding: '22px 16px', height: '100%', boxSizing: 'border-box',
    }}>
      {/* brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 22px' }}>
        <RootlyMark size={30} color={T.canopy} />
        <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 23, letterSpacing: '-0.03em', color: T.canopy }}>rootly</span>
      </div>

      {/* add plant */}
      <Button icon="plus" full onClick={onAdd} style={{ justifyContent: 'flex-start', paddingLeft: 16 }}>Add plant</Button>

      {/* nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 20 }}>
        {NAV_ITEMS.map(it => {
          const on = active === it.id;
          return (
            <button key={it.id} onClick={() => onNav(it.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left',
              fontFamily: T.sans, fontSize: 15, fontWeight: 600, transition: 'background .14s',
              background: on ? T.sprout : 'transparent', color: on ? T.canopy : T.ink2,
            }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.background = T.linen; }}
              onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon name={it.icon} size={21} stroke={on ? 2.1 : 1.9} />
              {it.label}
            </button>
          );
        })}
      </div>

      {/* seasonal card */}
      <div style={{ marginTop: 24, background: T.sunSoft, border: '1px solid #F0D9B4', borderRadius: 16, padding: '14px 15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="cloudSun" size={18} color={T.sunDeep} stroke={2} />
          <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: '#6b4a14' }}>Autumn is coming</span>
        </div>
        <p style={{ fontFamily: T.sans, fontSize: 12.5, lineHeight: 1.5, color: '#7a5a25', margin: '7px 0 0' }}>
          Rootly is easing back watering as days get shorter.
        </p>
      </div>

      {/* account */}
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 8px', borderTop: `1px solid ${T.stone100}` }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: T.sun, display: 'grid', placeItems: 'center', fontFamily: T.display, fontWeight: 700, color: '#3a2c12', fontSize: 15 }}>M</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.ink }}>Maya Okonkwo</div>
          <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>5 plants</div>
        </div>
        <Icon name="settings" size={18} color={T.ink3} stroke={1.9} />
      </div>
    </div>
  );
}
