import { useState } from 'react';
import type { Plant } from '../../types/plant';
import { T, PlantCard } from '../../components';
import { Topbar } from './Topbar';

interface Props {
  plants: Plant[];
  onOpen: (p: Plant) => void;
}

const CHIPS = ['All', 'Needs care', 'Living room', 'Bedroom', 'Office', 'Kitchen'];

export function PlantsDesktop({ plants, onOpen }: Props) {
  const [filter, setFilter] = useState('All');
  const shown = plants.filter(p => {
    if (filter === 'All') return true;
    if (filter === 'Needs care') return p.status === 'dry' || p.status === 'soon';
    return p.room === filter;
  });

  return (
    <div style={{ flex: 1, overflowY: 'auto', height: '100%' }}>
      <Topbar subtitle={`${plants.length} plants · 4 rooms`} title="Plants" />
      <div style={{ padding: '24px 40px 60px' }}>
        <div style={{ display: 'flex', gap: 9, marginBottom: 22, flexWrap: 'wrap' }}>
          {CHIPS.map(c => (
            <button key={c} onClick={() => setFilter(c)} style={{
              fontFamily: T.sans, fontSize: 14, fontWeight: filter === c ? 600 : 500,
              borderRadius: 999, padding: '9px 16px', cursor: 'pointer',
              border: `1.5px solid ${filter === c ? T.sageSoft : T.stone200}`,
              background: filter === c ? T.sprout : T.card, color: filter === c ? T.canopy : T.ink2,
            }}>{c}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(228px, 1fr))', gap: 20 }}>
          {shown.map(p => <PlantCard key={p.id} plant={p} onClick={() => onOpen(p)} />)}
        </div>
      </div>
    </div>
  );
}
