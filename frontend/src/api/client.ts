const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('rootly_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 204) return null as T;
  const data = await res.json().catch(() => ({ detail: 'Request failed' }));
  if (!res.ok) throw new ApiError(res.status, data.detail ?? 'Request failed');
  return data;
}
