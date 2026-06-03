import type { Plant } from '../../types/plant';
import { T } from '../../tokens';
import { Button, PlantRow, SectionHeader, Card, Icon } from '../../components';
import { PlantArt } from '../../components/PlantArt';
import { Topbar } from './Topbar';
import { getDisplayName } from '../../api/auth';
import type { UserResponse } from '../../api/auth';
import { getLocalDateInTimezone, getUpcomingWateringText } from '../../utils/date';

interface Props {
  plants: Plant[];
  onOpen: (p: Plant) => void;
  onWater: (p: Plant) => void;
  onWaterAll: () => void;
  currentUser: UserResponse | null;
}

function Summary({ icon, label, value, tint, color }: { icon: string; label: string; value: string; tint: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: tint, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={20} color={color} stroke={2} />
      </div>
      <div style={{ flex: 1, fontFamily: T.sans, fontSize: 14.5, color: T.ink2 }}>{label}</div>
      <div style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 500, color: T.ink }}>{value}</div>
    </div>
  );
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function TodayDesktop({ plants, onOpen, onWater, onWaterAll, currentUser }: Props) {
  const needs = plants.filter(p => p.status === 'dry' || p.status === 'soon');
  const well = plants.filter(p => p.status === 'thriving' || p.status === 'watered');
  const dryCount = plants.filter(p => p.status === 'dry').length;
  
  const nowTz = getLocalDateInTimezone(new Date());
  const day = DAYS[nowTz.getDay()];

  const h = nowTz.getHours();
  const timeGreeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const displayName = currentUser ? getDisplayName(currentUser) : 'Guest';
  const subtitle = `${timeGreeting}, ${displayName} · ${day}`;

  const upcoming = plants
    .filter(p => p.status !== 'dry')
    .map(p => {
      const baseDate = p.lastWater ? new Date(p.lastWater) : new Date(p.createdAt || 0);
      const nextDate = new Date(baseDate.getTime() + p.every * 24 * 60 * 60 * 1000);
      const nextDateTz = getLocalDateInTimezone(nextDate);
      return { plant: p, nextDateTz };
    })
    .sort((a, b) => a.nextDateTz.getTime() - b.nextDateTz.getTime())
    .slice(0, 3);

  return (
    <div style={{ flex: 1, overflowY: 'auto', height: '100%' }}>
      <Topbar subtitle={subtitle} title="Today">
        <Button variant="accent" icon="droplet" onClick={onWaterAll}>Water all due</Button>
      </Topbar>

      <div style={{ padding: '28px 40px 60px', display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* left */}
        <div>
          {/* hero banner */}
          <div style={{ background: T.canopy, borderRadius: 24, padding: '28px 30px', color: T.onDark, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -20, top: -30, opacity: 0.13 }}>
              <Icon name="droplet" size={190} color="#fff" stroke={1.1} />
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.sageSoft }}>This morning</div>
              <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 30, letterSpacing: '-0.02em', marginTop: 6, lineHeight: 1.12 }}>
                {dryCount} {dryCount === 1 ? 'plant' : 'plants'} could use a drink.
              </div>
              <div style={{ fontFamily: T.sans, fontSize: 15, color: T.sageSoft, marginTop: 8, maxWidth: 360, lineHeight: 1.5 }}>
                The rest are doing well. A couple of minutes and you're caught up for the day.
              </div>
            </div>
          </div>

          {/* needs care */}
          <div style={{ marginTop: 28 }}>
            <SectionHeader>Needs care today</SectionHeader>
            <Card pad={0}>
              {needs.length > 0 ? (
                needs.map((p, i) => <PlantRow key={p.id} plant={p} onClick={() => onOpen(p)} onWater={onWater} last={i === needs.length - 1} />)
              ) : (
                <div style={{ fontFamily: T.sans, fontSize: 14.5, color: T.ink3, padding: '20px 16px', textAlign: 'center' }}>
                  No plants need care today.
                </div>
              )}
            </Card>
          </div>

          {/* doing well */}
          <div style={{ marginTop: 28 }}>
            <SectionHeader action="See all plants">Doing well</SectionHeader>
            <Card pad={0}>
              {well.length > 0 ? (
                well.map((p, i) => <PlantRow key={p.id} plant={p} onClick={() => onOpen(p)} onWater={onWater} last={i === well.length - 1} />)
              ) : (
                <div style={{ fontFamily: T.sans, fontSize: 14.5, color: T.ink3, padding: '20px 16px', textAlign: 'center' }}>
                  No plants are currently doing well.
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card>
            <SectionHeader>This week</SectionHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Summary icon="droplets" label="Waterings logged" value="6" tint={T.waterSoft} color={T.water} />
              <Summary icon="trendingUp" label="Growth across plants" value="+19cm" tint={T.successSoft} color={T.success} />
              <Summary icon="check" label="On-time care" value="92%" tint={T.sprout} color={T.canopy} />
            </div>
          </Card>

          <Card>
            <SectionHeader>Upcoming</SectionHeader>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {upcoming.length > 0 ? (
                upcoming.map(({ plant }, i) => (
                  <div key={plant.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: i ? `1px solid ${T.stone100}` : 'none' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: T.sprout, display: 'grid', placeItems: 'center' }}>
                      <PlantArt kind={plant.kind} size={30} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: T.sans, fontSize: 14.5, fontWeight: 600, color: T.ink }}>{plant.name}</div>
                      <div style={{ fontFamily: T.sans, fontSize: 12.5, color: T.ink3 }}>{getUpcomingWateringText(plant)}</div>
                    </div>
                    <Icon name="droplet" size={17} color={T.ink3} stroke={1.9} />
                  </div>
                ))
              ) : (
                <div style={{ fontFamily: T.sans, fontSize: 14, color: T.ink3, padding: '10px 0', textAlign: 'center' }}>
                  No upcoming waterings.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
