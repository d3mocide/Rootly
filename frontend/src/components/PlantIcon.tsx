import React from 'react';
import type { IconRecipe, VarPattern } from '../types/plant';
import { BLOOM_COLORS } from './bloomTokens';
import { PLANT_BASES } from './plant-bases';
import { PLANT_HEADS, HEAD_ASSEMBLY, HEAD_STEM, DEFAULT_BLOOM_STEM } from './plant-heads';

function buildCssVars(recipe: IconRecipe): React.CSSProperties {
  const vars: Record<string, string> = {};
  const p = recipe.palette;
  if (p) {
    if (p.leaf1)   vars['--leaf-1']    = p.leaf1;
    if (p.leaf2)   vars['--leaf-2']    = p.leaf2;
    if (p.leaf3)   vars['--leaf-3']    = p.leaf3;
    if (p.stem)    vars['--stem']      = p.stem;
    if (p.vein)    vars['--vein']      = p.vein;
    if (p.potBody) vars['--pot-body']  = p.potBody;
    if (p.potRim)  vars['--pot-rim']   = p.potRim;
  }
  if (recipe.variegation) {
    vars['--variegation'] = recipe.variegation.color;
  }
  const bloom = recipe.bloom;
  if (bloom) {
    if ('dot' in bloom) {
      vars['--bloom'] = BLOOM_COLORS.amber;
    } else if ('head' in bloom) {
      vars['--bloom']        = BLOOM_COLORS[bloom.petal];
      vars['--bloom-center'] = bloom.center ? BLOOM_COLORS[bloom.center] : '#E8A23C';
      vars['--bloom-2']      = bloom.accent ? BLOOM_COLORS[bloom.accent] : '#C9852F';
    }
  }
  return vars as React.CSSProperties;
}

interface PlantIconProps {
  recipe?: IconRecipe;
  size?: number;
  label?: string;
  style?: React.CSSProperties;
}

export function PlantIcon({ recipe, size = 64, label, style }: PlantIconProps) {
  const base = recipe?.base ?? 'fenestrated-tropical';
  const Base = PLANT_BASES[base];
  const cssVars = recipe ? buildCssVars(recipe) : {};
  const varPattern: VarPattern | undefined = recipe?.variegation?.pattern;
  const bloom = recipe?.bloom ?? null;

  const dataVeg = varPattern;
  const dataBloom = (bloom && 'head' in bloom) ? 'head' : undefined;

  const potPaths = (
    <>
      <path className="pot-body" d="M19 45 H45 L42 60 Q41.6 62 39.5 62 H24.5 Q22.4 62 22 60 Z"/>
      <path className="pot-rim"  d="M17.5 43.5 H46.5 Q47.6 43.5 47.4 45 L47 47 Q46.8 48 45.5 48 H18.5 Q17.2 48 17 47 L16.6 45 Q16.4 43.5 17.5 43.5 Z"/>
    </>
  );

  let bloomStem: React.ReactNode = null;
  let bloomHead: React.ReactNode = null;

  if (bloom && 'head' in bloom) {
    const HeadComp = PLANT_HEADS[bloom.head];
    const asm = HEAD_ASSEMBLY[bloom.head];
    bloomStem = HEAD_STEM[bloom.head] ?? DEFAULT_BLOOM_STEM;
    bloomHead = asm
      ? <g transform={asm}><HeadComp /></g>
      : <HeadComp />;
  } else if (bloom && 'dot' in bloom) {
    bloomStem = DEFAULT_BLOOM_STEM;
    bloomHead = <circle className="bloom" cx="32" cy="22" r="5"/>;
  }

  // bloom stem sits behind pot; bloom head is rendered last (always on top)
  const pot = (
    <>
      {bloomStem}
      {potPaths}
    </>
  );

  return (
    <div
      className="ic"
      data-veg={dataVeg}
      data-bloom={dataBloom}
      style={{ width: size, height: size, flexShrink: 0, ...cssVars, ...style }}
      aria-label={label}
    >
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Base pot={pot} />
        {bloomHead}
      </svg>
    </div>
  );
}
