import { apiFetch } from './client';
import type { UserResponse } from './auth';

export async function listUsers(): Promise<UserResponse[]> {
  return apiFetch('/admin/users');
}
