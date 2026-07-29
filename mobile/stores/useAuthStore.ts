import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { AuthState, DecodedToken, User } from '../types/Auth';
import {
  clearAuthData,
  getAuthTokens,
  getUserData,
  saveAuthTokens,
  saveUserData,
} from '../utils/secureStore';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: async (user: User, accessToken: string, refreshToken: string) => {
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });

    await saveAuthTokens(accessToken, refreshToken);
    await saveUserData(user);
  },

  logout: async () => {
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });

    await clearAuthData();
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const { accessToken, refreshToken } = await getAuthTokens();
      const storedUser = await getUserData();

      if (accessToken) {
        try {
          const decoded = jwtDecode<DecodedToken>(accessToken);
          const currentTime = Date.now() / 1000;

          if (decoded.exp && decoded.exp < currentTime) {
            // Token expirado
            await clearAuthData();
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          const user: User = storedUser || {
            id: decoded.sub,
            email: decoded.email,
            name: '',
            role: decoded.role,
          };

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        } catch (decodeError) {
          console.error('Invalid token format:', decodeError);
          await clearAuthData();
        }
      }

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateUser: (user: User) => {
    set({ user });
    saveUserData(user);
  },
}));
