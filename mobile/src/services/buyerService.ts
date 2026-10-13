import { apiClient } from './api';

export const buyerService = {
  async getDashboard() {
    const res = await apiClient.get('/buyer/dashboard');
    return res.data;
  },

  async browseMarketplace(params?: {
    q?: string;
    category?: string;
    city?: string;
    condition?: string;
    grade?: string;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
  }) {
    const res = await apiClient.get('/buyer/marketplace', { params });
    return res.data;
  },

  async getLotDetails(lotId: string) {
    const res = await apiClient.get(`/buyer/lots/${lotId}`);
    return res.data;
  },

  async submitOffer(data: {
    lot_id: string;
    offer_price: number;
    quantity: number;
    unit?: string;
    transport_cost_estimate?: number;
    valid_until?: string;
    notes?: string;
  }) {
    const res = await apiClient.post('/buyer/offers', data);
    return res.data;
  },

  async reviseOffer(offerId: string, offerPrice: number, quantity?: number) {
    const res = await apiClient.put(`/buyer/offers/${offerId}`, {
      offer_price: offerPrice,
      quantity,
    });
    return res.data;
  },

  async withdrawOffer(offerId: string) {
    const res = await apiClient.delete(`/buyer/offers/${offerId}`);
    return res.data;
  },

  async getMyOffers() {
    const res = await apiClient.get('/buyer/offers');
    return res.data;
  },

  async getMyPurchases() {
    const res = await apiClient.get('/buyer/purchases');
    return res.data;
  },

  async confirmPurchase(orderId: string) {
    const res = await apiClient.post(`/buyer/purchases/${orderId}/confirm`);
    return res.data;
  },
};

