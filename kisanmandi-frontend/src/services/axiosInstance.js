import axios from 'axios';
import toast from 'react-hot-toast';

const TOKEN_KEY = 'kisanmandi_token';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Request interceptor — attach JWT token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 and 403 globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, config } = error.response;
      const url = config?.url || '';

      if (status === 401) {
        // Don't redirect/clear if the failing request is login or register
        // (otherwise wrong password errors cause a reload loop)
        const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register');
        if (!isAuthRequest) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('kisanmandi_user');
          window.location.href = '/login';
        }
      } else if (status === 403) {
        toast.error('You do not have permission');
      }
    }
    // Always reject so the calling component can also handle the error
    return Promise.reject(error);
  }
);

export default axiosInstance;
