import axios from 'axios';
import toast from 'react-hot-toast';
import { triggerServerWaking } from '../context/ServerStatusContext';

const TOKEN_KEY = 'kisanmandi_token';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60000, // 60 seconds for Render free tier wake-ups
});

// Active pending requests counter
let pendingRequestsCount = 0;

// Request interceptor — attach JWT token and set up 4s slow-request timer
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
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
  // Network errors or timeout
  if (!error.response || error.code === 'ECONNABORTED' || error.message?.includes('timeout') || error.message?.includes('Network Error')) {
    return true;
  }
  // Bad gateway / service unavailable / gateway timeout from reverse proxy
  const status = error.response.status;
  return status === 502 || status === 503 || status === 504;
}

// Response interceptor — handle retries, 401/403, and server waking state
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

    // Friendly error messaging for timeouts or connection issues
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.friendlyMessage = 'Server request timed out. The server might still be waking up. Please try again.';
    } else if (!error.response && error.message?.includes('Network Error')) {
      error.friendlyMessage = 'Cannot connect to the server. Please check your internet connection.';
    }

    // Handle HTTP status codes
    if (error.response) {
      const { status } = error.response;
      const url = config.url || '';

      if (status === 401) {
        const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register');
        if (!isAuthRequest) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('kisanmandi_user');
          window.location.href = '/login';
        }
      } else if (status === 403) {
        toast.error('You do not have permission to perform this action.');
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
