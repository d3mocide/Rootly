import React from 'react';
import { T, Icon } from '../../components';

interface TopbarProps {
  title: string;
  subtitle?: string;
  search?: boolean;
  children?: React.ReactNode;
}

export function Topbar({ title, subtitle, search = true, children }: TopbarProps) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: 'rgba(251,250,246,0.82)', backdropFilter: 'blur(14px) saturate(150%)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: `1px solid ${T.stone100}`, padding: '20px 40px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ minWidth: 0 }}>
        {subtitle && <div style={{ fontFamily: T.sans, fontSize: 13.5, fontWeight: 600, color: T.ink3, lineHeight: 1.3, whiteSpace: 'nowrap' }}>{subtitle}</div>}
        <h1 style={{ margin: '3px 0 0', fontFamily: T.display, fontWeight: 700, fontSize: 30, lineHeight: 1.1, letterSpacing: '-0.03em', color: T.ink }}>{title}</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {search && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9, background: T.card,
            border: `1.5px solid ${T.stone200}`, borderRadius: 12, padding: '9px 14px', width: 240,
          }}>
            <Icon name="search" size={18} color={T.ink3} />
            <span style={{ fontFamily: T.sans, fontSize: 14, color: T.ink3 }}>Search plants</span>
          </div>
        )}
        {children}
        <button style={{ width: 42, height: 42, borderRadius: '50%', background: T.card, border: `1px solid ${T.stone100}`, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <Icon name="bell" size={20} color={T.ink2} />
        </button>
      </div>
    </div>
  );
}
