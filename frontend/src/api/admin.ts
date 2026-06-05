import { apiFetch } from './client';
import type { UserResponse } from './auth';

export interface AdminSettings {
  signups_enabled: boolean;
}

export async function listUsers(): Promise<UserResponse[]> {
  return apiFetch('/admin/users');
}

export async function createUser(
  email: string,
  password: string,
  displayName: string | undefined,
  role: string,
): Promise<UserResponse> {
  return apiFetch('/admin/users', {
    method: 'POST',
    body: JSON.stringify({ email, password, display_name: displayName || undefined, role }),
  });
}

export async function updateUser(
  id: string,
  updates: { role?: string; is_active?: boolean; display_name?: string },
): Promise<UserResponse> {
  return apiFetch(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function deleteUser(id: string): Promise<void> {
  await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
}

export async function getAdminSettings(): Promise<AdminSettings> {
  return apiFetch('/admin/settings');
}

export async function updateAdminSettings(updates: Partial<AdminSettings>): Promise<AdminSettings> {
  return apiFetch('/admin/settings', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}
