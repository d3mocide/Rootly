import { apiFetch } from './client';
import type { Plant, IconRecipe } from '../types/plant';

interface ApiPlant {
  id: string;
  name: string;
  species: string;
  icon: IconRecipe | null;
  room: string;
  moisture: number;
  status: Plant['status'];
  every: number;
  light: string;
  note: string;
  growth: number[];
  last_water: string | null;
  created_at: string;
  plantbook_pid: string | null;
  min_light_lux: number | null;
  max_light_lux: number | null;
  min_temp: number | null;
  max_temp: number | null;
  min_env_humid: number | null;
  max_env_humid: number | null;
  fertilize_every: number | null;
  last_fertilize: string | null;
  prune_every: number | null;
  last_prune: string | null;
}

const fromApi = (p: ApiPlant): Plant => ({
  ...p,
  icon: p.icon ?? undefined,
  moisture: Math.round(p.moisture * 100),
  lastWater: p.last_water ?? '',
  createdAt: p.created_at,
  plantbookPid: p.plantbook_pid ?? undefined,
  minLightLux: p.min_light_lux,
  maxLightLux: p.max_light_lux,
  minTemp: p.min_temp,
  maxTemp: p.max_temp,
  minEnvHumid: p.min_env_humid,
  maxEnvHumid: p.max_env_humid,
  fertilizeEvery: p.fertilize_every,
  lastFertilize: p.last_fertilize ?? '',
  pruneEvery: p.prune_every,
  lastPrune: p.last_prune ?? '',
});

export async function fetchPlants(): Promise<Plant[]> {
  const data: ApiPlant[] = await apiFetch('/plants');
  return data.map(fromApi);
}

export async function apiWaterPlant(id: string): Promise<Plant> {
  return fromApi(await apiFetch(`/plants/${id}/water`, { method: 'POST' }));
}

export async function apiFertilizePlant(id: string): Promise<Plant> {
  return fromApi(await apiFetch(`/plants/${id}/fertilize`, { method: 'POST' }));
}

export async function apiPrunePlant(id: string): Promise<Plant> {
  return fromApi(await apiFetch(`/plants/${id}/prune`, { method: 'POST' }));
}

export async function apiCreatePlant(plant: Omit<Plant, 'id'>): Promise<Plant> {
  const {
    lastWater, moisture, plantbookPid,
    minLightLux, maxLightLux, minTemp, maxTemp, minEnvHumid, maxEnvHumid,
    fertilizeEvery, lastFertilize, pruneEvery, lastPrune,
    createdAt: _createdAt, ...rest
  } = plant;
  return fromApi(
    await apiFetch('/plants', {
      method: 'POST',
      body: JSON.stringify({
        ...rest,
        moisture: moisture / 100,
        last_water: lastWater || null,
        plantbook_pid: plantbookPid ?? null,
        min_light_lux: minLightLux ?? null,
        max_light_lux: maxLightLux ?? null,
        min_temp: minTemp ?? null,
        max_temp: maxTemp ?? null,
        min_env_humid: minEnvHumid ?? null,
        max_env_humid: maxEnvHumid ?? null,
        fertilize_every: fertilizeEvery ?? null,
        last_fertilize: lastFertilize || null,
        prune_every: pruneEvery ?? null,
        last_prune: lastPrune || null,
      }),
    })
  );
}

export async function apiUpdatePlant(id: string, updates: Partial<Plant>): Promise<Plant> {
  const {
    lastWater, moisture, plantbookPid,
    minLightLux, maxLightLux, minTemp, maxTemp, minEnvHumid, maxEnvHumid,
    fertilizeEvery, lastFertilize, pruneEvery, lastPrune,
    createdAt: _createdAt, ...rest
  } = updates;
  return fromApi(
    await apiFetch(`/plants/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...rest,
        ...(moisture !== undefined ? { moisture: moisture / 100 } : {}),
        ...(lastWater !== undefined ? { last_water: lastWater } : {}),
        ...(plantbookPid !== undefined ? { plantbook_pid: plantbookPid } : {}),
        ...(minLightLux !== undefined ? { min_light_lux: minLightLux } : {}),
        ...(maxLightLux !== undefined ? { max_light_lux: maxLightLux } : {}),
        ...(minTemp !== undefined ? { min_temp: minTemp } : {}),
        ...(maxTemp !== undefined ? { max_temp: maxTemp } : {}),
        ...(minEnvHumid !== undefined ? { min_env_humid: minEnvHumid } : {}),
        ...(maxEnvHumid !== undefined ? { max_env_humid: maxEnvHumid } : {}),
        ...(fertilizeEvery !== undefined ? { fertilize_every: fertilizeEvery } : {}),
        ...(lastFertilize !== undefined ? { last_fertilize: lastFertilize || null } : {}),
        ...(pruneEvery !== undefined ? { prune_every: pruneEvery } : {}),
        ...(lastPrune !== undefined ? { last_prune: lastPrune || null } : {}),
      }),
    })
  );
}

export async function apiDeletePlant(id: string): Promise<void> {
  return apiFetch(`/plants/${id}`, { method: 'DELETE' });
}
