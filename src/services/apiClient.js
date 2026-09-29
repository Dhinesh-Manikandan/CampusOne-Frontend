// Centralized API Client for Gather Backend (Spring Boot API integration)
const RAW_BASE_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_API_BASE_URL || import.meta.env.REACT_APP_API_BASE_URL)) ||
  'http://localhost:8080'
).replace(/\/+$/, '');

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
  const token = localStorage.getItem(KEYS.TOKEN) || localStorage.getItem('token') || localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleAuthSessionExpired = () => {
  localStorage.removeItem(KEYS.TOKEN);
  localStorage.removeItem(KEYS.REFRESH_TOKEN);
  localStorage.removeItem(KEYS.USER);
  localStorage.removeItem('token');
  localStorage.removeItem('accessToken');
  window.dispatchEvent(new Event('gather_session_expired'));
};

// ── Build a clean endpoint URL, ensuring /api is properly handled ──
const buildUrl = (endpoint) => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (RAW_BASE_URL.endsWith('/api')) {
    const cleanPath = path.startsWith('/api/') ? path.substring(4) : (path === '/api' ? '' : path);
    return `${RAW_BASE_URL}${cleanPath}`;
  }

  const apiPath = path.startsWith('/api/') || path === '/api' ? path : `/api${path}`;
  return `${RAW_BASE_URL}${apiPath}`;
};

export const refreshTokenApi = async () => {
  const refreshToken = localStorage.getItem(KEYS.REFRESH_TOKEN);
  if (!refreshToken) throw new Error('No refresh token available');

  const response = await fetch(buildUrl('/auth/refresh'), {
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

  if (response.status === 401 && !isAuthEndpoint) {
    const hasRefreshToken = !!localStorage.getItem(KEYS.REFRESH_TOKEN);
    if (!hasRefreshToken) {
      handleAuthSessionExpired();
      const err = new Error('Session expired or unauthorized. Please log in again.');
      err.status = 401;
      throw err;
    }

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
