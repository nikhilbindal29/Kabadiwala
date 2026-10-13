import { apiClient } from './api';
import { storage } from '../utils/storage';

export const authService = {
  async register(data: Record<string, unknown>) {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },

  async login(email: string, password: string) {
    const res = await apiClient.post('/auth/login', { email, password });
    const { access_token, refresh_token, user } = res.data;
    await storage.setAccessToken(access_token);
    await storage.setRefreshToken(refresh_token);
    await storage.setUser(user);
    return { token: access_token, user };
  },

  async logout() {
    try {
      const refreshToken = await storage.getRefreshToken();
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refresh_token: refreshToken });
      }
    } finally {
      await storage.clearTokens();
      await storage.clearUser();
    }
  },

  async getMe() {
    const res = await apiClient.get('/auth/me');
    await storage.setUser(res.data);
    return res.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const res = await apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return res.data;
  },

  async forgotPassword(email: string) {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(email: string, otp: string, newPassword: string) {
    const res = await apiClient.post('/auth/reset-password', {
      email,
      otp,
      new_password: newPassword,
    });
    return res.data;
  },
};

