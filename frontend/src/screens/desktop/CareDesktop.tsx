import type { Plant } from '../../types/plant';
import { T } from '../../tokens';
import { SectionHeader, Card, Icon } from '../../components';
import { PlantArt } from '../../components/PlantArt';
import { Topbar } from './Topbar';
import { getUpcomingWateringText } from '../../utils/date';

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

const WATER_GROUPS: { when: string; statuses: Plant['status'][] }[] = [
  { when: 'Today',     statuses: ['dry'] },
  { when: 'Tomorrow',  statuses: ['soon'] },
  { when: 'This week', statuses: ['thriving', 'watered'] },
];

function ActionBtn({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        fontFamily: T.sans, fontSize: 13.5, fontWeight: 600,
        background: T.canopy, color: T.onDark,
        border: 'none', borderRadius: 999, padding: '8px 14px',
        cursor: 'pointer', flexShrink: 0,
        transition: 'all .18s cubic-bezier(.22,.61,.36,1)',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = T.moss; }}
      onMouseLeave={e => { e.currentTarget.style.background = T.canopy; }}
    >
      <Icon name={icon} size={15} color={T.onDark} stroke={2} />
      {label}
    </button>
  );
}

function PlantRow({ p, onOpen, action }: { p: Plant; onOpen: (p: Plant) => void; action?: React.ReactNode }) {
  return (
    <div
      onClick={() => onOpen(p)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px',
        cursor: 'pointer', transition: 'background .15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = T.sprout)}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: T.sprout, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <PlantArt icon={p.icon} size={34} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.sans, fontSize: 15.5, fontWeight: 600, color: T.ink }}>{p.name}</div>
        <div style={{ fontFamily: T.sans, fontSize: 12.5, color: T.ink3, marginTop: 1 }}>{p.room}</div>
      </div>
      {action}
    </div>
  );
}

export function CareDesktop({ plants, onOpen, onWater, onFertilize, onPrune }: Props) {
  const waterGroups = WATER_GROUPS.map(g => ({
    when: g.when,
    items: plants.filter(p => g.statuses.includes(p.status)),
  })).filter(g => g.items.length > 0);

  const dryCount = plants.filter(p => p.status === 'dry').length;
  const soonCount = plants.filter(p => p.status === 'soon').length;

  // Fertilize
  const fertilizeDue  = plants.filter(p => careStatus(p.lastFertilize, p.fertilizeEvery) === 'due');
  const fertilizeSoon = plants.filter(p => careStatus(p.lastFertilize, p.fertilizeEvery) === 'soon');
  const fertilizeUnscheduled = plants.filter(p => careStatus(p.lastFertilize, p.fertilizeEvery) === 'unscheduled');
  const fertilizeGroups = [
    { when: '🌱 Fertilize now', items: fertilizeDue },
    { when: '🌱 Fertilize soon', items: fertilizeSoon },
  ].filter(g => g.items.length > 0);

  // Prune
  const pruneDue  = plants.filter(p => careStatus(p.lastPrune, p.pruneEvery) === 'due');
  const pruneSoon = plants.filter(p => careStatus(p.lastPrune, p.pruneEvery) === 'soon');
  const pruneUnscheduled = plants.filter(p => careStatus(p.lastPrune, p.pruneEvery) === 'unscheduled');
  const pruneGroups = [
    { when: '✂️ Prune now', items: pruneDue },
    { when: '✂️ Prune soon', items: pruneSoon },
  ].filter(g => g.items.length > 0);

  const upcomingAll = plants
    .filter(p => p.status !== 'dry')
    .map(p => {
      const baseDate = p.lastWater ? new Date(p.lastWater) : new Date(p.createdAt || 0);
      const nextDate = new Date(baseDate.getTime() + p.every * 24 * 60 * 60 * 1000);
      return { plant: p, nextDate };
    })
    .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())
    .slice(0, 5);

  const attentionCount = dryCount + soonCount + fertilizeDue.length + fertilizeSoon.length + pruneDue.length + pruneSoon.length;

  return (
    <div style={{ flex: 1, overflowY: 'auto', height: '100%' }}>
      <Topbar
        title="Care"
        subtitle={`${plants.length} plant${plants.length !== 1 ? 's' : ''} · ${attentionCount} need attention`}
        search={false}
      />

      <div style={{ padding: '28px 40px 60px', display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left column */}
        <div>
          {/* Hero */}
          <div style={{
            background: dryCount > 0 ? T.canopy : T.sprout,
            borderRadius: 24, padding: '28px 30px',
            color: dryCount > 0 ? T.onDark : T.ink,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.09 }}>
              <Icon name="bell" size={120} color={dryCount > 0 ? '#fff' : T.canopy} stroke={1.1} />
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: dryCount > 0 ? T.sageSoft : T.ink3 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 30, letterSpacing: '-0.02em', marginTop: 6, lineHeight: 1.15 }}>
                {dryCount > 0 ? `${dryCount} ${dryCount === 1 ? 'plant needs' : 'plants need'} water now.` : 'All plants are cared for. 🌿'}
              </div>
              <div style={{ fontFamily: T.sans, fontSize: 15, color: dryCount > 0 ? T.sageSoft : T.ink2, marginTop: 8, lineHeight: 1.5 }}>
                {dryCount > 0
                  ? `${soonCount > 0 ? `${soonCount} more due tomorrow. ` : ''}Give them a drink and you're done.`
                  : 'Nothing urgent today. Check back tomorrow.'}
              </div>
            </div>
          </div>

          {/* Watering */}
          {waterGroups.map(g => (
            <div key={g.when} style={{ marginTop: 28 }}>
              <SectionHeader>💧 Watering — {g.when}</SectionHeader>
              <Card pad={0}>
                {g.items.map((p, i) => (
                  <div key={p.id} style={{ borderBottom: i < g.items.length - 1 ? `1px solid ${T.stone100}` : 'none' }}>
                    <PlantRow p={p} onOpen={onOpen} action={
                      (p.status === 'dry' || p.status === 'soon') ? (
                        <ActionBtn label="Water" icon="droplet" onClick={() => onWater(p)} />
                      ) : (
                        <span style={{ fontFamily: T.mono, fontSize: 13, color: T.ink3 }}>{p.moisture}%</span>
                      )
                    } />
                  </div>
                ))}
              </Card>
            </div>
          ))}

          {waterGroups.length === 0 && (
            <div style={{ marginTop: 28 }}>
              <Card>
                <div style={{ textAlign: 'center', padding: '20px 0', fontFamily: T.sans, fontSize: 15, color: T.ink3 }}>
                  All plants on watering schedule — nothing urgent today.
                </div>
              </Card>
            </div>
          )}

          {/* Fertilizing */}
          {fertilizeGroups.map(g => (
            <div key={g.when} style={{ marginTop: 28 }}>
              <SectionHeader>{g.when}</SectionHeader>
              <Card pad={0}>
                {g.items.map((p, i) => (
                  <div key={p.id} style={{ borderBottom: i < g.items.length - 1 ? `1px solid ${T.stone100}` : 'none' }}>
                    <PlantRow p={p} onOpen={onOpen} action={
                      <ActionBtn label="Log done" icon="sparkles" onClick={() => onFertilize(p)} />
                    } />
                  </div>
                ))}
              </Card>
            </div>
          ))}

          {fertilizeUnscheduled.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <SectionHeader>🌱 Fertilize — Not scheduled</SectionHeader>
              <Card pad={0}>
                {fertilizeUnscheduled.map((p, i) => (
                  <div key={p.id} style={{ borderBottom: i < fertilizeUnscheduled.length - 1 ? `1px solid ${T.stone100}` : 'none' }}>
                    <PlantRow p={p} onOpen={onOpen} action={
                      <span style={{ fontFamily: T.sans, fontSize: 13, color: T.fern, cursor: 'pointer' }}>+ Set schedule</span>
                    } />
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* Pruning */}
          {pruneGroups.map(g => (
            <div key={g.when} style={{ marginTop: 28 }}>
              <SectionHeader>{g.when}</SectionHeader>
              <Card pad={0}>
                {g.items.map((p, i) => (
                  <div key={p.id} style={{ borderBottom: i < g.items.length - 1 ? `1px solid ${T.stone100}` : 'none' }}>
                    <PlantRow p={p} onOpen={onOpen} action={
                      <ActionBtn label="Log done" icon="scissors" onClick={() => onPrune(p)} />
                    } />
                  </div>
                ))}
              </Card>
            </div>
          ))}

          {pruneUnscheduled.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <SectionHeader>✂️ Pruning — Not scheduled</SectionHeader>
              <Card pad={0}>
                {pruneUnscheduled.map((p, i) => (
                  <div key={p.id} style={{ borderBottom: i < pruneUnscheduled.length - 1 ? `1px solid ${T.stone100}` : 'none' }}>
                    <PlantRow p={p} onOpen={onOpen} action={
                      <span style={{ fontFamily: T.sans, fontSize: 13, color: T.fern, cursor: 'pointer' }}>+ Set schedule</span>
                    } />
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>

        {/* Right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Seasonal nudge */}
          <div style={{ background: T.sunSoft, border: `1px solid #F0D9B4`, borderRadius: 18, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Icon name="cloudSun" size={20} color={T.sunDeep} />
            </div>
            <div>
              <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, color: '#6b4a14' }}>Autumn is coming</div>
              <div style={{ fontFamily: T.sans, fontSize: 13.5, color: '#7a5a25', marginTop: 3, lineHeight: 1.5 }}>
                Rootly is easing back watering as days get shorter. Most plants will need less water soon.
              </div>
            </div>
          </div>

          {/* Upcoming waterings */}
          <Card>
            <SectionHeader>Upcoming waterings</SectionHeader>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {upcomingAll.length > 0 ? (
                upcomingAll.map(({ plant }, i) => (
                  <div key={plant.id} onClick={() => onOpen(plant)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', cursor: 'pointer', borderTop: i ? `1px solid ${T.stone100}` : 'none' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: T.sprout, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <PlantArt icon={plant.icon} size={30} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: T.sans, fontSize: 14.5, fontWeight: 600, color: T.ink }}>{plant.name}</div>
                      <div style={{ fontFamily: T.sans, fontSize: 12.5, color: T.ink3 }}>{getUpcomingWateringText(plant)}</div>
                    </div>
                    <Icon name="droplet" size={17} color={T.ink3} stroke={1.9} />
                  </div>
                ))
              ) : (
                <div style={{ fontFamily: T.sans, fontSize: 14, color: T.ink3, padding: '10px 0', textAlign: 'center' }}>No upcoming waterings.</div>
              )}
            </div>
          </Card>

          {/* At a glance */}
          <Card>
            <SectionHeader>At a glance</SectionHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: 'alertCircle', label: 'Need water',      value: String(dryCount), tint: '#F6E2DC', color: '#BC5B49' },
                { icon: 'clock',       label: 'Water tomorrow',  value: String(soonCount), tint: T.sunSoft, color: T.sunDeep },
                { icon: 'sparkles',    label: 'Fertilize due',   value: String(fertilizeDue.length + fertilizeSoon.length), tint: '#E8F4E8', color: T.fern },
                { icon: 'scissors',    label: 'Prune due',       value: String(pruneDue.length + pruneSoon.length), tint: '#F0EEF8', color: '#7C6FC0' },
                { icon: 'check',       label: 'All good',        value: String(plants.length - dryCount - soonCount - fertilizeDue.length - pruneDue.length), tint: T.successSoft, color: T.success },
              ].map(({ icon, label, value, tint, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: tint, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon name={icon} size={19} color={color} stroke={2} />
                  </div>
                  <div style={{ flex: 1, fontFamily: T.sans, fontSize: 14.5, color: T.ink2 }}>{label}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 500, color: T.ink }}>{value}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
