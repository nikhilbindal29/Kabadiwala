import { apiClient } from './api';

export const adminService = {
  async getDashboard() {
    const res = await apiClient.get('/admin/dashboard');
    return res.data;
  },

  async listUsers(params?: { role?: string; status?: string; search?: string }) {
    const res = await apiClient.get('/admin/users', { params });
    return res.data;
  },

  async updateUserStatus(userId: string, status: string, reason = '') {
    const res = await apiClient.put(`/admin/users/${userId}/status`, { status, reason });
    return res.data;
  },

  async reviewVerification(userId: string, decision: string, reason = '') {
    const res = await apiClient.put(`/admin/verification/${userId}`, { decision, reason });
    return res.data;
  },

  async getAuditLog() {
    const res = await apiClient.get('/admin/audit-log');
    return res.data;
  },

  async getCategories() {
    const res = await apiClient.get('/admin/categories');
    return res.data;
  },

  async createCategory(data: { name: string; name_hi?: string; subcategories?: string }) {
    const res = await apiClient.post('/admin/categories', data);
    return res.data;
  },

  async getServiceAreas() {
    const res = await apiClient.get('/admin/service-areas');
    return res.data;
  },

  async createServiceArea(data: { city: string; state: string; pincode_ranges?: string }) {
    const res = await apiClient.post('/admin/service-areas', data);
    return res.data;
  },

  async getDisputes() {
    const res = await apiClient.get('/admin/disputes');
    return res.data;
  },

  async resolveDispute(disputeId: string, resolution: string) {
    const res = await apiClient.put(`/admin/disputes/${disputeId}/resolve`, { resolution });
    return res.data;
  },
};

