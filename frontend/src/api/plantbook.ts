import { apiFetch } from './client';

export interface PlantSearchResult {
  pid: string;
  display_name: string;
  alias: string;
}

export interface PlantProfile {
  pid: string;
  display_name: string;
  alias: string;
  min_soil_moist: number | null;
  max_soil_moist: number | null;
  min_light_lux: number | null;
  max_light_lux: number | null;
  min_temp: number | null;
  max_temp: number | null;
  min_env_humid: number | null;
  max_env_humid: number | null;
  image_url: string;
}

export async function searchPlantbook(q: string): Promise<PlantSearchResult[]> {
  return apiFetch<PlantSearchResult[]>(`/plantbook/search?q=${encodeURIComponent(q)}`);
}

export async function getPlantbookDetail(pid: string): Promise<PlantProfile> {
  return apiFetch<PlantProfile>(`/plantbook/detail/${encodeURIComponent(pid)}`);
}

export function luxToLabel(minLux: number | null, maxLux: number | null): string {
  const avg = ((minLux ?? 0) + (maxLux ?? 0)) / 2;
  if (avg === 0) return '';
  if (avg < 1000) return 'Low light';
  if (avg < 3000) return 'Indirect light';
  if (avg < 6000) return 'Bright indirect';
  return 'Full sun';
}

export function suggestEvery(minSoilMoist: number | null): number {
  if (minSoilMoist === null) return 7;
  if (minSoilMoist <= 15) return 14;
  if (minSoilMoist <= 25) return 9;
  if (minSoilMoist <= 40) return 6;
  return 4;
}
