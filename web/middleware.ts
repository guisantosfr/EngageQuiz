import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  exp: number;
}

// Rotas públicas que não exigem autenticação
const PUBLIC_ROUTES = ['/login', '/register'];

// Rotas exclusivas para Professores/Admins (RBAC)
const TEACHER_ROUTES = ['/quizzes/new', '/quizzes/new-ai', '/play'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorar arquivos estáticos, assets do Next.js e favicon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const accessTokenCookie = request.cookies.get('accessToken')?.value;
  const refreshTokenCookie = request.cookies.get('refreshToken')?.value;

  let token = accessTokenCookie;
  let decodedPayload: JwtPayload | null = null;
  let isRefreshed = false;
  let newAccessToken = '';
  let newRefreshToken = '';

  // Função auxiliar para decodificar JWT
  const decodeToken = (t: string): JwtPayload | null => {
    try {
      const decoded = jwtDecode<JwtPayload>(t);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return null; // Token expirado
      }
      return decoded;
    } catch {
      return null;
    }
  };

  if (token) {
    decodedPayload = decodeToken(token);
  }

  // Se o AccessToken expirou ou não existe, mas temos um RefreshToken válido
  if (!decodedPayload && refreshTokenCookie) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const refreshRes = await fetch(`${apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshTokenCookie }),
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.accessToken) {
          newAccessToken = refreshData.accessToken;
          newRefreshToken = refreshData.refreshToken || refreshTokenCookie;
          decodedPayload = decodeToken(newAccessToken);
          isRefreshed = true;
        }
      }
    } catch (err) {
      console.error('Erro na renovação automática de token no middleware:', err);
    }
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthenticated = !!decodedPayload;

  // 1. Redirecionar usuário autenticado se tentar acessar páginas públicas de auth (/login ou /register)
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    const response = NextResponse.redirect(url);
    if (isRefreshed) {
      setAuthCookies(response, newAccessToken, newRefreshToken);
    }
    return response;
  }

  // 2. Proteger páginas privadas: redirecionar não autenticados para /login
  if (!isAuthenticated && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    const response = NextResponse.redirect(url);
    // Limpar cookies inválidos/expirados
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
  }

  // 3. Controle de Acesso Baseado em Função (RBAC)
  if (isAuthenticated && decodedPayload) {
    const userRole = decodedPayload.role;

    const isTeacherRoute = TEACHER_ROUTES.some((route) =>
      pathname === route || pathname.startsWith(`${route}/`)
    );

    // Se um aluno tentar acessar rotas de criação/edição de questionários
    if (isTeacherRoute && userRole === 'STUDENT') {
      const url = request.nextUrl.clone();
      url.pathname = '/play';
      const response = NextResponse.redirect(url);
      if (isRefreshed) {
        setAuthCookies(response, newAccessToken, newRefreshToken);
      }
      return response;
    }
  }

  // Resposta padrão caso esteja tudo válido
  const response = NextResponse.next();

  if (isRefreshed) {
    setAuthCookies(response, newAccessToken, newRefreshToken);
  }

  return response;
}

function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  response.cookies.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutos
    path: '/',
  });

  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 dias
    path: '/',
  });
}

export const config = {
  matcher: [
    /*
     * Intercepta todas as requisições exceto arquivos estáticos e API
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
