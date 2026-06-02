import React from 'react';
import { Icon } from './Icon';
import { PlantArt } from './PlantArt';
import type { Plant, PlantStatus } from '../types/plant';
import { STATUS_META } from '../types/plant';
import { T } from '../tokens';

// ---- Button -------------------------------------------------------
interface ButtonProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  onClick?: () => void;
  full?: boolean;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function Button({ children, variant = 'primary', size = 'md', icon, onClick, full, style = {}, type = 'button', disabled }: ButtonProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: T.sans, fontWeight: 600, border: '1.5px solid transparent',
    borderRadius: 999, cursor: 'pointer', lineHeight: 1,
    transition: 'all .18s cubic-bezier(.22,.61,.36,1)',
    width: full ? '100%' : undefined, whiteSpace: 'nowrap',
  };
  const sizes = {
    md: { fontSize: 16, padding: '13px 22px' },
    sm: { fontSize: 14, padding: '9px 15px' },
    lg: { fontSize: 17, padding: '16px 26px' },
  };
  const variants: Record<string, React.CSSProperties> = {
    primary:   { background: T.canopy, color: T.onDark },
    secondary: { background: T.card, color: T.ink, borderColor: T.stone300 },
    ghost:     { background: 'transparent', color: T.canopy },
    accent:    { background: T.sun, color: '#3a2c12' },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], opacity: disabled ? 0.6 : 1, ...style }}
      onMouseDown={e => (e.currentTarget.style.transform = 'scale(.97)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 17 : 19} stroke={2} />}
      {children}
    </button>
  );
}

// ---- Status pill --------------------------------------------------
export function StatusPill({ status, size = 'md' }: { status: PlantStatus; size?: 'sm' | 'md' }) {
  const s = STATUS_META[status];
  const sm = size === 'sm';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: T.sans,
      fontWeight: 600, fontSize: sm ? 12 : 13, borderRadius: 999,
      padding: sm ? '4px 9px' : '5px 11px', background: s.soft, color: s.text,
    }}>
      <span style={{ width: sm ? 6 : 7, height: sm ? 6 : 7, borderRadius: '50%', background: s.color }} />
      {s.label}
    </span>
  );
}

// ---- Moisture bar ------------------------------------------------
export function MoistureBar({ value, width = 90 }: { value: number; width?: number }) {
  const col = value <= 25 ? '#BC5B49' : value < 40 ? T.sunDeep : T.fern;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <div style={{ width, height: 7, borderRadius: 99, background: T.stone100, overflow: 'hidden' }}>
        <div style={{
          width: `${value}%`, height: '100%', borderRadius: 99, background: col,
          transition: 'width .5s cubic-bezier(.22,.61,.36,1)',
        }} />
      </div>
      <span style={{ fontFamily: T.mono, fontSize: 13, color: T.ink2, fontVariantNumeric: 'tabular-nums' }}>{value}%</span>
    </div>
  );
}

// ---- Moisture ring -----------------------------------------------
export function MoistureRing({ value, size = 132, stroke = 11 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const col = value <= 25 ? '#BC5B49' : value < 40 ? T.sunDeep : T.fern;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={T.sprout} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={col} strokeWidth={stroke} fill="none"
          strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - value / 100)}
          style={{ transition: 'stroke-dashoffset .7s cubic-bezier(.22,.61,.36,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: T.mono, fontSize: 30, fontWeight: 500, color: T.ink, letterSpacing: '-0.02em' }}>
          {value}<span style={{ fontSize: 17 }}>%</span>
        </span>
        <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, marginTop: 2 }}>moisture</span>
      </div>
    </div>
  );
}

// ---- Sparkline ---------------------------------------------------
export function Sparkline({ data, width = 300, height = 56, color = T.fern }: {
  data: number[]; width?: number; height?: number; color?: string;
}) {
  const max = Math.max(...data), min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((d, i) => [(i / (data.length - 1)) * width, height - 6 - ((d - min) / rng) * (height - 14)]);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${path} L${width} ${height} L0 ${height} Z`;
  const uid = `spark-${color.replace('#', '')}`;
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${uid})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="4" fill={color} />
    </svg>
  );
}

// ---- Plant card (grid) -------------------------------------------
export function PlantCard({ plant, onClick }: { plant: Plant; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: 'left', border: 'none', padding: 0, cursor: 'pointer',
        background: T.card, borderRadius: 20,
        boxShadow: '0 2px 6px rgba(30,42,34,.06), 0 1px 2px rgba(30,42,34,.04)',
        overflow: 'hidden', transition: 'transform .18s, box-shadow .18s', fontFamily: T.sans,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 22px rgba(30,42,34,.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(30,42,34,.06), 0 1px 2px rgba(30,42,34,.04)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      <div style={{ height: 96, background: `linear-gradient(150deg, ${T.sprout}, ${T.sproutDeep})`, display: 'grid', placeItems: 'center' }}>
        <PlantArt kind={plant.kind} size={66} />
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 17, color: T.ink, letterSpacing: '-0.02em' }}>{plant.name}</div>
        <div style={{ fontSize: 12, color: T.ink3, marginTop: 1 }}>{plant.room}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 11 }}>
          <span style={{ fontFamily: T.mono, fontSize: 13, color: T.ink2 }}>{plant.moisture}%</span>
          <StatusPill status={plant.status} size="sm" />
        </div>
      </div>
    </button>
  );
}

// ---- Plant list row ---------------------------------------------
interface PlantRowProps {
  plant: Plant;
  onClick: () => void;
  onWater?: (p: Plant) => void;
  last?: boolean;
}

export function PlantRow({ plant, onClick, onWater, last }: PlantRowProps) {
  const s = STATUS_META[plant.status];
  const due = plant.status === 'dry';
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 13, padding: '12px 16px',
        cursor: 'pointer', fontFamily: T.sans,
        borderBottom: last ? 'none' : `1px solid ${T.stone100}`,
      }}
    >
      <div style={{ width: 46, height: 46, borderRadius: '50%', background: T.sprout, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <PlantArt kind={plant.kind} size={36} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15.5, fontWeight: 600, color: T.ink }}>{plant.name}</div>
        <div style={{ fontSize: 12.5, color: s.text, marginTop: 1 }}>{plant.note}</div>
      </div>
      <span style={{ fontFamily: T.mono, fontSize: 13, color: T.ink2 }}>{plant.moisture}%</span>
      <button
        onClick={e => { e.stopPropagation(); onWater?.(plant); }}
        style={{
          width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
          flexShrink: 0, display: 'grid', placeItems: 'center',
          background: due ? T.sprout : T.linen,
        }}
      >
        {due
          ? <Icon name="droplet" size={17} color={T.canopy} stroke={2} />
          : <Icon name="chevronRight" size={17} color={T.ink3} stroke={2} />}
      </button>
    </div>
  );
}

// ---- Section header ---------------------------------------------
export function SectionHeader({ children, action }: { children: React.ReactNode; action?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 0 12px' }}>
      <h3 style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 19, color: T.ink, letterSpacing: '-0.02em' }}>{children}</h3>
      {action && <span style={{ fontFamily: T.sans, fontSize: 13.5, fontWeight: 600, color: T.fern }}>{action}</span>}
    </div>
  );
}

// ---- Card wrapper -----------------------------------------------
export function Card({ children, pad = 20 }: { children: React.ReactNode; pad?: number }) {
  return (
    <div style={{
      background: T.card, borderRadius: 18,
      boxShadow: '0 2px 6px rgba(30,42,34,.06)', overflow: 'hidden',
      padding: pad,
    }}>
      {children}
    </div>
  );
}

// ---- Toast -------------------------------------------------------
export function Toast({ message }: { message: string }) {
  return (
    <div style={{
      position: 'fixed', left: '50%', bottom: 90, transform: 'translateX(-50%)', zIndex: 80,
      display: 'flex', alignItems: 'center', gap: 9, background: T.moss, color: T.onDark,
      borderRadius: 999, padding: '12px 18px', boxShadow: '0 8px 24px rgba(23,61,44,.35)',
      fontFamily: T.sans, fontSize: 14.5, fontWeight: 600, whiteSpace: 'nowrap',
      animation: 'rtToast .3s cubic-bezier(.22,.61,.36,1)',
    }}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', background: T.fern, display: 'grid', placeItems: 'center' }}>
        <Icon name="check" size={14} color="#fff" stroke={2.4} />
      </span>
      {message}
    </div>
  );
}

// ---- Re-exports -------------------------------------------------
export { Icon, RootlyMark } from './Icon';
export { PlantArt } from './PlantArt';
