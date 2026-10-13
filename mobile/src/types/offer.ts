export interface Offer {
  id: string;
  lotId?: string;
  listingId?: string;
  buyerId: string;
  buyerName?: string;
  collectorId?: string;
  amount: number;
  currency: string;
  status: string;
  message?: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferRequest {
  lotId?: string;
  listingId?: string;
  amount: number;
  message?: string;
  validUntil?: string;
}

export interface Lot {
  id: string;
  collectorId: string;
  title: string;
  category: string;
  materials: LotMaterial[];
  totalWeight: number;
  grade: string;
  askingPrice: number;
  city: string;
  photos: string[];
  status: string;
  bestOffer?: Offer;
  offersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LotMaterial {
  name: string;
  weight: number;
  unit: string;
}
