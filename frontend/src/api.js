import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({ baseURL: API_URL });

// ---- token storage: the ONLY place that knows where tokens live ----
export const getAccessToken = () => localStorage.getItem('access');
export const getRefreshToken = () => localStorage.getItem('refresh');

export function saveTokens(access, refresh) {
  localStorage.setItem('access', access);
  if (refresh) localStorage.setItem('refresh', refresh);
}

export function clearTokens() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
}

// ---- request interceptor: attach the access token ----
api.interceptors.request.use(config => {
  const access = getAccessToken();
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// ---- refresh logic ----
let refreshPromise = null;

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/auth/refresh/`, { refresh: getRefreshToken() })
      .then(({ data }) => {
        saveTokens(data.access, data.refresh);
        return data.access;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

const NO_REFRESH_PATHS = ['/auth/login/', '/auth/register/', '/auth/refresh/'];

// ---- response interceptor: on 401, refresh once and retry ----
api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config;
    const status = error.response?.status;

    const shouldSkip =
      status !== 401 ||
      !original ||
      original._retry ||
      NO_REFRESH_PATHS.includes(original.url) ||
      !getRefreshToken();

    if (shouldSkip) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const newAccess = await refreshAccessToken();
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (refreshError) {
      clearTokens();
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(refreshError);
    }
  }
);

export default api;