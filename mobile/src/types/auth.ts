export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  language: 'en' | 'hi';
  city: string;
  role: string;
  // Role-specific
  sellerType?: string;
  businessName?: string;
  serviceLocations?: string[];
  materialCategories?: string[];
  preferredMaterials?: string[];
  purchaseCapacity?: string;
  facilityAddress?: string;
  authorizationDetails?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: import('./index').User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
