import React, { useState } from 'react';
import { T } from '../tokens';
import { Button, Icon } from './index';
import { PlantIconComposer } from './PlantIconComposer';
import type { Plant, IconRecipe } from '../types/plant';
import type { Area } from '../types/area';

interface EditPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  plant: Plant;
  onEdit: (id: string, updates: Partial<Plant>) => Promise<void>;
  areas: Area[];
}

export function EditPlantModal({ isOpen, onClose, plant, onEdit, areas }: EditPlantModalProps) {
  const [name, setName] = useState(plant.name);
  const [species, setSpecies] = useState(plant.species);
  const [icon, setIcon] = useState<IconRecipe | undefined>(plant.icon);
  const [room, setRoom] = useState(plant.room);
  const [every, setEvery] = useState(plant.every);
  const [light, setLight] = useState(plant.light);
  const [note, setNote] = useState(plant.note);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a plant name.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onEdit(plant.id, {
        name: name.trim(),
        species: species.trim(),
        icon,
        room: room.trim(),
        every: Number(every) || 7,
        light: light.trim(),
        note: note.trim(),
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update plant.');
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
          maxWidth: 480,
          background: T.paper,
          borderRadius: 20,
          boxShadow: '0 20px 40px rgba(23, 61, 44, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          animation: 'slideUp .18s cubic-bezier(.22,.61,.36,1)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 16px', borderBottom: `1px solid ${T.stone100}` }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 22, color: T.ink, letterSpacing: '-0.02em' }}>Edit plant details</h2>
            <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3, marginTop: 2 }}>Modify details for {plant.name}</div>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '60vh' }}>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F6E2DC', color: '#BC5B49', padding: '10px 14px', borderRadius: 10, fontFamily: T.sans, fontSize: 13.5, fontWeight: 600 }}>
                <Icon name="alertCircle" size={16} color="#BC5B49" />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Plant name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Monstera"
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = T.fern}
                  onBlur={e => e.currentTarget.style.borderColor = T.stone300}
                />
              </div>
              <div>
                <label style={labelStyle}>Species</label>
                <input
                  type="text"
                  value={species}
                  onChange={e => setSpecies(e.target.value)}
                  placeholder="e.g. deliciosa"
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = T.fern}
                  onBlur={e => e.currentTarget.style.borderColor = T.stone300}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Icon</label>
              <PlantIconComposer value={icon} onChange={setIcon} plantName={name || undefined} />
            </div>
            <div>
              <label style={labelStyle}>Room</label>
              <select
                value={room}
                onChange={e => setRoom(e.target.value)}
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = T.fern}
                onBlur={e => e.currentTarget.style.borderColor = T.stone300}
              >
                {areas.map(a => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
                {areas.length === 0 && <option value="">No locations available</option>}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Water every (days)</label>
                <input
                  type="number"
                  value={every}
                  onChange={e => setEvery(Number(e.target.value))}
                  placeholder="e.g. 7"
                  min={1}
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = T.fern}
                  onBlur={e => e.currentTarget.style.borderColor = T.stone300}
                />
              </div>
              <div>
                <label style={labelStyle}>Light level</label>
                <input
                  type="text"
                  value={light}
                  onChange={e => setLight(e.target.value)}
                  placeholder="e.g. Bright, indirect"
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = T.fern}
                  onBlur={e => e.currentTarget.style.borderColor = T.stone300}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Notes</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. Don't overwater in winter"
                rows={3}
                style={{ ...inputStyle, height: 'auto', resize: 'vertical' }}
                onFocus={e => e.currentTarget.style.borderColor = T.fern}
                onBlur={e => e.currentTarget.style.borderColor = T.stone300}
              />
            </div>
          </div>

          {/* Footer actions */}
          <div style={{ padding: '16px 24px 24px', background: T.card, borderTop: `1px solid ${T.stone100}`, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
