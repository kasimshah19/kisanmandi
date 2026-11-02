import axios from 'axios';
import toast from 'react-hot-toast';
import { triggerServerWaking } from '../context/ServerStatusContext';
import { showReferenceToast } from '../components/ui/ReferenceToast';
import { captureException } from '../utils/sentry';
import { getToken, setToken, clearToken } from '../utils/tokenStore';
import { broadcastAuthEvent } from '../utils/authBroadcast';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, // Send httpOnly refresh cookie across same-origin proxy
  timeout: 60000, // 60 seconds for Render free tier wake-ups
});

// Active pending requests counter
let pendingRequestsCount = 0;

// Shared single-flight refresh promise
let refreshPromise = null;

export const executeTokenRefresh = async () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const normalizedBase = apiBaseUrl.replace(/\/+$/, '');
        const response = await axios.post(
          `${normalizedBase}/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: {
              'X-Requested-With': 'km-web',
            },
          }
        );
        const data = response.data;
        if (data?.token) {
          setToken(data.token, data.expiresIn || 900);
        }
        return data;
      } catch (err) {
        clearToken();
        localStorage.removeItem('kisanmandi_user');
        broadcastAuthEvent('logout');
        throw err;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
};

// Request interceptor — attach JWT bearer token and CSRF defense header
axiosInstance.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    config.headers['X-Requested-With'] = 'km-web';

    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    pendingRequestsCount++;

    // If request takes longer than 4 seconds, show the waking server banner
    config._wakingTimer = setTimeout(() => {
      triggerServerWaking(true);
    }, 4000);

    return config;
  },
  (error) => {
    pendingRequestsCount = Math.max(0, pendingRequestsCount - 1);
    return Promise.reject(error);
  }
);

// Helper to determine if an error is a candidate for cold-start retry
function isRetryableError(error) {
  if (!error) return false;
  if (!error.response || error.code === 'ECONNABORTED' || error.message?.includes('timeout') || error.message?.includes('Network Error')) {
    return true;
  }
  const status = error.response.status;
  return status === 502 || status === 503 || status === 504;
}

// Response interceptor — handle single-flight refresh on 401, retries, and errors
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.config?._wakingTimer) {
      clearTimeout(response.config._wakingTimer);
    }
    pendingRequestsCount = Math.max(0, pendingRequestsCount - 1);
    if (pendingRequestsCount === 0) {
      triggerServerWaking(false);
    }
    return response;
  },
  async (error) => {
    const config = error.config || {};
    if (config._wakingTimer) {
      clearTimeout(config._wakingTimer);
    }

    pendingRequestsCount = Math.max(0, pendingRequestsCount - 1);

    const method = (config.method || 'get').toUpperCase();
    const isGet = method === 'GET';
    const retryCount = config._retryCount || 0;

    // Retry only idempotent GET requests up to 2 times on network error / timeout / 502 / 503 / 504
    if (isGet && isRetryableError(error) && retryCount < 2) {
      config._retryCount = retryCount + 1;
      triggerServerWaking(true);

      const delayMs = config._retryCount === 1 ? 2000 : 5000;
      await new Promise((resolve) => setTimeout(resolve, delayMs));

      return axiosInstance(config);
    }

    // If all requests completed, clear waking banner
    if (pendingRequestsCount === 0) {
      triggerServerWaking(false);
    }

    // Attach X-Request-Id from response headers or error response body
    const requestId =
      error.response?.headers?.['x-request-id'] ||
      error.response?.headers?.['X-Request-Id'] ||
      error.response?.data?.requestId;
    if (requestId) {
      error.requestId = requestId;
    }

    if (error.response) {
      const { status } = error.response;
      const url = config.url || '';
      const isAuthCall =
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/logout');

      // 401 on protected endpoint -> Single-flight refresh token rotation
      if (status === 401 && !isAuthCall && !config._retryAfterRefresh) {
        config._retryAfterRefresh = true;
        try {
          const refreshResult = await executeTokenRefresh();
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${refreshResult.token}`;
          return axiosInstance(config);
        } catch (refreshError) {
          if (window.location.pathname !== '/login') {
            const currentPath = window.location.pathname + window.location.search;
            window.location.href = `/login?from=${encodeURIComponent(currentPath)}`;
          }
          return Promise.reject(refreshError);
        }
      }

      if (status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else if (status >= 500) {
        showReferenceToast(requestId);
        captureException(error, { tags: { requestId } });
      }
    } else {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        error.friendlyMessage = 'Server request timed out. The server might still be waking up. Please try again.';
      } else if (error.message?.includes('Network Error')) {
        error.friendlyMessage = 'Cannot connect to the server. Please check your internet connection.';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
