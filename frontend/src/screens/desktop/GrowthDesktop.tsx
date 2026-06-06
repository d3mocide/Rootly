import { useState, useEffect, useRef } from 'react';
import type { Plant } from '../../types/plant';
import { T } from '../../tokens';
import { Sparkline, SectionHeader, Card, Icon } from '../../components';
import { PlantArt } from '../../components/PlantArt';
import { Topbar } from './Topbar';
import { useUnits, formatLength } from '../../units';

interface Props {
  plants: Plant[];
  onOpen: (p: Plant) => void;
  onLogGrowth: (p: Plant) => void;
}

function StatTile({ icon, label, value, tint, color }: {
  icon: string; label: string; value: string; tint: string; color: string;
}) {
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

export function GrowthDesktop({ plants, onOpen, onLogGrowth }: Props) {
  const units = useUnits();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(420);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Season total
  const totalGrowth = plants.reduce((sum, p) => {
    if (p.growth && p.growth.length >= 2) {
      return sum + (p.growth[p.growth.length - 1] - p.growth[0]);
    }
    return sum;
  }, 0);

  // Plants with at least one growth entry
  const plantsWithGrowth = plants.filter(p => p.growth && p.growth.length >= 1);
  const plantsTracked = plantsWithGrowth.length;

  // Best performer
  const bestPlant = plantsWithGrowth.reduce<{ plant: Plant | null; delta: number }>(
    (best, p) => {
      const delta = p.growth.length >= 2 ? p.growth[p.growth.length - 1] - p.growth[0] : 0;
      return delta > best.delta ? { plant: p, delta } : best;
    },
    { plant: null, delta: -Infinity }
  );

  // Aggregate weekly trend across all plants
  const maxLen = Math.max(...plants.map(p => p.growth?.length || 0), 0);
  const trend: number[] = [];
  if (maxLen >= 2) {
    for (let i = 0; i < maxLen; i++) {
      let sum = 0;
      plants.forEach(p => {
        if (p.growth && p.growth.length > 0) {
          const idx = p.growth.length - maxLen + i;
          sum += idx >= 0 ? p.growth[idx] : p.growth[0];
        }
      });
      trend.push(sum);
    }
  }
  const diffTrend = trend.length >= 2 ? trend.map(v => v - trend[0]) : [];

  // Sort plants: most growth first
  const sortedPlants = [...plantsWithGrowth].sort((a, b) => {
    const da = a.growth.length >= 2 ? a.growth[a.growth.length - 1] - a.growth[0] : 0;
    const db = b.growth.length >= 2 ? b.growth[b.growth.length - 1] - b.growth[0] : 0;
    return db - da;
  });

  const noGrowth = plantsWithGrowth.length === 0;

  return (
    <div style={{ flex: 1, overflowY: 'auto', height: '100%' }}>
      <Topbar title="Growth" subtitle={`${plantsTracked} plant${plantsTracked !== 1 ? 's' : ''} tracked`} search={false} />

      <div style={{ padding: '28px 40px 60px', display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left column */}
        <div>
          {/* Season hero */}
          <div style={{
            background: T.canopy, borderRadius: 24, padding: '28px 30px',
            color: T.onDark, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.sageSoft }}>
                Across all plants
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
                <span style={{ fontFamily: T.mono, fontSize: 42, fontWeight: 500, letterSpacing: '-0.02em' }}>
                  +{formatLength(totalGrowth, units)}
                </span>
                <span style={{ fontFamily: T.sans, fontSize: 15, color: T.sageSoft }}>this season</span>
              </div>
              {diffTrend.length >= 2 && (
                <div ref={containerRef} style={{ marginTop: 14, width: '100%' }}>
                  <Sparkline data={diffTrend} width={containerWidth} height={54} color="#A9C2A1" />
                </div>
              )}
            </div>
          </div>

          {/* Per-plant list */}
          <div style={{ marginTop: 28 }}>
            <SectionHeader>By plant</SectionHeader>
            <Card pad={0}>
              {sortedPlants.length > 0 ? (
                sortedPlants.map((p, i) => {
                  const delta = p.growth.length >= 2 ? p.growth[p.growth.length - 1] - p.growth[0] : 0;
                  return (
                    <div
                      key={p.id}
                      onClick={() => onOpen(p)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '13px 18px', cursor: 'pointer',
                        borderBottom: i < sortedPlants.length - 1 ? `1px solid ${T.stone100}` : 'none',
                        transition: 'background .15s',
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
                      <div style={{ width: 100, flexShrink: 0 }}>
                        {p.growth.length >= 2 && <Sparkline data={p.growth} width={100} height={36} />}
                      </div>
                      <div style={{
                        fontFamily: T.mono, fontSize: 15, fontWeight: 500,
                        color: delta >= 0 ? T.fern : '#BC5B49',
                        minWidth: 60, textAlign: 'right',
                      }}>
                        {delta >= 0 ? '+' : ''}{formatLength(delta, units)}
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); onLogGrowth(p); }}
                        title="Log growth"
                        style={{
                          width: 34, height: 34, borderRadius: '50%', border: 'none',
                          background: T.sproutDeep, cursor: 'pointer', display: 'grid', placeItems: 'center',
                          flexShrink: 0, transition: 'all .18s cubic-bezier(.22,.61,.36,1)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.sageSoft; }}
                        onMouseLeave={e => { e.currentTarget.style.background = T.sproutDeep; }}
                      >
                        <Icon name="plus" size={16} color={T.canopy} stroke={2.5} />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div style={{ fontFamily: T.sans, fontSize: 14.5, color: T.ink3, padding: '28px 20px', textAlign: 'center' }}>
                  No growth data yet. Open a plant and log its first measurement.
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card>
            <SectionHeader>Season stats</SectionHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <StatTile
                icon="trendingUp"
                label="Total growth"
                value={`+${formatLength(totalGrowth, units)}`}
                tint={T.successSoft}
                color={T.success}
              />
              <StatTile
                icon="chart"
                label="Plants tracked"
                value={String(plantsTracked)}
                tint={T.sprout}
                color={T.canopy}
              />
              {bestPlant.plant && !noGrowth && (
                <StatTile
                  icon="award"
                  label="Best performer"
                  value={bestPlant.plant.name}
                  tint={T.sunSoft}
                  color={T.sunDeep}
                />
              )}
            </div>
          </Card>

          {/* Tip card */}
          <Card>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: T.sprout, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name="lightbulb" size={19} color={T.canopy} stroke={1.8} />
              </div>
              <div>
                <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 15.5, color: T.ink }}>
                  Track consistently
                </div>
                <div style={{ fontFamily: T.sans, fontSize: 13.5, color: T.ink2, marginTop: 4, lineHeight: 1.5 }}>
                  Measure from soil to the tallest leaf tip every 1–2 weeks for the most accurate season trend.
                </div>
              </div>
            </div>
          </Card>

          {/* Plants without growth data */}
          {plants.length > plantsTracked && (
            <Card>
              <SectionHeader>Not yet tracked</SectionHeader>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {plants.filter(p => !p.growth || p.growth.length === 0).map((p, i, arr) => (
                  <div
                    key={p.id}
                    onClick={() => onLogGrowth(p)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 0', cursor: 'pointer',
                      borderBottom: i < arr.length - 1 ? `1px solid ${T.stone100}` : 'none',
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: T.sprout, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <PlantArt icon={p.icon} size={26} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.ink }}>{p.name}</div>
                    </div>
                    <Icon name="plus" size={16} color={T.ink3} stroke={2} />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
