import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User } from '../types/Auth';

const ACCESS_TOKEN_KEY = 'engage_quiz_access_token';
const REFRESH_TOKEN_KEY = 'engage_quiz_refresh_token';
const USER_KEY = 'engage_quiz_user';

const isWeb = Platform.OS === 'web';

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  }
  return await SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function saveAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
  try {
    await setItem(ACCESS_TOKEN_KEY, accessToken);
    await setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Error saving auth tokens:', error);
  }
}

export async function getAuthTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
  try {
    const accessToken = await getItem(ACCESS_TOKEN_KEY);
    const refreshToken = await getItem(REFRESH_TOKEN_KEY);
    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Error getting auth tokens:', error);
    return { accessToken: null, refreshToken: null };
  }
}

export async function saveUserData(user: User): Promise<void> {
  try {
    await setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

export async function getUserData(): Promise<User | null> {
  try {
    const userStr = await getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

export async function clearAuthData(): Promise<void> {
  try {
    await deleteItem(ACCESS_TOKEN_KEY);
    await deleteItem(REFRESH_TOKEN_KEY);
    await deleteItem(USER_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
}
