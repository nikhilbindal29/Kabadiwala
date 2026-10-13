export interface Order {
  id: string;
  listingId?: string;
  lotId?: string;
  sellerId?: string;
  collectorId?: string;
  buyerId: string;
  recyclerId?: string;
  amount: number;
  currency: string;
  status: string;
  pickupDate?: string;
  deliveryDate?: string;
  trackingInfo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PickupRequest {
  id: string;
  listingId: string;
  sellerId: string;
  sellerName: string;
  collectorId?: string;
  city: string;
  address: string;
  scheduledDate?: string;
  status: string;
  category: string;
  estimatedWeight: number;
  expectedPrice?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Inventory {
  id: string;
  collectorId: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  weight: number;
  grade: string;
  acquiredFrom?: string;
  acquiredDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
