import { apiClient } from './api';

export const sellerService = {
  async getDashboard() {
    const res = await apiClient.get('/seller/dashboard');
    return res.data;
  },

  async getListings(params?: { status?: string; category?: string }) {
    const res = await apiClient.get('/seller/listings', { params });
    return res.data;
  },

  async getListing(id: string) {
    const res = await apiClient.get(`/seller/listings/${id}`);
    return res.data;
  },

  async createListing(data: Record<string, unknown>) {
    const res = await apiClient.post('/seller/listings', data);
    return res.data;
  },

  async updateListing(id: string, data: Record<string, unknown>) {
    const res = await apiClient.put(`/seller/listings/${id}`, data);
    return res.data;
  },

  async cancelListing(id: string) {
    const res = await apiClient.delete(`/seller/listings/${id}`);
    return res.data;
  },

  async requestPickup(listingId: string, pickupAddress: string, scheduledAt: string) {
    const res = await apiClient.post(`/seller/listings/${listingId}/pickup`, {
      pickup_address: pickupAddress,
      scheduled_at: scheduledAt,
    });
    return res.data;
  },

  async getPickupRequests() {
    const res = await apiClient.get('/seller/pickup-requests');
    return res.data;
  },

  async getOrders() {
    const res = await apiClient.get('/seller/orders');
    return res.data;
  },

  async getTransactions() {
    const res = await apiClient.get('/seller/transactions');
    return res.data;
  },
};

