export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  language: 'en' | 'hi';
  city?: string;
  isVerified: boolean;
  isActive: boolean;
  profilePhoto?: string;
  createdAt: string;
  updatedAt: string;
  // Role-specific profile
  sellerProfile?: SellerProfile;
  collectorProfile?: CollectorProfile;
  buyerProfile?: BuyerProfile;
  recyclerProfile?: RecyclerProfile;
}

export interface SellerProfile {
  id: string;
  sellerType: 'household' | 'individual' | 'office' | 'business';
  businessName?: string;
}

export interface CollectorProfile {
  id: string;
  serviceLocations: string[];
  materialCategories: string[];
  vehicleType?: string;
  isAvailable: boolean;
}

export interface BuyerProfile {
  id: string;
  preferredMaterials: string[];
  purchaseCapacity?: string;
  businessName?: string;
}

export interface RecyclerProfile {
  id: string;
  businessName: string;
  facilityAddress: string;
  authorizationDetails?: string;
  isAuthorized: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export type Language = 'en' | 'hi';
