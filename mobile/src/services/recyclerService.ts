import { apiClient } from './api';

export const recyclerService = {
  async getDashboard() {
    const res = await apiClient.get('/recycler/dashboard');
    return res.data;
  },

  async browseMaterials(params?: {
    category?: string;
    city?: string;
    min_weight?: number;
  }) {
    const res = await apiClient.get('/recycler/material-marketplace', { params });
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
    const res = await apiClient.post('/recycler/offers', data);
    return res.data;
  },

  async confirmHandover(
    orderId: string,
    data: {
      actual_weight_kg: number;
      condition?: string;
      evidence_paths?: string;
      notes?: string;
    }
  ) {
    const res = await apiClient.post(`/recycler/handovers/${orderId}/confirm`, data);
    return res.data;
  },

  async getDocuments() {
    const res = await apiClient.get('/recycler/documents');
    return res.data;
  },

  async uploadDocument(data: {
    document_type: string;
    file_path: string;
    document_reference?: string;
    expiry_date?: string;
  }) {
    const res = await apiClient.post('/recycler/documents', data);
    return res.data;
  },
};

