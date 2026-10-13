export const Colors = {
  primary: '#2D6A4F',
  primaryLight: '#52B788',
  primaryDark: '#1B4332',
  accent: '#95D5B2',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#212529',
  textSecondary: '#6C757D',
  textInverse: '#FFFFFF',
  border: '#DEE2E6',
  error: '#DC3545',
  warning: '#FFC107',
  success: '#28A745',
  info: '#17A2B8',
  // Status colors
  statusDraft: '#6C757D',
  statusActive: '#28A745',
  statusReserved: '#FFC107',
  statusSold: '#17A2B8',
  statusCancelled: '#DC3545',
  statusPending: '#FD7E14',
  statusAccepted: '#28A745',
  statusRejected: '#DC3545',
  // Overlay
  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.2)',
  // Transparent
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof Colors;
