import React, { useState } from 'react';
import { T } from '../tokens';
import { Button, Icon } from './index';
import type { Plant } from '../types/plant';

interface LogGrowthModalProps {
  isOpen: boolean;
  onClose: () => void;
  plant: Plant;
  onLog: (height: number) => Promise<void>;
}

export function LogGrowthModal({ isOpen, onClose, plant, onLog }: LogGrowthModalProps) {
  // Use the last growth value as a helpful default/starting point if available
  const lastGrowthValue = plant.growth && plant.growth.length > 0 
    ? plant.growth[plant.growth.length - 1] 
    : 10;
  
  const [height, setHeight] = useState<string>(String(lastGrowthValue));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(height);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid height measurement greater than 0.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onLog(num);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to log growth.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: T.sans,
    fontSize: 13.5,
    fontWeight: 600,
    color: T.ink2,
    marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    fontFamily: T.sans,
    fontSize: 15,
    padding: '12px 16px',
    borderRadius: 12,
    border: `1.5px solid ${T.stone300}`,
    background: T.card,
    color: T.ink,
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color .18s cubic-bezier(.22,.61,.36,1)',
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(30, 42, 34, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn .18s cubic-bezier(.22,.61,.36,1)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: T.paper,
          borderRadius: 20,
          boxShadow: '0 20px 40px rgba(23, 61, 44, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp .18s cubic-bezier(.22,.61,.36,1)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 16px', borderBottom: `1px solid ${T.stone100}` }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 20, color: T.ink, letterSpacing: '-0.02em' }}>Log plant growth</h2>
            <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3, marginTop: 2 }}>Record a height for {plant.name}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: T.stone100,
              border: 'none',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              transition: 'background .14s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = T.stone200}
            onMouseLeave={e => e.currentTarget.style.background = T.stone100}
          >
            <Icon name="x" size={18} color={T.ink2} stroke={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F6E2DC', color: '#BC5B49', padding: '10px 14px', borderRadius: 10, fontFamily: T.sans, fontSize: 13.5, fontWeight: 600 }}>
                <Icon name="alertCircle" size={16} color="#BC5B49" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label style={labelStyle}>Current height (cm)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  step="any"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  placeholder="e.g. 15"
                  autoFocus
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = T.fern}
                  onBlur={e => e.currentTarget.style.borderColor = T.stone300}
                />
                <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: T.sans, fontSize: 14.5, color: T.ink3, fontWeight: 600 }}>
                  cm
                </span>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div style={{ padding: '16px 24px 24px', background: T.card, borderTop: `1px solid ${T.stone100}`, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : 'Log Reading'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
