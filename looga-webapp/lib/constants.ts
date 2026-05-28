export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? '#';

export const TOKEN_KEY = 'looga_auth_token';
export const REFRESH_KEY = 'looga_auth_refresh';
export const USER_KEY = 'looga_auth_user';

export const ENDPOINTS = {
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  authProfile: '/auth/profile',
  events: '/events',
  eventById: (id: string) => `/events/${id}`,
  tickets: '/tickets',
  ticketById: (id: string) => `/tickets/${id}`,
  paymentInit: '/payment/init',
} as const;

export const SITE_URL = (() => {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://looga-ci.com';
})();
