import React, { useState } from 'react';
import { T } from '../../tokens';
import { Icon } from '../../components';
import type { Plant } from '../../types/plant';
import type { Area } from '../../types/area';

interface Props {
  onClose: () => void;
  plant: Plant;
  onEdit: (id: string, updates: Partial<Plant>) => Promise<void>;
  areas: Area[];
}

export function EditPlantScreen({ onClose, plant, onEdit, areas }: Props) {
  const [name, setName] = useState(plant.name);
  const [species, setSpecies] = useState(plant.species);
  const [kind, setKind] = useState<Plant['kind']>(plant.kind);
  const [room, setRoom] = useState(plant.room);
  const [every, setEvery] = useState(plant.every);
  const [light, setLight] = useState(plant.light);
  const [note, setNote] = useState(plant.note);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
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
        kind,
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

  const labelStyle: React.CSSProperties = {
    fontFamily: T.sans,
    fontSize: 13,
    fontWeight: 600,
    color: T.ink2,
    display: 'block',
    marginBottom: 7,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: T.sans,
    fontSize: 15,
    color: T.ink,
    background: T.card,
    border: `1.5px solid ${T.stone200}`,
    borderRadius: 14,
    padding: '13px 14px',
    outline: 'none',
    transition: 'border-color .18s cubic-bezier(.22,.61,.36,1)',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: T.paper, zIndex: 60, display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '58px 18px 14px', borderBottom: `1px solid ${T.stone100}` }}>
        <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: '50%', background: T.linen, border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <Icon name="x" size={20} color={T.ink} />
        </button>
        <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 17, color: T.ink }}>Edit plant details</div>
        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            fontFamily: T.sans,
            fontSize: 15,
            fontWeight: 600,
            color: loading ? T.ink3 : T.fern,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {loading ? '...' : 'Save'}
        </button>
      </div>

      <form onSubmit={handleSave} style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F6E2DC', color: '#BC5B49', padding: '10px 14px', borderRadius: 10, fontFamily: T.sans, fontSize: 13.5, fontWeight: 600 }}>
            <Icon name="alertCircle" size={16} color="#BC5B49" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label style={labelStyle}>Plant name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Monstera"
            style={inputStyle}
            onFocus={e => e.currentTarget.style.borderColor = T.fern}
            onBlur={e => e.currentTarget.style.borderColor = T.stone200}
          />
        </div>

        <div>
          <label style={labelStyle}>Species</label>
          <input
            type="text"
            value={species}
            onChange={e => setSpecies(e.target.value)}
            placeholder="e.g. Monstera deliciosa"
            style={inputStyle}
            onFocus={e => e.currentTarget.style.borderColor = T.fern}
            onBlur={e => e.currentTarget.style.borderColor = T.stone200}
          />
        </div>

        <div>
          <label style={labelStyle}>Kind</label>
          <select
            value={kind}
            onChange={e => setKind(e.target.value as Plant['kind'])}
            style={inputStyle}
            onFocus={e => e.currentTarget.style.borderColor = T.fern}
            onBlur={e => e.currentTarget.style.borderColor = T.stone200}
          >
            <option value="monstera">Monstera</option>
            <option value="fig">Fiddle-leaf Fig</option>
            <option value="pothos">Pothos</option>
            <option value="snake">Snake Plant</option>
            <option value="succulent">Succulent</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Room</label>
          <select
            value={room}
            onChange={e => setRoom(e.target.value)}
            style={inputStyle}
            onFocus={e => e.currentTarget.style.borderColor = T.fern}
            onBlur={e => e.currentTarget.style.borderColor = T.stone200}
          >
            {areas.map(a => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
            {areas.length === 0 && <option value="">No locations available</option>}
          </select>
        </div>

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
            onBlur={e => e.currentTarget.style.borderColor = T.stone200}
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
            onBlur={e => e.currentTarget.style.borderColor = T.stone200}
          />
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
            onBlur={e => e.currentTarget.style.borderColor = T.stone200}
          />
        </div>
      </form>
    </div>
  );
}
