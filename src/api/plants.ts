import { apiFetch } from './client';
import type { Plant } from '../types/plant';

interface ApiPlant {
  id: string;
  name: string;
  species: string;
  kind: Plant['kind'];
  room: string;
  moisture: number;
  status: Plant['status'];
  every: number;
  light: string;
  note: string;
  growth: number[];
  last_water: string | null;
}

const fromApi = (p: ApiPlant): Plant => ({ ...p, lastWater: p.last_water ?? '' });

export async function fetchPlants(): Promise<Plant[]> {
  const data: ApiPlant[] = await apiFetch('/plants');
  return data.map(fromApi);
}

export async function apiWaterPlant(id: string): Promise<Plant> {
  return fromApi(await apiFetch(`/plants/${id}/water`, { method: 'POST' }));
}

export async function apiCreatePlant(plant: Omit<Plant, 'id'>): Promise<Plant> {
  const { lastWater, ...rest } = plant;
  return fromApi(
    await apiFetch('/plants', {
      method: 'POST',
      body: JSON.stringify({ ...rest, last_water: lastWater || null }),
    })
  );
}

export async function apiUpdatePlant(id: string, updates: Partial<Plant>): Promise<Plant> {
  const { lastWater, ...rest } = updates;
  return fromApi(
    await apiFetch(`/plants/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...rest, ...(lastWater !== undefined ? { last_water: lastWater } : {}) }),
    })
  );
}

export async function apiDeletePlant(id: string): Promise<void> {
  return apiFetch(`/plants/${id}`, { method: 'DELETE' });
}
