import React, { useState, useEffect, useRef } from 'react';
import { T } from '../tokens';
import { Button, Icon } from './index';
import { PlantIconComposer } from './PlantIconComposer';
import type { Plant, IconRecipe } from '../types/plant';
import type { Area } from '../types/area';
import { searchPlantbook, getPlantbookDetail, luxToLabel, suggestEvery, suggestIconFromSpecies } from '../api/plantbook';
import type { PlantSearchResult, PlantProfile } from '../api/plantbook';
import { identifyPlant } from '../api/identify';
import { useUnits, formatTempRange } from '../units';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (plant: Omit<Plant, 'id'>) => Promise<void>;
  areas: Area[];
}

export function AddPlantModal({ isOpen, onClose, onAdd, areas }: AddPlantModalProps) {
  const units = useUnits();
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [note, setNote] = useState('');
  const [every, setEvery] = useState(7);
  const [overrideEvery, setOverrideEvery] = useState(false);
  const [fertilizeEvery, setFertilizeEvery] = useState<number | null>(null);
  const [pruneEvery, setPruneEvery] = useState<number | null>(null);

  const [speciesQuery, setSpeciesQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlantSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<PlantProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [icon, setIcon] = useState<IconRecipe | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [identifying, setIdentifying] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const justSelectedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    if (speciesQuery.length < 3) return;
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchPlantbook(speciesQuery);
        setSearchResults(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [speciesQuery]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelectSpecies = async (result: PlantSearchResult) => {
    justSelectedRef.current = true;
    setSpeciesQuery(result.display_name);
    setShowDropdown(false);
    setSelectedProfile(null);
    setProfileLoading(true);
    try {
      const profile = await getPlantbookDetail(result.pid);
      setSelectedProfile(profile);
      if (!overrideEvery) setEvery(suggestEvery(profile.min_soil_moist));
      const suggestion = suggestIconFromSpecies(result.display_name, result.alias ?? '');
      if (suggestion.base || suggestion.bloom) {
        setIcon(prev => ({
          base: suggestion.base ?? (prev?.base ?? 'fenestrated-tropical'),
          variegation: prev?.variegation,
          bloom: suggestion.bloom ?? prev?.bloom,
          palette: prev?.palette,
        }));
      }
    } catch {
      // Profile fetch failed — fall back to manual entry
    } finally {
      setProfileLoading(false);
    }
  };

  const handleClearSpecies = () => {
    setSpeciesQuery('');
    setSelectedProfile(null);
    setSearchResults([]);
    setShowDropdown(false);
    setEvery(7);
    setOverrideEvery(false);
  };

  const handleIdentifyFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setIdentifying(true);
    setError(null);
    try {
      const result = await identifyPlant(file);
      if (!result.scientific_name) {
        setError('Could not identify a plant in that photo. Try a clearer shot.');
        return;
      }
      if (result.profile) {
        setSelectedProfile(result.profile);
        setSpeciesQuery(result.profile.display_name);
        justSelectedRef.current = true;
        if (!overrideEvery) setEvery(suggestEvery(result.profile.min_soil_moist));
        const suggestion = suggestIconFromSpecies(result.profile.display_name, result.profile.alias ?? '');
        if (suggestion.base || suggestion.bloom) {
          setIcon(prev => ({
            base: suggestion.base ?? (prev?.base ?? 'fenestrated-tropical'),
            variegation: prev?.variegation,
            bloom: suggestion.bloom ?? prev?.bloom,
            palette: prev?.palette,
          }));
        }
      } else {
        setSpeciesQuery(result.common_name || result.scientific_name);
        justSelectedRef.current = true;
      }
    } catch {
      setError('Identification failed. Check your connection and try again.');
    } finally {
      setIdentifying(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter a plant name.'); return; }
    setError(null);
    setLoading(true);
    try {
      await onAdd({
        name: name.trim(),
        species: selectedProfile ? selectedProfile.display_name : speciesQuery.trim(),
        icon: icon,
        room: room.trim() || (areas[0] ? areas[0].name : ''),
        every: Number(every) || 7,
        light: selectedProfile ? (luxToLabel(selectedProfile.min_light_lux, selectedProfile.max_light_lux) || '') : '',
        note: note.trim(),
        moisture: 100,
        status: 'watered',
        growth: [],
        lastWater: new Date().toISOString(),
        plantbookPid: selectedProfile?.pid,
        minLightLux: selectedProfile?.min_light_lux,
        maxLightLux: selectedProfile?.max_light_lux,
        minTemp: selectedProfile?.min_temp,
        maxTemp: selectedProfile?.max_temp,
        minEnvHumid: selectedProfile?.min_env_humid,
        maxEnvHumid: selectedProfile?.max_env_humid,
        fertilizeEvery,
        lastFertilize: fertilizeEvery ? new Date().toISOString() : '',
        pruneEvery,
        lastPrune: pruneEvery ? new Date().toISOString() : '',
      });
      setName(''); setRoom(''); setNote(''); setEvery(7);
      setSpeciesQuery(''); setSelectedProfile(null); setOverrideEvery(false); setIcon(undefined);
      setFertilizeEvery(null); setPruneEvery(null);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add plant.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: T.sans, fontSize: 13.5,
    fontWeight: 600, color: T.ink2, marginBottom: 6,
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', fontFamily: T.sans, fontSize: 15, padding: '12px 16px',
    borderRadius: 12, border: `1.5px solid ${T.stone300}`, background: T.card,
    color: T.ink, boxSizing: 'border-box', outline: 'none',
    transition: 'border-color .18s cubic-bezier(.22,.61,.36,1)',
  };

  const lightLabel = selectedProfile ? luxToLabel(selectedProfile.min_light_lux, selectedProfile.max_light_lux) : '';

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(30, 42, 34, 0.4)', backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 20,
        animation: 'fadeIn .18s cubic-bezier(.22,.61,.36,1)',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 480, background: T.paper, borderRadius: 20,
        boxShadow: '0 20px 40px rgba(23, 61, 44, 0.15)', display: 'flex',
        flexDirection: 'column', maxHeight: '90vh',
        animation: 'slideUp .18s cubic-bezier(.22,.61,.36,1)', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 16px', borderBottom: `1px solid ${T.stone100}` }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 22, color: T.ink, letterSpacing: '-0.02em' }}>Add a new plant</h2>
            <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3, marginTop: 2 }}>Search for a species to auto-fill care details</div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: '50%', background: T.stone100, border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'background .14s' }}
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

            {/* Species search */}
            <div ref={searchRef} style={{ position: 'relative' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleIdentifyFile}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Species</label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={identifying}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'none', border: `1px solid ${T.stone200}`,
                    borderRadius: 999, padding: '4px 10px', cursor: 'pointer',
                    fontFamily: T.sans, fontSize: 12, fontWeight: 600, color: T.ink2,
                    transition: 'all .18s cubic-bezier(.22,.61,.36,1)',
                    opacity: identifying ? 0.6 : 1,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.linen; e.currentTarget.style.borderColor = T.fern; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = T.stone200; }}
                >
                  {identifying
                    ? <div style={{ width: 12, height: 12, border: `2px solid ${T.stone300}`, borderTopColor: T.fern, borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
                    : <Icon name="camera" size={13} color={T.ink3} />
                  }
                  {identifying ? 'Identifying…' : 'Identify from photo'}
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={speciesQuery}
                  onChange={e => {
                const q = e.target.value;
                setSpeciesQuery(q);
                if (selectedProfile) setSelectedProfile(null);
                if (q.length < 3) { setSearchResults([]); setShowDropdown(false); }
              }}
                  placeholder="Search e.g. Monstera deliciosa…"
                  style={{ ...inputStyle, paddingRight: 40 }}
                  onFocus={e => { e.currentTarget.style.borderColor = T.fern; if (searchResults.length > 0) setShowDropdown(true); }}
                  onBlur={e => e.currentTarget.style.borderColor = T.stone300}
                  autoComplete="off"
                />
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: speciesQuery ? 'auto' : 'none' }}>
                  {searchLoading || profileLoading
                    ? <div style={{ width: 16, height: 16, border: `2px solid ${T.stone300}`, borderTopColor: T.fern, borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
                    : speciesQuery
                      ? <button type="button" onClick={handleClearSpecies} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'grid', placeItems: 'center' }}>
                          <Icon name="x" size={15} color={T.ink3} />
                        </button>
                      : <Icon name="search" size={15} color={T.ink3} />
                  }
                </div>
              </div>

              {showDropdown && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                  background: T.paper, border: `1.5px solid ${T.stone200}`,
                  borderRadius: 12, boxShadow: '0 8px 24px rgba(23,61,44,0.12)',
                  overflow: 'hidden', marginTop: 4,
                }}>
                  {searchResults.map(r => (
                    <button
                      key={r.pid}
                      type="button"
                      onClick={() => handleSelectSpecies(r)}
                      style={{
                        width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                        cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 1,
                        transition: 'background .12s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = T.linen}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.ink }}>{r.display_name}</span>
                      {r.alias && <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>{r.alias}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Care preview */}
            {selectedProfile && (
              <div style={{ background: T.linen, borderRadius: 14, padding: '14px 16px', border: `1px solid ${T.stone200}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.fern, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                  Care guide · PlantBook
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <CareChip label="Water every" value={`~${every} days`} />
                  {lightLabel && <CareChip label="Light" value={lightLabel} />}
                  {selectedProfile.min_temp != null && selectedProfile.max_temp != null && (
                    <CareChip label="Temperature" value={formatTempRange(selectedProfile.min_temp, selectedProfile.max_temp, units)} />
                  )}
                  {selectedProfile.min_env_humid != null && selectedProfile.max_env_humid != null && (
                    <CareChip label="Humidity" value={`${selectedProfile.min_env_humid}–${selectedProfile.max_env_humid}%`} />
                  )}
                </div>
                {!overrideEvery
                  ? <button type="button" onClick={() => setOverrideEvery(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: T.sans, fontSize: 12, color: T.ink3, padding: 0, textAlign: 'left', textDecoration: 'underline' }}>
                      Adjust watering schedule
                    </button>
                  : <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2, whiteSpace: 'nowrap' }}>Water every</span>
                      <input type="number" value={every} onChange={e => setEvery(Number(e.target.value))} min={1}
                        style={{ ...inputStyle, width: 72, padding: '8px 10px', fontSize: 14 }} />
                      <span style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2 }}>days</span>
                    </div>
                }
              </div>
            )}

            {/* Nickname */}
            <div>
              <label style={labelStyle}>Nickname</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. My big leafy friend"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = T.fern}
                onBlur={e => e.currentTarget.style.borderColor = T.stone300}
              />
            </div>

            <div>
              <label style={labelStyle}>Icon</label>
              <PlantIconComposer value={icon} onChange={setIcon} plantName={name || undefined} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Fertilize schedule</label>
                <select
                  value={fertilizeEvery ?? ''}
                  onChange={e => setFertilizeEvery(e.target.value ? Number(e.target.value) : null)}
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = T.fern}
                  onBlur={e => e.currentTarget.style.borderColor = T.stone300}
                >
                  <option value="">No schedule</option>
                  <option value="14">Every 14 days (2 weeks)</option>
                  <option value="30">Every 30 days (1 month)</option>
                  <option value="60">Every 60 days (2 months)</option>
                  <option value="90">Every 90 days (Quarterly)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Prune schedule</label>
                <select
                  value={pruneEvery ?? ''}
                  onChange={e => setPruneEvery(e.target.value ? Number(e.target.value) : null)}
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = T.fern}
                  onBlur={e => e.currentTarget.style.borderColor = T.stone300}
                >
                  <option value="">No schedule</option>
                  <option value="30">Every 30 days (1 month)</option>
                  <option value="90">Every 90 days (Quarterly)</option>
                  <option value="180">Every 180 days (6 months)</option>
                  <option value="365">Every 365 days (Yearly)</option>
                </select>
              </div>
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
                {areas.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                {areas.length === 0 && <option value="">No locations available</option>}
              </select>
            </div>
            {!selectedProfile && (
              <div>
                <label style={labelStyle}>Water every (days)</label>
                <input
                  type="number"
                  value={every}
                  onChange={e => setEvery(Number(e.target.value))}
                  placeholder="7"
                  min={1}
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = T.fern}
                  onBlur={e => e.currentTarget.style.borderColor = T.stone300}
                />
              </div>
            )}

            <div>
              <label style={labelStyle}>Notes</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Anything to remember about this plant…"
                rows={2}
                style={{ ...inputStyle, height: 'auto', resize: 'vertical' }}
                onFocus={e => e.currentTarget.style.borderColor = T.fern}
                onBlur={e => e.currentTarget.style.borderColor = T.stone300}
              />
            </div>
          </div>

          <div style={{ padding: '16px 24px 24px', background: T.card, borderTop: `1px solid ${T.stone100}`, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Plant'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CareChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: T.card, borderRadius: 10, padding: '8px 10px' }}>
      <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</span>
      <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.ink }}>{value}</span>
    </div>
  );
}
