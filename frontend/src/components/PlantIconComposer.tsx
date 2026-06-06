import { useState } from 'react';
import type React from 'react';
import { T } from '../tokens';
import { Icon } from './Icon';
import { PlantIcon } from './PlantIcon';
import { BLOOM_COLORS } from './bloomTokens';
import { BASE_LABELS } from './plant-bases';
import { HEAD_LABELS } from './plant-heads';
import type { IconRecipe, BaseKey, HeadKey, BloomToken, VarPattern } from '../types/plant';

const ALL_BASES: BaseKey[] = [
  'fenestrated-tropical', 'single-trunk-tree', 'upright-sword', 'trailing-vine',
  'rosette-succulent', 'strappy-arching', 'palm-frond', 'feathery-fern',
  'cactus', 'big-paddle', 'patterned-broadleaf', 'paddle-succulent',
  'cactus-pad', 'beaded-strand',
];

const ALL_HEADS: HeadKey[] = [
  'daisy', 'iris', 'orchid', 'lily', 'cluster', 'spike', 'poppy', 'rose', 'tulip', 'bell',
];

const ALL_BLOOM_TOKENS: BloomToken[] = [
  'amber', 'coral', 'rose', 'magenta', 'lilac', 'sky', 'cream',
];

const BLOOM_TOKEN_LABELS: Record<BloomToken, string> = {
  amber: 'Amber', coral: 'Coral', rose: 'Rose',
  magenta: 'Magenta', lilac: 'Lilac', sky: 'Sky', cream: 'Cream',
};

const VAR_PATTERNS: { value: VarPattern; label: string }[] = [
  { value: 'speckle', label: 'Speckle' },
  { value: 'marble',  label: 'Marble'  },
  { value: 'margin',  label: 'Margin'  },
  { value: 'center',  label: 'Center'  },
];

const VAR_COLORS = ['#FFFFFF', '#F4ECDA', '#E5D888', '#F0CDB8', '#C2DA9E'];
const VAR_COLOR_LABELS = ['White', 'Cream', 'Gold', 'Blush', 'Lime'];

// Fixed preview petal for the shape grid — contrasts with the terra-cotta pot
const BLOOM_SHAPE_PREVIEW: BloomToken = 'rose';

// Leaf palette presets — swatch is the mid-tone leaf2 color
const PALETTE_PRESETS: { label: string; swatch: string; value: IconRecipe['palette'] }[] = [
  { label: 'Default', swatch: '#3A7D55', value: undefined },
  { label: 'Forest',  swatch: '#1E5C38', value: { leaf1: '#1A4D30', leaf2: '#1E5C38', leaf3: '#2E7A4E', stem: '#1E5C38', vein: '#C8E0CE' } },
  { label: 'Sage',    swatch: '#7A9B80', value: { leaf1: '#5C7A62', leaf2: '#7A9B80', leaf3: '#9EBD9F', stem: '#7A9B80', vein: '#E5F0E6' } },
  { label: 'Teal',    swatch: '#2A7D8A', value: { leaf1: '#1A5C6A', leaf2: '#2A7D8A', leaf3: '#4AA0AA', stem: '#2A7D8A', vein: '#D4EFF4', potBody: '#5A7E8A', potRim: '#4A6E7A' } },
  { label: 'Olive',   swatch: '#7A8C3A', value: { leaf1: '#5A6B2A', leaf2: '#7A8C3A', leaf3: '#9EAD5A', stem: '#7A8C3A', vein: '#EAF0C0', potBody: '#9E8A5A', potRim: '#8A7A4A' } },
  { label: 'Noir',    swatch: '#252D28', value: { leaf1: '#1A1F1C', leaf2: '#252D28', leaf3: '#354038', stem: '#252D28', vein: '#C0D4C4', potBody: '#3A3530', potRim: '#2A2520' } },
];

interface PlantIconComposerProps {
  value: IconRecipe | undefined;
  onChange: (v: IconRecipe | undefined) => void;
  plantName?: string;
}

type Section = 'base' | 'variegation' | 'bloom' | 'palette';

function tileStyle(sel: boolean): React.CSSProperties {
  return {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 4, padding: '7px 4px 6px', borderRadius: 10, cursor: 'pointer',
    border: sel ? `2px solid ${T.fern}` : `1.5px solid ${T.stone200}`,
    background: sel ? T.linen : T.card,
    transition: 'all .14s',
  };
}

function animWrap(open: boolean): React.CSSProperties {
  return {
    overflow: 'hidden',
    maxHeight: open ? '800px' : '0',
    transition: `max-height ${open ? '.3s' : '.2s'} cubic-bezier(.22,.61,.36,1)`,
  };
}

export function PlantIconComposer({ value, onChange, plantName }: PlantIconComposerProps) {
  const [open, setOpen] = useState<Section>('base');

  const currentBase: BaseKey = value?.base ?? 'fenestrated-tropical';
  const currentVar = value?.variegation ?? null;
  const currentBloom = value?.bloom ?? null;
  const currentPalette = value?.palette;

  const currentBloomHead = (currentBloom && 'head' in currentBloom) ? currentBloom.head : null;
  const currentBloomPetal: BloomToken = (currentBloom && 'head' in currentBloom) ? currentBloom.petal : 'amber';

  const currentPaletteLabel = (() => {
    if (!currentPalette) return 'Default';
    const match = PALETTE_PRESETS.find(p => p.value && p.value.leaf2 === currentPalette.leaf2);
    return match?.label ?? 'Custom';
  })();

  const setBase = (b: BaseKey) =>
    onChange({ ...(value ?? { base: b }), base: b });

  const setVarPattern = (p: VarPattern | null) => {
    if (p === null) { onChange({ ...(value ?? { base: currentBase }), variegation: null }); return; }
    const color = currentVar?.color ?? VAR_COLORS[1];
    onChange({ ...(value ?? { base: currentBase }), variegation: { pattern: p, color } });
  };

  const setVarColor = (color: string) => {
    if (!currentVar) return;
    onChange({ ...(value ?? { base: currentBase }), variegation: { ...currentVar, color } });
  };

  const setBloomHead = (h: HeadKey | null) => {
    if (h === null) { onChange({ ...(value ?? { base: currentBase }), bloom: null }); return; }
    const petal: BloomToken = currentBloomPetal;
    onChange({ ...(value ?? { base: currentBase }), bloom: { head: h, petal } });
  };

  const setBloomPetal = (petal: BloomToken) => {
    if (!currentBloom || !('head' in currentBloom)) return;
    onChange({ ...(value ?? { base: currentBase }), bloom: { ...currentBloom, petal } });
  };

  const setPalette = (preset: typeof PALETTE_PRESETS[number]) => {
    const next = { ...(value ?? { base: currentBase }) };
    if (preset.value === undefined) {
      delete next.palette;
    } else {
      next.palette = preset.value;
    }
    onChange(next);
  };

  const randomize = () => {
    const base = ALL_BASES[Math.floor(Math.random() * ALL_BASES.length)];
    const addVar = Math.random() < 0.4;
    const addBloom = Math.random() < 0.45;
    const variegation = addVar ? {
      pattern: VAR_PATTERNS[Math.floor(Math.random() * VAR_PATTERNS.length)].value,
      color: VAR_COLORS[Math.floor(Math.random() * VAR_COLORS.length)],
    } : null;
    const bloom = addBloom ? {
      head: ALL_HEADS[Math.floor(Math.random() * ALL_HEADS.length)],
      petal: ALL_BLOOM_TOKENS[Math.floor(Math.random() * ALL_BLOOM_TOKENS.length)],
    } : null;
    onChange({ base, variegation, bloom });
  };

  const toggle = (s: Section) => setOpen(prev => prev === s ? 'base' : s);

  // Summary modifiers for preview caption
  const modifiers: string[] = [];
  if (currentVar) modifiers.push(`${VAR_PATTERNS.find(p => p.value === currentVar.pattern)?.label} var.`);
  if (currentBloomHead) modifiers.push(`${HEAD_LABELS[currentBloomHead]} bloom`);
  if (currentPaletteLabel !== 'Default') modifiers.push(`${currentPaletteLabel} palette`);

  const sectionHeader = (s: Section, label: string, chip?: string) => (
    <button
      type="button"
      onClick={() => toggle(s)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0 8px',
        borderTop: `1px solid ${T.stone100}`,
      }}
    >
      <span style={{
        fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.ink3,
        textTransform: 'uppercase', letterSpacing: '.07em',
      }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {chip && (
          <span style={{
            fontFamily: T.sans, fontSize: 11.5, fontWeight: 600, color: T.fern,
            background: T.linen, borderRadius: 999, padding: '3px 9px',
            maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {chip}
          </span>
        )}
        <Icon name={open === s ? 'chevronUp' : 'chevronDown'} size={14} color={T.ink3} stroke={2} />
      </div>
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── Mini card preview + Randomize ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px 10px',
        background: T.card, borderRadius: 16, border: `1.5px solid ${T.stone100}`,
        marginBottom: 6,
      }}>
        <div style={{
          width: 62, height: 62, borderRadius: 13, flexShrink: 0,
          background: `linear-gradient(150deg, ${T.sprout}, ${T.sproutDeep})`,
          display: 'grid', placeItems: 'center',
        }}>
          <PlantIcon recipe={value ?? { base: currentBase }} size={48} />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontFamily: T.display, fontSize: 14, fontWeight: 700, color: T.ink, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            {plantName || 'My Plant'}
          </span>
          <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink2, fontWeight: 500 }}>
            {BASE_LABELS[currentBase]}
          </span>
          {modifiers.length > 0 && (
            <span style={{ fontFamily: T.sans, fontSize: 11, color: T.fern, fontWeight: 600, marginTop: 1 }}>
              {modifiers.join(' · ')}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={randomize}
          title="Randomize icon"
          style={{
            width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${T.stone200}`,
            background: T.paper, cursor: 'pointer', display: 'grid', placeItems: 'center',
            flexShrink: 0, transition: 'all .14s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = T.linen; e.currentTarget.style.borderColor = T.fern; }}
          onMouseLeave={e => { e.currentTarget.style.background = T.paper; e.currentTarget.style.borderColor = T.stone200; }}
        >
          <Icon name="shuffle" size={15} color={T.ink3} stroke={2} />
        </button>
      </div>

      {/* ── Base shape ── */}
      {sectionHeader('base', 'Base shape', BASE_LABELS[currentBase])}
      <div style={animWrap(open === 'base')}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: 4, paddingBottom: 12,
        }}>
          {ALL_BASES.map(b => {
            const sel = b === currentBase;
            return (
              <button
                key={b}
                type="button"
                title={BASE_LABELS[b]}
                onClick={() => setBase(b)}
                style={{ ...tileStyle(sel), aspectRatio: '1', padding: 4 }}
                onMouseEnter={e => { if (!sel) e.currentTarget.style.background = T.linen; }}
                onMouseLeave={e => { if (!sel) e.currentTarget.style.background = T.card; }}
              >
                <PlantIcon recipe={{ base: b }} size={32} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Variegation ── */}
      {sectionHeader('variegation', 'Variegation', currentVar
        ? VAR_PATTERNS.find(p => p.value === currentVar.pattern)?.label
        : undefined)}
      <div style={animWrap(open === 'variegation')}>
        <div style={{ paddingBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 4 }}>
            <button
              type="button"
              title="None"
              onClick={() => setVarPattern(null)}
              style={{ ...tileStyle(!currentVar), aspectRatio: '1', padding: 4 }}
              onMouseEnter={e => { if (currentVar) e.currentTarget.style.background = T.linen; }}
              onMouseLeave={e => { if (currentVar) e.currentTarget.style.background = T.card; }}
            >
              <span style={{ fontSize: 16, lineHeight: 1, color: T.ink3 }}>—</span>
            </button>
            {VAR_PATTERNS.map(p => {
              const sel = currentVar?.pattern === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  title={p.label}
                  onClick={() => setVarPattern(p.value)}
                  style={{ ...tileStyle(sel), aspectRatio: '1', padding: 4 }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.background = T.linen; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.background = T.card; }}
                >
                  <PlantIcon
                    recipe={{ base: currentBase, variegation: { pattern: p.value, color: currentVar?.color ?? '#F4ECDA' } }}
                    size={32}
                  />
                </button>
              );
            })}
          </div>

          {currentVar && (
            <div>
              <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.ink3, marginBottom: 8 }}>
                Marking colour
              </div>
              <div style={{ display: 'flex', gap: 8, padding: '4px 2px' }}>
                {VAR_COLORS.map((col, i) => {
                  const sel = currentVar.color === col;
                  return (
                    <button
                      key={col}
                      type="button"
                      title={VAR_COLOR_LABELS[i]}
                      onClick={() => setVarColor(col)}
                      style={{
                        width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
                        background: col, flexShrink: 0,
                        boxShadow: sel
                          ? `0 0 0 2.5px ${T.fern}, 0 0 0 4.5px ${T.paper}`
                          : `0 0 0 1.5px ${T.stone200}`,
                        transition: 'box-shadow .14s',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bloom ── */}
      {sectionHeader('bloom', 'Bloom', currentBloomHead ? HEAD_LABELS[currentBloomHead] : undefined)}
      <div style={animWrap(open === 'bloom')}>
        <div style={{ paddingBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 4 }}>
            <button
              type="button"
              title="None"
              onClick={() => setBloomHead(null)}
              style={{ ...tileStyle(!currentBloomHead), aspectRatio: '1', padding: 2 }}
              onMouseEnter={e => { if (currentBloomHead) e.currentTarget.style.background = T.linen; }}
              onMouseLeave={e => { if (currentBloomHead) e.currentTarget.style.background = T.card; }}
            >
              <span style={{ fontSize: 14, lineHeight: 1, color: T.ink3 }}>—</span>
            </button>
            {ALL_HEADS.map(h => {
              const sel = currentBloomHead === h;
              return (
                <button
                  key={h}
                  type="button"
                  title={HEAD_LABELS[h]}
                  onClick={() => setBloomHead(h)}
                  style={{ ...tileStyle(sel), aspectRatio: '1', padding: 2 }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.background = T.linen; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.background = T.card; }}
                >
                  <PlantIcon recipe={{ base: currentBase, bloom: { head: h, petal: BLOOM_SHAPE_PREVIEW } }} size={24} />
                </button>
              );
            })}
          </div>

          {currentBloomHead && (
            <div>
              <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.ink3, marginBottom: 8 }}>
                Petal colour
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '4px 2px' }}>
                {ALL_BLOOM_TOKENS.map(token => {
                  const sel = currentBloomPetal === token;
                  return (
                    <button
                      key={token}
                      type="button"
                      title={BLOOM_TOKEN_LABELS[token]}
                      onClick={() => setBloomPetal(token)}
                      style={{
                        width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
                        background: BLOOM_COLORS[token], flexShrink: 0,
                        boxShadow: sel
                          ? `0 0 0 2.5px ${T.fern}, 0 0 0 4.5px ${T.paper}`
                          : `0 0 0 1.5px ${T.stone200}`,
                        transition: 'box-shadow .14s',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Leaf palette ── */}
      {sectionHeader('palette', 'Leaf palette', currentPaletteLabel !== 'Default' ? currentPaletteLabel : undefined)}
      <div style={animWrap(open === 'palette')}>
        <div style={{ paddingBottom: 14 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: '4px 2px' }}>
            {PALETTE_PRESETS.map(preset => {
              const sel = currentPaletteLabel === preset.label;
              return (
                <button
                  key={preset.label}
                  type="button"
                  title={preset.label}
                  onClick={() => setPalette(preset)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: preset.swatch,
                    boxShadow: sel
                      ? `0 0 0 2.5px ${T.fern}, 0 0 0 4.5px ${T.paper}`
                      : `0 0 0 1.5px ${T.stone200}`,
                    transition: 'box-shadow .14s',
                  }} />
                  <span style={{
                    fontFamily: T.sans, fontSize: 10, fontWeight: 600,
                    color: sel ? T.fern : T.ink3,
                  }}>
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
