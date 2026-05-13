import axios from 'axios';
import { API_BASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, TOKEN_KEY, REFRESH_KEY } from '@/lib/constants';
import { useAuthStore } from '@/lib/store/authStore';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    apikey: SUPABASE_ANON_KEY,
  },
  timeout: 15000,
});

// Intercepteur request → ajoute le Bearer token (synchrone sur web)
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  config.headers.Authorization = `Bearer ${token ?? SUPABASE_ANON_KEY}`;
  return config;
});

// --- Refresh token silencieux ---
let isRefreshing = false;
let waitingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, newToken: string | null) {
  waitingQueue.forEach(({ resolve, reject }) => {
    if (newToken) resolve(newToken);
    else reject(error);
  });
  waitingQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null;
  if (!refreshToken) throw new Error('No refresh token');

  // Appel direct Supabase (pas via apiClient pour éviter les boucles infinies)
  const { data } = await axios.post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
    { refresh_token: refreshToken },
    { headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' } }
  );

  const newToken: string = data.access_token;
  const newRefresh: string = data.refresh_token;

  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(REFRESH_KEY, newRefresh);
  }
  useAuthStore.setState({ token: newToken, refreshToken: newRefresh });

  return newToken;
}

// Intercepteur response → refresh automatique sur 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url: string = originalRequest?.url ?? '';
    const status: number = error.response?.status;

    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/v1/token');

    if (status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          waitingQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await useAuthStore.getState().logout();
        if (typeof window !== 'undefined') window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (status >= 500) {
      console.error('[API] Erreur serveur', status, url);
    } else if (!error.response) {
      console.error('[API] Erreur réseau', error.message, url);
    }

    return Promise.reject(error);
  }
);
