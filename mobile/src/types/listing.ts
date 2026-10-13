export interface Listing {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  quantity: number;
  unit: string;
  estimatedWeight: number;
  expectedPrice?: number;
  description?: string;
  city: string;
  pickupAddress: string;
  photos: string[];
  status: string;
  sellerId: string;
  sellerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListingRequest {
  title: string;
  category: string;
  subcategory?: string;
  condition: string;
  quantity: number;
  unit: string;
  estimatedWeight: number;
  expectedPrice?: number;
  description?: string;
  city: string;
  pickupAddress: string;
  photos?: string[];
}

export interface ListingFilter {
  category?: string;
  city?: string;
  condition?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface Category {
  id: string;
  name: string;
  nameHi?: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  nameHi?: string;
  categoryId: string;
}
