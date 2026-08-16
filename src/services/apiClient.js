// Centralized API Client for Gather Backend (Spring Boot API integration)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// ── Canonical key names (must match AuthContext.STORAGE_KEYS) ──
const KEYS = {
  TOKEN:         'gather_token',
  REFRESH_TOKEN: 'gather_refresh_token',
  USER:          'gather_user',
};

let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
};

const getAuthHeaders = () => {
  const token = localStorage.getItem(KEYS.TOKEN);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleAuthSessionExpired = () => {
  localStorage.removeItem(KEYS.TOKEN);
  localStorage.removeItem(KEYS.REFRESH_TOKEN);
  localStorage.removeItem(KEYS.USER);
  window.dispatchEvent(new Event('gather_session_expired'));
};

export const refreshTokenApi = async () => {
  const refreshToken = localStorage.getItem(KEYS.REFRESH_TOKEN);
  if (!refreshToken) throw new Error('No refresh token available');

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ refreshToken }),
  });

  let data;
  try   { data = await response.json(); }
  catch { data = null; }

  if (!response.ok) {
    const err = new Error(data?.message || data?.error || 'Refresh token invalid or expired');
    err.status = response.status;
    throw err;
  }

  const newAccessToken  = data.accessToken || data.token || data.jwt;
  const newRefreshToken = data.refreshToken;

  if (newAccessToken)  localStorage.setItem(KEYS.TOKEN,         newAccessToken);
  if (newRefreshToken) localStorage.setItem(KEYS.REFRESH_TOKEN, newRefreshToken);

  return newAccessToken;
};

const handleResponse = async (response) => {
  let data;
  try   { data = await response.json(); }
  catch { data = null; }

  if (!response.ok) {
    if (response.status === 403) {
      window.dispatchEvent(new CustomEvent('gather_access_denied', {
        detail: { message: data?.message || data?.error || 'You don’t currently have permission for this resource.' }
      }));
    }
    const error = new Error(data?.message || data?.error || `API Error (${response.status}): ${response.statusText}`);
    error.status = response.status;
    error.data   = data;
    throw error;
  }
  return data;
};

async function executeFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  let response = await fetch(url, { ...options, headers });

  const isAuthEndpoint =
    url.includes('/auth/login') ||
    url.includes('/auth/signup') ||
    url.includes('/auth/refresh');

  if (response.status === 403) {
    try {
      const cloned = await response.clone().json();
      window.dispatchEvent(new CustomEvent('gather_access_denied', {
        detail: { message: cloned?.message || cloned?.error || 'Access Denied: You do not have permission for this endpoint.' }
      }));
    } catch (e) {
      window.dispatchEvent(new CustomEvent('gather_access_denied', {
        detail: { message: 'Access Denied: You do not have permission for this endpoint.' }
      }));
    }
  }

  if (response.status === 401 && !isAuthEndpoint) {
    if (isRefreshing) {
      // Queue this request until refresh completes
      const newToken = await new Promise((resolve, reject) => failedQueue.push({ resolve, reject }));
      headers.Authorization = `Bearer ${newToken}`;
      return fetch(url, { ...options, headers });
    }

    isRefreshing = true;
    try {
      const newAccessToken = await refreshTokenApi();
      isRefreshing = false;
      processQueue(null, newAccessToken);
      headers.Authorization = `Bearer ${newAccessToken}`;
      response = await fetch(url, { ...options, headers });
      return response;
    } catch (refreshErr) {
      isRefreshing = false;
      processQueue(refreshErr, null);
      handleAuthSessionExpired();
      throw refreshErr;
    }
  }

  return response;
}

// ── Build a clean endpoint URL, deduplicating /api/ prefix ──
const buildUrl = (endpoint) => {
  const clean = endpoint.startsWith('/api/') ? endpoint.substring(4) : endpoint;
  return `${BASE_URL}${clean.startsWith('/') ? clean : `/${clean}`}`;
};

export const apiClient = {
  async get(endpoint, headers = {}) {
    return handleResponse(await executeFetch(buildUrl(endpoint), { method: 'GET', headers }));
  },
  async post(endpoint, body, headers = {}) {
    return handleResponse(await executeFetch(buildUrl(endpoint), { method: 'POST', headers, body: JSON.stringify(body) }));
  },
  async put(endpoint, body, headers = {}) {
    return handleResponse(await executeFetch(buildUrl(endpoint), { method: 'PUT', headers, body: JSON.stringify(body) }));
  },
  async delete(endpoint, headers = {}) {
    return handleResponse(await executeFetch(buildUrl(endpoint), { method: 'DELETE', headers }));
  },
  async fetchWithAuth(url, options = {}) {
    const target = url.startsWith('http') ? url : buildUrl(url);
    return executeFetch(target, options);
  },
};
