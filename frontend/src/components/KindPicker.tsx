import React from 'react';
import { T } from '../tokens';
import { PlantArt } from './PlantArt';
import type { PlantKind } from '../types/plant';

interface KindPickerProps {
  value: PlantKind | undefined;
  onChange: (v: PlantKind | undefined) => void;
}

const OPTIONS: { value: PlantKind | undefined; label: string }[] = [
  { value: undefined,    label: 'Auto' },
  { value: 'monstera',   label: 'Monstera' },
  { value: 'fig',        label: 'Fig' },
  { value: 'pothos',     label: 'Pothos' },
  { value: 'snake',      label: 'Snake' },
  { value: 'succulent',  label: 'Succulent' },
];

function AutoArt() {
  return (
    <svg width={40} height={40} viewBox="0 0 64 64" fill="none">
      <path d="M19 45 H45 L42 60 Q41.6 62 39.5 62 H24.5 Q22.4 62 22 60 Z" fill="#C98A5E"/>
      <path d="M17.5 43.5 H46.5 Q47.6 43.5 47.4 45 L47 47 Q46.8 48 45.5 48 H18.5 Q17.2 48 17 47 L16.6 45 Q16.4 43.5 17.5 43.5 Z" fill="#B97A4F"/>
      <path d="M32 44 C24 38 18 28 18 20 C26 18 32 26 32 44 Z" fill="#C8DFC4"/>
      <path d="M32 44 C40 38 46 28 46 20 C38 18 32 26 32 44 Z" fill="#B8D4B2"/>
      <path d="M32 44 C32 32 32 20 32 12 C36 16 36 30 32 44 Z" fill="#A8C9A0"/>
    </svg>
  );
}

export function KindPicker({ value, onChange }: KindPickerProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
      {OPTIONS.map(opt => {
        const sel = opt.value === value;
        return (
          <button
            key={opt.value ?? 'auto'}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              padding: '10px 6px 8px', borderRadius: 14,
              border: sel ? `2px solid ${T.fern}` : `1.5px solid ${T.stone200}`,
              background: sel ? T.linen : T.card,
              cursor: 'pointer', transition: 'all .14s',
            }}
            onMouseEnter={e => { if (!sel) e.currentTarget.style.background = T.linen; }}
            onMouseLeave={e => { if (!sel) e.currentTarget.style.background = T.card; }}
          >
            {opt.value ? <PlantArt kind={opt.value} size={40} /> : <AutoArt />}
            <span style={{
              fontFamily: T.sans, fontSize: 11, fontWeight: 600,
              color: sel ? T.fern : T.ink3,
            }}>
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
