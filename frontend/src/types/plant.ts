export type PlantStatus = 'dry' | 'soon' | 'thriving' | 'watered' | 'resting';

export type BaseKey =
  | 'fenestrated-tropical'
  | 'single-trunk-tree'
  | 'upright-sword'
  | 'trailing-vine'
  | 'rosette-succulent'
  | 'strappy-arching'
  | 'palm-frond'
  | 'feathery-fern'
  | 'cactus'
  | 'big-paddle'
  | 'patterned-broadleaf'
  | 'paddle-succulent'
  | 'cactus-pad'
  | 'beaded-strand';

export type HeadKey =
  | 'daisy'
  | 'iris'
  | 'orchid'
  | 'lily'
  | 'cluster'
  | 'spike'
  | 'poppy'
  | 'rose'
  | 'tulip'
  | 'bell';

export type BloomToken = 'amber' | 'coral' | 'rose' | 'magenta' | 'lilac' | 'sky' | 'cream';

export type VarPattern = 'speckle' | 'marble' | 'margin' | 'center';

export type IconRecipe = {
  base: BaseKey;
  palette?: {
    leaf1?: string; leaf2?: string; leaf3?: string;
    stem?: string;  vein?: string;
    potBody?: string; potRim?: string;
  };
  variegation?: {
    pattern: VarPattern;
    color: string;
  } | null;
  bloom?:
    | { dot: 'sun' }
    | {
        head: HeadKey;
        petal: BloomToken;
        center?: BloomToken | null;
        accent?: BloomToken | null;
      }
    | null;
};

export interface Plant {
  id: string;
  name: string;
  species: string;
  icon?: IconRecipe;
  room: string;
  moisture: number;
  status: PlantStatus;
  every: number;
  light: string;
  note: string;
  growth: number[];
  lastWater: string;
  createdAt?: string;
  plantbookPid?: string;
  minLightLux?: number | null;
  maxLightLux?: number | null;
  minTemp?: number | null;
  maxTemp?: number | null;
  minEnvHumid?: number | null;
  maxEnvHumid?: number | null;
}

export const STATUS_META: Record<PlantStatus, { label: string; color: string; soft: string; text: string }> = {
  dry:      { label: 'Needs water',   color: '#BC5B49', soft: '#F6E2DC', text: '#9a4636' },
  soon:     { label: 'Due soon',      color: '#C9852F', soft: '#FBEAD0', text: '#9c6520' },
  thriving: { label: 'Thriving',      color: '#3E8E5A', soft: '#E2F0E6', text: '#2f6f46' },
  watered:  { label: 'Watered today', color: '#5E8FB8', soft: '#E2ECF3', text: '#3f6f96' },
  resting:  { label: 'Resting',       color: '#7C857B', soft: '#F4F1E9', text: '#7C857B' },
};
