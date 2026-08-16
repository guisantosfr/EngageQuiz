export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  type: 'access';
  role?: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  email: string;
  type: 'refresh';
  role?: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken: string;
}
