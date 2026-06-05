import { useState } from 'react';
import type { Plant } from '../../types/plant';
import { T } from '../../tokens';
import { PlantCard, Icon } from '../../components';

import type { Area } from '../../types/area';

interface Props {
  plants: Plant[];
  onOpen: (p: Plant) => void;
  areas: Area[];
}

export function PlantsScreen({ plants, onOpen, areas }: Props) {
  const [filter, setFilter] = useState('All');
  const chips = ['All', 'Needs care', ...areas.map(a => a.name)];
  
  const shown = plants.filter(p => {
    if (filter === 'All') return true;
    if (filter === 'Needs care') return p.status === 'dry' || p.status === 'soon';
    return p.room === filter;
  });

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: T.paper }}>
      <div style={{ padding: 'calc(14px + var(--sat)) 20px calc(120px + var(--sab))' }}>
        <h1 style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 30, color: T.ink, letterSpacing: '-0.03em' }}>Plants</h1>

        {/* search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, background: '#fff',
          border: `1.5px solid ${T.stone200}`, borderRadius: 14, padding: '11px 14px', marginTop: 16,
        }}>
          <Icon name="search" size={19} color={T.ink3} />
          <span style={{ fontFamily: T.sans, fontSize: 15, color: T.ink3 }}>Search your plants</span>
        </div>

        {/* filter chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '14px -20px 0', padding: '0 20px' }}>
          {chips.map(c => (
            <button key={c} onClick={() => setFilter(c)} style={{
              flexShrink: 0, fontFamily: T.sans, fontSize: 13.5,
              fontWeight: filter === c ? 600 : 500, borderRadius: 999, padding: '8px 14px', cursor: 'pointer',
              border: `1.5px solid ${filter === c ? T.sageSoft : T.stone200}`,
              background: filter === c ? T.sprout : '#fff',
              color: filter === c ? T.canopy : T.ink2,
            }}>{c}</button>
          ))}
        </div>

        {/* grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13, marginTop: 18 }}>
          {shown.map(p => <PlantCard key={p.id} plant={p} onClick={() => onOpen(p)} />)}
        </div>
      </div>
    </div>
  );
}
