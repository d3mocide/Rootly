import { Icon } from '../../components/Icon';
import { T } from '../../tokens';

export type TabId = 'today' | 'plants' | 'growth' | 'care';

interface TabBarProps {
  active: TabId;
  onChange: (tab: TabId) => void;
  onAdd: () => void;
}

const TABS = [
  { id: 'today' as TabId, label: 'Today', icon: 'home' },
  { id: 'plants' as TabId, label: 'Plants', icon: 'leaf' },
  { id: '__add', label: '', icon: 'plus' },
  { id: 'growth' as TabId, label: 'Growth', icon: 'chart' },
  { id: 'care' as TabId, label: 'Care', icon: 'bell' },
];

export function TabBar({ active, onChange, onAdd }: TabBarProps) {
  return (
    <div
      data-debug-layer="nav"
      style={{
        flexShrink: 0,
        background: 'rgba(251,250,246,0.92)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: `1px solid ${T.stone100}`,
        paddingBottom: 'var(--sab)',
        zIndex: 40,
      }}
    >
      <div style={{
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '0 6px',
      }}>
      {TABS.map(t =>
        t.id === '__add' ? (
          <button key="add" onClick={onAdd} style={{
            width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: T.canopy, display: 'grid', placeItems: 'center',
            boxShadow: '0 6px 16px rgba(32,80,59,.38)', marginTop: -22,
          }}>
            <Icon name="plus" size={24} color={T.onDark} stroke={2.2} />
          </button>
        ) : (
          <button key={t.id} onClick={() => onChange(t.id as TabId)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1,
            fontFamily: T.sans, fontSize: 11, fontWeight: 600,
            color: active === t.id ? T.canopy : T.ink3,
          }}>
            <Icon name={t.icon} size={23} stroke={active === t.id ? 2.1 : 1.9} />
            {t.label}
          </button>
        )
      )}
      </div>
    </div>
  );
}
