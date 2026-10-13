import { apiClient } from './api';

export const notificationService = {
  async getNotifications() {
    const res = await apiClient.get('/notifications');
    return res.data;
  },

  async markAsRead(notificationId: string) {
    const res = await apiClient.put(`/notifications/${notificationId}/read`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await apiClient.put('/notifications/read-all');
    return res.data;
  },
};

