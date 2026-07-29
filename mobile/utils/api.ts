import { useAuthStore } from '../stores/useAuthStore';

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = useAuthStore.getState().accessToken;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const baseUrl = process.env.EXPO_PUBLIC_API_URL || '';
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  return fetch(url, {
    ...options,
    headers,
  });
}
