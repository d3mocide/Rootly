import { apiFetch } from './client';
import type { Area } from '../types/area';

interface ApiArea {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

const fromApi = (a: ApiArea): Area => ({
  id: a.id,
  userId: a.user_id,
  name: a.name,
  createdAt: a.created_at,
});

export async function fetchAreas(): Promise<Area[]> {
  const data: ApiArea[] = await apiFetch('/areas');
  return data.map(fromApi);
}

export async function apiCreateArea(name: string): Promise<Area> {
  return fromApi(await apiFetch('/areas', { method: 'POST', body: JSON.stringify({ name }) }));
}

export async function apiDeleteArea(id: string): Promise<void> {
  return apiFetch(`/areas/${id}`, { method: 'DELETE' });
}
