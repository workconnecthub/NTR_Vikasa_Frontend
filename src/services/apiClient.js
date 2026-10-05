import axios from 'axios';

// Base API URL from environment variable with fallback
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

// Token Storage Keys
export const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN: 'ntr_access_token',
  REFRESH_TOKEN: 'ntr_refresh_token',
  USER_ROLE: 'ntr_user_role',
  AUTH_USER: 'ntr_auth_user',
};

// Create Axios Instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Flag to track ongoing refresh to avoid race conditions
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ── Request Interceptor: Attach Authorization Bearer Header ───────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If sending FormData (e.g. for recruiter upload), let browser set Content-Type with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: 401 Refresh Handling & Error Parsing ────────────────
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Token Expiration)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Do not try to refresh if the request was to login or refresh itself
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        clearAuthStorage();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Direct call to refresh endpoint bypassing interceptor to prevent loops
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: new_refresh_token, user } = refreshResponse.data;

        localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, access_token);
        if (new_refresh_token) {
          localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, new_refresh_token);
        }
        if (user) {
          localStorage.setItem(TOKEN_STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
        }

        apiClient.defaults.headers.common.Authorization = `Bearer ${access_token}`;
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        processQueue(null, access_token);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthStorage();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login?session_expired=true';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Helper: Clear Authentication Storage ──────────────────────────────────────
export function clearAuthStorage() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.USER_ROLE);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.AUTH_USER);
  } catch (e) {
    // ignore
  }
}

// ── Helper: Extract User-Friendly Message from FastAPI Errors ──────────────────
export function parseApiError(error) {
  if (!error) return 'An unexpected error occurred. Please try again.';

  if (error.response?.data) {
    const data = error.response.data;

    // FastAPI 422 Validation Error structure: detail = [{ loc, msg, type }]
    if (Array.isArray(data.detail)) {
      const messages = data.detail.map((err) => {
        const field = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : 'field';
        const formattedField = field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        return `${formattedField}: ${err.msg}`;
      });
      return messages.join('. ');
    }

    // Standard detail string (400, 401, 403, 404, 409, 500)
    if (typeof data.detail === 'string') {
      return data.detail;
    }

    if (data.message && typeof data.message === 'string') {
      return data.message;
    }
  }

  // Network / Connection Error
  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    return 'Cannot connect to NTR VIKASA server. Please ensure the backend is running.';
  }

  if (error.message) {
    return error.message;
  }

  return 'Server communication error. Please try again.';
}

export default apiClient;
