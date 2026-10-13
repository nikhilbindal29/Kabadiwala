import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'scrapsetu_access_token';
const REFRESH_TOKEN_KEY = 'scrapsetu_refresh_token';
const USER_KEY = 'scrapsetu_user';
const LANGUAGE_KEY = 'scrapsetu_language';

export const storage = {
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },

  async getUser<T>(): Promise<T | null> {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async setUser(user: unknown): Promise<void> {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },

  async clearUser(): Promise<void> {
    await SecureStore.deleteItemAsync(USER_KEY);
  },

  async getLanguage(): Promise<string | null> {
    return SecureStore.getItemAsync(LANGUAGE_KEY);
  },

  async setLanguage(lang: string): Promise<void> {
    await SecureStore.setItemAsync(LANGUAGE_KEY, lang);
  },
};
