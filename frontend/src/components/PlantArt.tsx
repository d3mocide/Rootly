import React from 'react';
import type { IconRecipe } from '../types/plant';
import { PlantIcon } from './PlantIcon';

interface PlantArtProps {
  icon?: IconRecipe;
  size?: number;
  style?: React.CSSProperties;
}

export function PlantArt({ icon, size = 64, style }: PlantArtProps) {
  return <PlantIcon recipe={icon} size={size} style={style} />;
}
