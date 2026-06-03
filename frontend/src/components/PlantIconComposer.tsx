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

export function PlantIconComposer({ value, onChange }: PlantIconComposerProps) {
  const [open, setOpen] = useState<Section>('base');

  const currentBase: BaseKey = value?.base ?? 'fenestrated-tropical';
  const currentVar = value?.variegation ?? null;
  const currentBloom = value?.bloom ?? null;

  const setBase = (b: BaseKey) => {
    onChange({ ...(value ?? { base: b }), base: b });
  };

  const setVarPattern = (p: VarPattern | null) => {
    if (p === null) {
      const next = { ...(value ?? { base: currentBase }), variegation: null };
      onChange(next);
      return;
    }
    const color = currentVar?.color ?? VAR_COLORS[1];
    onChange({ ...(value ?? { base: currentBase }), variegation: { pattern: p, color } });
  };

  const setVarColor = (color: string) => {
    if (!currentVar) return;
    onChange({ ...(value ?? { base: currentBase }), variegation: { ...currentVar, color } });
  };

  const setBloomHead = (h: HeadKey | null) => {
    if (h === null) {
      onChange({ ...(value ?? { base: currentBase }), bloom: null });
      return;
    }
    const petal: BloomToken = (currentBloom && 'head' in currentBloom) ? currentBloom.petal : 'amber';
    onChange({ ...(value ?? { base: currentBase }), bloom: { head: h, petal } });
  };

  const setBloomPetal = (petal: BloomToken) => {
    if (!currentBloom || !('head' in currentBloom)) return;
    onChange({ ...(value ?? { base: currentBase }), bloom: { ...currentBloom, petal } });
  };

  const toggle = (s: Section) => setOpen(prev => prev === s ? 'base' : s);

  const sectionHeader = (s: Section, label: string, chip?: string) => (
    <button
      type="button"
      onClick={() => toggle(s)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'none', border: 'none', cursor: 'pointer', padding: '11px 0 9px',
        borderTop: `1px solid ${T.stone100}`,
      }}
    >
      <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.ink2, textTransform: 'uppercase', letterSpacing: '.06em' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        {chip && (
          <span style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 600, color: T.fern, background: T.linen, borderRadius: 999, padding: '3px 9px' }}>
            {chip}
          </span>
        )}
        <Icon name={open === s ? 'chevronUp' : 'chevronDown'} size={15} color={T.ink3} stroke={2} />
      </div>
    </button>
  );

  const currentBloomHead = (currentBloom && 'head' in currentBloom) ? currentBloom.head : null;
  const currentBloomPetal: BloomToken = (currentBloom && 'head' in currentBloom) ? currentBloom.petal : 'amber';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Live preview */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 14px' }}>
        <div style={{
          width: 96, height: 96, borderRadius: 18,
          background: `linear-gradient(150deg, ${T.sprout}, ${T.sproutDeep})`,
          display: 'grid', placeItems: 'center',
        }}>
          <PlantIcon recipe={value ?? { base: currentBase }} size={72} />
        </div>
      </div>

      {/* Base section */}
      {sectionHeader('base', 'Base shape', BASE_LABELS[currentBase])}
      {open === 'base' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, paddingBottom: 12 }}>
          {ALL_BASES.map(b => {
            const sel = b === currentBase;
            return (
              <button
                key={b}
                type="button"
                onClick={() => setBase(b)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '8px 4px 7px', borderRadius: 12,
                  border: sel ? `2px solid ${T.fern}` : `1.5px solid ${T.stone200}`,
                  background: sel ? T.linen : T.card,
                  cursor: 'pointer', transition: 'all .14s',
                }}
                onMouseEnter={e => { if (!sel) e.currentTarget.style.background = T.linen; }}
                onMouseLeave={e => { if (!sel) e.currentTarget.style.background = T.card; }}
              >
                <PlantIcon recipe={{ base: b }} size={38} />
                <span style={{ fontFamily: T.sans, fontSize: 9.5, fontWeight: 600, color: sel ? T.fern : T.ink3, textAlign: 'center', lineHeight: 1.2 }}>
                  {BASE_LABELS[b]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Variegation section */}
      {sectionHeader('variegation', 'Variegation', currentVar ? VAR_PATTERNS.find(p => p.value === currentVar.pattern)?.label : undefined)}
      {open === 'variegation' && (
        <div style={{ paddingBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            <button
              type="button"
              onClick={() => setVarPattern(null)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '8px 4px 7px', borderRadius: 12,
                border: !currentVar ? `2px solid ${T.fern}` : `1.5px solid ${T.stone200}`,
                background: !currentVar ? T.linen : T.card,
                cursor: 'pointer', transition: 'all .14s', gridColumn: 'span 1',
              }}
              onMouseEnter={e => { if (currentVar) e.currentTarget.style.background = T.linen; }}
              onMouseLeave={e => { if (currentVar) e.currentTarget.style.background = T.card; }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>—</span>
              <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 600, color: !currentVar ? T.fern : T.ink3 }}>None</span>
            </button>
            {VAR_PATTERNS.map(p => {
              const sel = currentVar?.pattern === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setVarPattern(p.value)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '8px 4px 7px', borderRadius: 12,
                    border: sel ? `2px solid ${T.fern}` : `1.5px solid ${T.stone200}`,
                    background: sel ? T.linen : T.card,
                    cursor: 'pointer', transition: 'all .14s',
                  }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.background = T.linen; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.background = T.card; }}
                >
                  <PlantIcon recipe={{ base: currentBase, variegation: { pattern: p.value, color: currentVar?.color ?? '#FFFFFF' } }} size={38} />
                  <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 600, color: sel ? T.fern : T.ink3 }}>{p.label}</span>
                </button>
              );
            })}
          </div>

          {currentVar && (
            <div>
              <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.ink3, marginBottom: 6 }}>Marking colour</div>
              <div style={{ display: 'flex', gap: 7 }}>
                {VAR_COLORS.map((col, i) => {
                  const sel = currentVar.color === col;
                  return (
                    <button
                      key={col}
                      type="button"
                      title={VAR_COLOR_LABELS[i]}
                      onClick={() => setVarColor(col)}
                      style={{
                        width: 30, height: 30, borderRadius: '50%', border: 'none', cursor: 'pointer',
                        background: col, flexShrink: 0,
                        boxShadow: sel
                          ? `0 0 0 2px ${T.fern}, 0 0 0 4px ${T.paper}`
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

      {/* Bloom section */}
      {sectionHeader('bloom', 'Bloom', currentBloomHead ? HEAD_LABELS[currentBloomHead] : undefined)}
      {open === 'bloom' && (
        <div style={{ paddingBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            <button
              type="button"
              onClick={() => setBloomHead(null)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '8px 4px 7px', borderRadius: 12,
                border: !currentBloomHead ? `2px solid ${T.fern}` : `1.5px solid ${T.stone200}`,
                background: !currentBloomHead ? T.linen : T.card,
                cursor: 'pointer', transition: 'all .14s',
              }}
              onMouseEnter={e => { if (currentBloomHead) e.currentTarget.style.background = T.linen; }}
              onMouseLeave={e => { if (currentBloomHead) e.currentTarget.style.background = T.card; }}
            >
              <span style={{ fontSize: 18, lineHeight: 1, marginBottom: 2 }}>—</span>
              <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 600, color: !currentBloomHead ? T.fern : T.ink3 }}>None</span>
            </button>
            {ALL_HEADS.map(h => {
              const sel = currentBloomHead === h;
              const recipe: IconRecipe = {
                base: currentBase,
                bloom: { head: h, petal: currentBloomPetal },
              };
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => setBloomHead(h)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '8px 4px 7px', borderRadius: 12,
                    border: sel ? `2px solid ${T.fern}` : `1.5px solid ${T.stone200}`,
                    background: sel ? T.linen : T.card,
                    cursor: 'pointer', transition: 'all .14s',
                  }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.background = T.linen; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.background = T.card; }}
                >
                  <PlantIcon recipe={recipe} size={38} />
                  <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 600, color: sel ? T.fern : T.ink3 }}>
                    {HEAD_LABELS[h]}
                  </span>
                </button>
              );
            })}
          </div>

          {currentBloomHead && (
            <div>
              <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.ink3, marginBottom: 6 }}>Petal colour</div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {ALL_BLOOM_TOKENS.map(token => {
                  const sel = currentBloomPetal === token;
                  const col = BLOOM_COLORS[token];
                  return (
                    <button
                      key={token}
                      type="button"
                      title={BLOOM_TOKEN_LABELS[token]}
                      onClick={() => setBloomPetal(token)}
                      style={{
                        width: 30, height: 30, borderRadius: '50%', border: 'none', cursor: 'pointer',
                        background: col, flexShrink: 0,
                        boxShadow: sel
                          ? `0 0 0 2px ${T.fern}, 0 0 0 4px ${T.paper}`
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
