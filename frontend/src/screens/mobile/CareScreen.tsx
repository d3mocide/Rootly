import type { Plant } from '../../types/plant';
import { T } from '../../tokens';
import { SectionHeader, Icon } from '../../components';
import { PlantArt } from '../../components/PlantArt';

interface Props {
  plants: Plant[];
  onOpen: (p: Plant) => void;
  onWater: (p: Plant) => void;
  onFertilize: (p: Plant) => void;
  onPrune: (p: Plant) => void;
}

type CareStatus = 'due' | 'soon' | 'ok' | 'unscheduled';

function careStatus(lastDate: string, everyDays: number | null): CareStatus {
  if (!everyDays) return 'unscheduled';
  const days = (Date.now() - new Date(lastDate || 0).getTime()) / 86400000;
  if (days >= everyDays) return 'due';
  if (days >= everyDays - 3) return 'soon';
  return 'ok';
}

function daysUntil(lastDate: string, everyDays: number): number {
  const days = (Date.now() - new Date(lastDate || 0).getTime()) / 86400000;
  return Math.max(0, Math.ceil(everyDays - days));
}

export function CareScreen({ plants, onOpen, onWater, onFertilize, onPrune }: Props) {
  const dryCount = plants.filter(p => p.status === 'dry').length;
  const soonCount = plants.filter(p => p.status === 'soon').length;

  // Watering groups
  const waterGroups = [
    { when: 'Today',     items: plants.filter(p => p.status === 'dry') },
    { when: 'Tomorrow',  items: plants.filter(p => p.status === 'soon') },
    { when: 'This week', items: plants.filter(p => p.status === 'thriving' || p.status === 'watered') },
  ].filter(g => g.items.length > 0);

  // Fertilize groups
  const fertilizeDue = plants.filter(p => careStatus(p.lastFertilize, p.fertilizeEvery) === 'due');
  const fertilizeSoon = plants.filter(p => careStatus(p.lastFertilize, p.fertilizeEvery) === 'soon');
  const fertilizeUnscheduled = plants.filter(p => careStatus(p.lastFertilize, p.fertilizeEvery) === 'unscheduled');
  const fertilizeGroups = [
    { when: 'Due now', items: fertilizeDue, action: 'fertilize' as const },
    { when: 'Due soon', items: fertilizeSoon, action: 'fertilize' as const },
  ].filter(g => g.items.length > 0);

  // Prune groups
  const pruneDue = plants.filter(p => careStatus(p.lastPrune, p.pruneEvery) === 'due');
  const pruneSoon = plants.filter(p => careStatus(p.lastPrune, p.pruneEvery) === 'soon');
  const pruneUnscheduled = plants.filter(p => careStatus(p.lastPrune, p.pruneEvery) === 'unscheduled');
  const pruneGroups = [
    { when: 'Due now', items: pruneDue, action: 'prune' as const },
    { when: 'Due soon', items: pruneSoon, action: 'prune' as const },
  ].filter(g => g.items.length > 0);

  const btn = (label: string, icon: string, color: string, bg: string, onClick: () => void) => (
    <button onClick={e => { e.stopPropagation(); onClick(); }} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: T.sans, fontSize: 13, fontWeight: 600,
      background: bg, color, border: 'none', borderRadius: 999,
      padding: '7px 13px', cursor: 'pointer', flexShrink: 0,
    }}>
      <Icon name={icon} size={13} color={color} stroke={2} />
      {label}
    </button>
  );

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: T.paper }}>
      <div style={{ padding: 'calc(14px + var(--sat)) 20px calc(24px + var(--sab))' }}>
        <h1 style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 30, color: T.ink, letterSpacing: '-0.03em' }}>Care</h1>

        {/* urgency hero */}
        <div style={{
          marginTop: 18,
          background: dryCount > 0 ? T.canopy : T.sprout,
          borderRadius: 24, padding: '20px 22px',
          color: dryCount > 0 ? T.onDark : T.ink,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -30, top: '50%', transform: 'translateY(-50%)', opacity: 0.09 }}>
            <Icon name="bell" size={110} color={dryCount > 0 ? '#fff' : T.canopy} stroke={1.1} />
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: dryCount > 0 ? T.sageSoft : T.ink3 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em', marginTop: 4, lineHeight: 1.2 }}>
              {dryCount > 0 ? `${dryCount} ${dryCount === 1 ? 'plant needs' : 'plants need'} water.` : 'All plants are cared for. 🌿'}
            </div>
            <div style={{ fontFamily: T.sans, fontSize: 13.5, color: dryCount > 0 ? T.sageSoft : T.ink2, marginTop: 5, lineHeight: 1.5 }}>
              {dryCount > 0
                ? `${soonCount > 0 ? `${soonCount} more due tomorrow. ` : ''}Give them a drink and you're done.`
                : 'Nothing urgent today. Check back tomorrow.'}
            </div>
          </div>
        </div>

        {/* seasonal nudge */}
        <div style={{ marginTop: 16, background: T.sunSoft, border: '1px solid #F0D9B4', borderRadius: 20, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Icon name="cloudSun" size={18} color={T.sunDeep} />
          </div>
          <div>
            <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 15, color: '#6b4a14' }}>Autumn is coming</div>
            <div style={{ fontFamily: T.sans, fontSize: 13, color: '#7a5a25', marginTop: 2, lineHeight: 1.5 }}>
              Rootly is easing back watering as days get shorter.
            </div>
          </div>
        </div>

        {/* === WATERING === */}
        <div style={{ marginTop: 28 }}>
          <SectionHeader>💧 Watering</SectionHeader>
          {waterGroups.map(g => (
            <div key={g.when} style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: T.sans, fontSize: 12.5, fontWeight: 700, color: T.ink3, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 8 }}>{g.when}</div>
              <div style={{ background: T.card, borderRadius: 18, boxShadow: '0 2px 6px rgba(30,42,34,.06)', overflow: 'hidden' }}>
                {g.items.map((p, i) => (
                  <div key={p.id} onClick={() => onOpen(p)} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 16px', cursor: 'pointer', borderTop: i ? `1px solid ${T.stone100}` : 'none' }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: T.sprout, display: 'grid', placeItems: 'center' }}>
                      <PlantArt icon={p.icon} size={34} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 600, color: T.ink }}>{p.name}</div>
                      <div style={{ fontFamily: T.sans, fontSize: 12.5, color: T.ink3, marginTop: 1 }}>{p.room}</div>
                    </div>
                    {(p.status === 'dry' || p.status === 'soon')
                      ? btn('Water', 'droplet', p.status === 'dry' ? T.onDark : T.canopy, p.status === 'dry' ? T.canopy : T.sproutDeep, () => onWater(p))
                      : <span style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3 }}>In {daysUntil(p.lastWater, p.every)}d</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* === FERTILIZING === */}
        <div style={{ marginTop: 28 }}>
          <SectionHeader>🌱 Fertilizing</SectionHeader>
          {fertilizeGroups.length === 0 && fertilizeUnscheduled.length === 0 && (
            <div style={{ fontFamily: T.sans, fontSize: 13.5, color: T.ink3, padding: '12px 0' }}>All plants fertilized and on schedule.</div>
          )}
          {fertilizeGroups.map(g => (
            <div key={g.when} style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: T.sans, fontSize: 12.5, fontWeight: 700, color: T.ink3, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 8 }}>{g.when}</div>
              <div style={{ background: T.card, borderRadius: 18, boxShadow: '0 2px 6px rgba(30,42,34,.06)', overflow: 'hidden' }}>
                {g.items.map((p, i) => (
                  <div key={p.id} onClick={() => onOpen(p)} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 16px', cursor: 'pointer', borderTop: i ? `1px solid ${T.stone100}` : 'none' }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#EBF4E8', display: 'grid', placeItems: 'center' }}>
                      <PlantArt icon={p.icon} size={34} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 600, color: T.ink }}>{p.name}</div>
                      <div style={{ fontFamily: T.sans, fontSize: 12.5, color: T.ink3, marginTop: 1 }}>Every {p.fertilizeEvery}d</div>
                    </div>
                    {btn('Done', 'sparkles', T.canopy, T.sprout, () => onFertilize(p))}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {fertilizeUnscheduled.length > 0 && (
            <div style={{ background: T.linen, borderRadius: 16, padding: '12px 16px', marginTop: 8 }}>
              <div style={{ fontFamily: T.sans, fontSize: 12.5, fontWeight: 700, color: T.ink3, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 8 }}>No schedule set</div>
              {fertilizeUnscheduled.map((p, i) => (
                <div key={p.id} onClick={() => onOpen(p)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', cursor: 'pointer', borderTop: i ? `1px solid ${T.stone200}` : 'none' }}>
                  <PlantArt icon={p.icon} size={28} />
                  <div style={{ flex: 1, fontFamily: T.sans, fontSize: 14, color: T.ink }}>{p.name}</div>
                  <span style={{ fontFamily: T.sans, fontSize: 12, color: T.fern }}>+ Add schedule</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* === PRUNING === */}
        <div style={{ marginTop: 28 }}>
          <SectionHeader>✂️ Pruning</SectionHeader>
          {pruneGroups.length === 0 && pruneUnscheduled.length === 0 && (
            <div style={{ fontFamily: T.sans, fontSize: 13.5, color: T.ink3, padding: '12px 0' }}>All plants pruned and on schedule.</div>
          )}
          {pruneGroups.map(g => (
            <div key={g.when} style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: T.sans, fontSize: 12.5, fontWeight: 700, color: T.ink3, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 8 }}>{g.when}</div>
              <div style={{ background: T.card, borderRadius: 18, boxShadow: '0 2px 6px rgba(30,42,34,.06)', overflow: 'hidden' }}>
                {g.items.map((p, i) => (
                  <div key={p.id} onClick={() => onOpen(p)} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 16px', cursor: 'pointer', borderTop: i ? `1px solid ${T.stone100}` : 'none' }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#EBF4E8', display: 'grid', placeItems: 'center' }}>
                      <PlantArt icon={p.icon} size={34} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 600, color: T.ink }}>{p.name}</div>
                      <div style={{ fontFamily: T.sans, fontSize: 12.5, color: T.ink3, marginTop: 1 }}>Every {p.pruneEvery}d</div>
                    </div>
                    {btn('Done', 'scissors', T.canopy, T.sprout, () => onPrune(p))}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {pruneUnscheduled.length > 0 && (
            <div style={{ background: T.linen, borderRadius: 16, padding: '12px 16px', marginTop: 8 }}>
              <div style={{ fontFamily: T.sans, fontSize: 12.5, fontWeight: 700, color: T.ink3, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 8 }}>No schedule set</div>
              {pruneUnscheduled.map((p, i) => (
                <div key={p.id} onClick={() => onOpen(p)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', cursor: 'pointer', borderTop: i ? `1px solid ${T.stone200}` : 'none' }}>
                  <PlantArt icon={p.icon} size={28} />
                  <div style={{ flex: 1, fontFamily: T.sans, fontSize: 14, color: T.ink }}>{p.name}</div>
                  <span style={{ fontFamily: T.sans, fontSize: 12, color: T.fern }}>+ Add schedule</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
