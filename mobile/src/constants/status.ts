export const STATUS = {
  // Listing statuses
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  RESERVED: 'RESERVED',
  SOLD: 'SOLD',
  CANCELLED: 'CANCELLED',
  // Offer / Order statuses
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
  // Pickup
  AVAILABLE: 'AVAILABLE',
  ASSIGNED: 'ASSIGNED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  // User verification
  UNVERIFIED: 'UNVERIFIED',
  VERIFIED: 'VERIFIED',
  SUSPENDED: 'SUSPENDED',
} as const;

export type Status = typeof STATUS[keyof typeof STATUS];
