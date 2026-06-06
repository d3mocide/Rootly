import { ApiError } from './client';
import type { PlantProfile } from './plantbook';

export interface IdentifyResult {
  scientific_name: string | null;
  common_name: string | null;
  score: number;
  plantbook_pid: string | null;
  profile: PlantProfile | null;
}

export async function identifyPlant(file: File): Promise<IdentifyResult> {
  const token = localStorage.getItem('rootly_token');
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const body = new FormData();
  body.append('image', file);

  const res = await fetch('/api/identify', { method: 'POST', headers, body });
  const data = await res.json().catch(() => ({ detail: 'Request failed' }));
  if (!res.ok) throw new ApiError(res.status, data.detail ?? 'Identification failed');
  return data;
}
