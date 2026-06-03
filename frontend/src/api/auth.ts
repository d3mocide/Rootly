import { apiFetch } from './client';

export interface UserResponse {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  created_at: string;
}

export const getToken = () => localStorage.getItem('rootly_token');
export const saveToken = (t: string) => localStorage.setItem('rootly_token', t);
export const clearToken = () => localStorage.removeItem('rootly_token');

/** Returns display_name if set, otherwise the local part of the email address. */
export function getDisplayName(user: UserResponse): string {
  return user.display_name || user.email.split('@')[0];
}

export async function setup(
  email: string,
  password: string,
  displayName?: string,
): Promise<void> {
  await apiFetch('/auth/setup', {
    method: 'POST',
    body: JSON.stringify({ email, password, display_name: displayName || undefined }),
  });
}

export async function login(email: string, password: string): Promise<void> {
  const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);
  await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password, nonce }) });
}

export async function apiLogout(): Promise<void> {
  await apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
  clearToken();
}

export async function getMe(): Promise<UserResponse> {
  return apiFetch('/auth/me');
}

export async function checkSetup(): Promise<{ setup_required: boolean }> {
  return apiFetch('/auth/setup-status');
}

export async function apiChangePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiFetch('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}

