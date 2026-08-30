import { useAuthStore } from '../stores/useAuthStore';

let isRefreshing = false;

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const { accessToken, refreshToken, setAuth, logout, user } = useAuthStore.getState();

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

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Se receber 401 Não Autorizado e possuir Refresh Token, tentar renovação automática
  if (response.status === 401 && refreshToken && !isRefreshing && !endpoint.includes('/auth/')) {
    isRefreshing = true;
    try {
      const refreshResponse = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        if (data.accessToken && data.refreshToken && user) {
          await setAuth(user, data.accessToken, data.refreshToken);
          headers['Authorization'] = `Bearer ${data.accessToken}`;
          response = await fetch(url, {
            ...options,
            headers,
          });
        }
      } else {
        await logout();
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      await logout();
    } finally {
      isRefreshing = false;
    }
  }

  return response;
}
