export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
console.log('[CONFIG] API_BASE_URL =', API_BASE_URL);

export const ENDPOINTS = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  authProfile: '/auth/profile',
  authOrganizerProfile: '/auth/organizer-profile',

  // Événements
  events: '/events',
  eventById: (id: string) => `/events/${id}`,
  eventCategories: '/events/categories',

  // Tickets
  tickets: '/tickets',
  ticketById: (id: string) => `/tickets/${id}`,
  ticketPurchase: '/tickets/purchase',

  // Paiement
  paymentInit: '/payment/init',
  paymentStatus: (id: string) => `/payment/status/${id}`,

  // Utilisateur
  userPushToken: '/user/push-token',
} as const;
