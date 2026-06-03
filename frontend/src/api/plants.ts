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
  created_at: string;
}

const fromApi = (p: ApiPlant): Plant => ({
  ...p,
  moisture: Math.round(p.moisture * 100),
  lastWater: p.last_water ?? '',
  createdAt: p.created_at,
});

export async function fetchPlants(): Promise<Plant[]> {
  const data: ApiPlant[] = await apiFetch('/plants');
  return data.map(fromApi);
}

export async function apiWaterPlant(id: string): Promise<Plant> {
  return fromApi(await apiFetch(`/plants/${id}/water`, { method: 'POST' }));
}

export async function apiCreatePlant(plant: Omit<Plant, 'id'>): Promise<Plant> {
  const { lastWater, moisture, ...rest } = plant;
  return fromApi(
    await apiFetch('/plants', {
      method: 'POST',
      body: JSON.stringify({
        ...rest,
        moisture: moisture / 100,
        last_water: lastWater || null,
      }),
    })
  );
}

export async function apiUpdatePlant(id: string, updates: Partial<Plant>): Promise<Plant> {
  const { lastWater, moisture, ...rest } = updates;
  return fromApi(
    await apiFetch(`/plants/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...rest,
        ...(moisture !== undefined ? { moisture: moisture / 100 } : {}),
        ...(lastWater !== undefined ? { last_water: lastWater } : {}),
      }),
    })
  );
}

export async function apiDeletePlant(id: string): Promise<void> {
  return apiFetch(`/plants/${id}`, { method: 'DELETE' });
}
