import { useState } from 'react';
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

interface PlantIconComposerProps {
  value: IconRecipe | undefined;
  onChange: (v: IconRecipe | undefined) => void;
}

type Section = 'base' | 'variegation' | 'bloom';

// Shared tile button style factory
function tileStyle(sel: boolean): React.CSSProperties {
  return {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 4, padding: '7px 4px 6px', borderRadius: 10, cursor: 'pointer',
    border: sel ? `2px solid ${T.fern}` : `1.5px solid ${T.stone200}`,
    background: sel ? T.linen : T.card,
    transition: 'all .14s',
  };
}

import type React from 'react';

export function PlantIconComposer({ value, onChange }: PlantIconComposerProps) {
  const [open, setOpen] = useState<Section>('base');

  const currentBase: BaseKey = value?.base ?? 'fenestrated-tropical';
  const currentVar = value?.variegation ?? null;
  const currentBloom = value?.bloom ?? null;

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
    const petal: BloomToken = (currentBloom && 'head' in currentBloom) ? currentBloom.petal : 'amber';
    onChange({ ...(value ?? { base: currentBase }), bloom: { head: h, petal } });
  };

  const setBloomPetal = (petal: BloomToken) => {
    if (!currentBloom || !('head' in currentBloom)) return;
    onChange({ ...(value ?? { base: currentBase }), bloom: { ...currentBloom, petal } });
  };

  const toggle = (s: Section) => setOpen(prev => prev === s ? 'base' : s);

  const currentBloomHead = (currentBloom && 'head' in currentBloom) ? currentBloom.head : null;
  const currentBloomPetal: BloomToken = (currentBloom && 'head' in currentBloom) ? currentBloom.petal : 'amber';

  // Build summary modifiers for the preview caption
  const modifiers: string[] = [];
  if (currentVar) modifiers.push(`${VAR_PATTERNS.find(p => p.value === currentVar.pattern)?.label} var.`);
  if (currentBloomHead) modifiers.push(`${HEAD_LABELS[currentBloomHead]} bloom`);

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

      {/* ── Live preview ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0 14px' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 16, flexShrink: 0,
          background: `linear-gradient(150deg, ${T.sprout}, ${T.sproutDeep})`,
          display: 'grid', placeItems: 'center',
        }}>
          <PlantIcon recipe={value ?? { base: currentBase }} size={62} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
          <span style={{ fontFamily: T.display, fontSize: 15, fontWeight: 700, color: T.ink, letterSpacing: '-0.01em' }}>
            {BASE_LABELS[currentBase]}
          </span>
          {modifiers.length > 0 ? (
            <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>
              {modifiers.join(' · ')}
            </span>
          ) : (
            <span style={{ fontFamily: T.sans, fontSize: 12, color: T.stone300, fontStyle: 'italic' }}>
              No variegation or bloom
            </span>
          )}
        </div>
      </div>

      {/* ── Base shape ── */}
      {sectionHeader('base', 'Base shape', BASE_LABELS[currentBase])}
      {open === 'base' && (
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
                style={{
                  ...tileStyle(sel),
                  aspectRatio: '1',
                  padding: 4,
                }}
                onMouseEnter={e => { if (!sel) e.currentTarget.style.background = T.linen; }}
                onMouseLeave={e => { if (!sel) e.currentTarget.style.background = T.card; }}
              >
                <PlantIcon recipe={{ base: b }} size={32} />
              </button>
            );
          })}
        </div>
      )}

      {/* ── Variegation ── */}
      {sectionHeader('variegation', 'Variegation', currentVar
        ? VAR_PATTERNS.find(p => p.value === currentVar.pattern)?.label
        : undefined)}
      {open === 'variegation' && (
        <div style={{ paddingBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 4 }}>
            {/* None */}
            <button
              type="button"
              onClick={() => setVarPattern(null)}
              style={tileStyle(!currentVar)}
              onMouseEnter={e => { if (currentVar) e.currentTarget.style.background = T.linen; }}
              onMouseLeave={e => { if (currentVar) e.currentTarget.style.background = T.card; }}
            >
              <span style={{ fontSize: 16, lineHeight: 1, color: T.ink3 }}>—</span>
              <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 600, color: !currentVar ? T.fern : T.ink3 }}>None</span>
            </button>
            {VAR_PATTERNS.map(p => {
              const sel = currentVar?.pattern === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setVarPattern(p.value)}
                  style={tileStyle(sel)}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.background = T.linen; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.background = T.card; }}
                >
                  <PlantIcon
                    recipe={{ base: currentBase, variegation: { pattern: p.value, color: currentVar?.color ?? '#F4ECDA' } }}
                    size={34}
                  />
                  <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 600, color: sel ? T.fern : T.ink3 }}>
                    {p.label}
                  </span>
                </button>
              );
            })}
          </div>

          {currentVar && (
            <div>
              <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.ink3, marginBottom: 8 }}>
                Marking colour
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
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
      )}

      {/* ── Bloom ── */}
      {sectionHeader('bloom', 'Bloom', currentBloomHead ? HEAD_LABELS[currentBloomHead] : undefined)}
      {open === 'bloom' && (
        <div style={{ paddingBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 4 }}>
            {/* None */}
            <button
              type="button"
              onClick={() => setBloomHead(null)}
              style={tileStyle(!currentBloomHead)}
              onMouseEnter={e => { if (currentBloomHead) e.currentTarget.style.background = T.linen; }}
              onMouseLeave={e => { if (currentBloomHead) e.currentTarget.style.background = T.card; }}
            >
              <span style={{ fontSize: 16, lineHeight: 1, color: T.ink3, marginBottom: 2 }}>—</span>
              <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 600, color: !currentBloomHead ? T.fern : T.ink3 }}>None</span>
            </button>
            {ALL_HEADS.map(h => {
              const sel = currentBloomHead === h;
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => setBloomHead(h)}
                  style={tileStyle(sel)}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.background = T.linen; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.background = T.card; }}
                >
                  <PlantIcon recipe={{ base: currentBase, bloom: { head: h, petal: currentBloomPetal } }} size={34} />
                  <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 600, color: sel ? T.fern : T.ink3 }}>
                    {HEAD_LABELS[h]}
                  </span>
                </button>
              );
            })}
          </div>

          {currentBloomHead && (
            <div>
              <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.ink3, marginBottom: 8 }}>
                Petal colour
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
      )}
    </div>
  );
}
