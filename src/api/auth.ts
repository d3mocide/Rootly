import { apiFetch } from './client';

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  display_name: string | null;
  is_admin: boolean;
  created_at: string;
}

export const getToken = () => localStorage.getItem('rootly_token');
export const saveToken = (t: string) => localStorage.setItem('rootly_token', t);
export const clearToken = () => localStorage.removeItem('rootly_token');

/** Returns display_name if set, otherwise the local part of the email address. */
export function getDisplayName(user: UserResponse): string {
  return user.display_name || user.email.split('@')[0];
}

export async function register(
  email: string,
  password: string,
  displayName?: string,
): Promise<TokenResponse> {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, display_name: displayName || undefined }),
  });
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  return apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
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
