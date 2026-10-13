import { apiClient } from './api';

export const collectorService = {
  async getDashboard() {
    const res = await apiClient.get('/collector/dashboard');
    return res.data;
  },

  async getAvailablePickups(city?: string) {
    const res = await apiClient.get('/collector/available-pickups', {
      params: city ? { city } : undefined,
    });
    return res.data;
  },

  async acceptPickup(pickupId: string) {
    const res = await apiClient.post(`/collector/pickups/${pickupId}/accept`);
    return res.data;
  },

  async schedulePickup(pickupId: string, scheduledTime: string) {
    const res = await apiClient.post(`/collector/pickups/${pickupId}/schedule`, {
      scheduled_time: scheduledTime,
    });
    return res.data;
  },

  async completePickup(pickupId: string, actualWeightKg: number, notes = '', evidencePaths = '') {
    const res = await apiClient.post(`/collector/pickups/${pickupId}/complete`, {
      actual_weight_kg: actualWeightKg,
      notes,
      evidence_paths: evidencePaths,
    });
    return res.data;
  },

  async getInventory() {
    const res = await apiClient.get('/collector/inventory');
    return res.data;
  },

  async createLot(data: Record<string, unknown>) {
    const res = await apiClient.post('/collector/inventory', data);
    return res.data;
  },

  async updateLot(lotId: string, data: Record<string, unknown>) {
    const res = await apiClient.put(`/collector/inventory/${lotId}`, data);
    return res.data;
  },

  async getOffers() {
    const res = await apiClient.get('/collector/offers');
    return res.data;
  },

  async acceptOffer(offerId: string) {
    const res = await apiClient.post(`/collector/offers/${offerId}/accept`);
    return res.data;
  },

  async rejectOffer(offerId: string) {
    const res = await apiClient.post(`/collector/offers/${offerId}/reject`);
    return res.data;
  },
};

