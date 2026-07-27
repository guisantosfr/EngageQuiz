'use server'

import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

export async function loginAction(data: { email: string; password: string }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      const message = Array.isArray(result.message)
        ? result.message.join(', ')
        : (result.message || 'Credenciais inválidas.');
      return { error: message };
    }

    const cookieStore = await cookies();

    if (result.accessToken) {
      cookieStore.set('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60, // 15 minutos
        path: '/',
      });
    }

    if (result.refreshToken) {
      cookieStore.set('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 dias
        path: '/',
      });
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Login action error:', error);
    return { error: 'Erro de conexão com o servidor.' };
  }
}

export async function registerAction(data: { name: string; email: string; password: string }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    const response = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      const message = Array.isArray(result.message)
        ? result.message.join(', ')
        : (result.message || 'Erro ao realizar cadastro.');
      return { error: message };
    }

    const cookieStore = await cookies();

    if (result.accessToken) {
      cookieStore.set('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60, // 15 minutos
        path: '/',
      });
    }

    if (result.refreshToken) {
      cookieStore.set('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 dias
        path: '/',
      });
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Register action error:', error);
    return { error: 'Erro de conexão com o servidor.' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
  return { success: true };
}

export async function getAuthUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;

  try {
    const decoded = jwtDecode<{ sub: string; email: string; role: 'ADMIN' | 'TEACHER' | 'STUDENT'; name?: string; exp: number }>(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }
    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name || decoded.email.split('@')[0],
    };
  } catch {
    return null;
  }
}
