export type PlantStatus = 'dry' | 'soon' | 'thriving' | 'watered' | 'resting';

export type PlantKind = 'monstera' | 'fig' | 'pothos' | 'snake' | 'succulent';

export interface Plant {
  id: string;
  name: string;
  species: string;
  kind?: PlantKind;
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
