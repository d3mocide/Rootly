import { apiFetch } from './client';

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  created_at: string;
}

export const getToken = () => localStorage.getItem('rootly_token');
export const saveToken = (t: string) => localStorage.setItem('rootly_token', t);
export const clearToken = () => localStorage.removeItem('rootly_token');

export async function register(email: string, password: string): Promise<TokenResponse> {
  return apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
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
