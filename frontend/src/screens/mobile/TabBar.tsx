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
    <div data-debug-layer="nav" style={{ flexShrink: 0, paddingBottom: 'calc(8px + var(--sab))' }}>
      <div style={{
        margin: '0 14px', height: 64,
        background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(14px) saturate(160%)',
        WebkitBackdropFilter: 'blur(14px) saturate(160%)',
        border: `1px solid ${T.stone100}`, borderRadius: 28,
        boxShadow: '0 8px 24px rgba(30,42,34,.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '0 6px', zIndex: 40,
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
