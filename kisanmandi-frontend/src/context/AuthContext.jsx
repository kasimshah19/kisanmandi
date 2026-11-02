import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  login as loginApi,
  register as registerApi,
  getMe,
  logout as logoutApi,
  logoutAll as logoutAllApi,
  changePassword as changePasswordApi,
} from '../services/authService';
import { executeTokenRefresh } from '../services/axiosInstance';
import { setToken, clearToken, getToken, isTokenExpiringSoon } from '../utils/tokenStore';
import { broadcastAuthEvent, subscribeAuthEvents } from '../utils/authBroadcast';

const USER_KEY = 'kisanmandi_user';
const LEGACY_TOKEN_KEY = 'kisanmandi_token';

export const AuthContext = createContext(null);

// Helper: returns the correct dashboard path based on user role
export function getDashboardPath(role) {
  switch (role) {
    case 'FARMER':  return '/farmer/dashboard';
    case 'CUSTOMER': return '/customer/dashboard';
    case 'ADMIN':   return '/admin/dashboard';
    default:        return '/';
  }
}

export function AuthProvider({ children }) {
  // Purge legacy token on startup
  try {
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {
    // Storage access unavailable
  }

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setTokenState] = useState(() => getToken());
  const [loading, setLoading] = useState(true);
  const proactiveTimerRef = useRef(null);

  // Restore session via httpOnly cookie on startup
  const restoreSession = useCallback(async () => {
    try {
      const refreshResult = await executeTokenRefresh();
      if (refreshResult?.token) {
        setToken(refreshResult.token, refreshResult.expiresIn || 900);
        setTokenState(refreshResult.token);
        if (refreshResult.name) {
          setUser(refreshResult);
          localStorage.setItem(USER_KEY, JSON.stringify(refreshResult));
        } else {
          try {
            const me = await getMe();
            setUser(me);
            localStorage.setItem(USER_KEY, JSON.stringify(me));
          } catch {
            // Keep existing non-sensitive display user if getMe fails
          }
        }
      }
    } catch {
      clearToken();
      setTokenState(null);
      setUser(null);
      localStorage.removeItem(USER_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Multi-tab synchronization
  useEffect(() => {
    const unsubscribe = subscribeAuthEvents((event) => {
      if (event.type === 'logout') {
        clearToken();
        setTokenState(null);
        setUser(null);
        localStorage.removeItem(USER_KEY);
      } else if (event.type === 'login' || event.type === 'password_changed') {
        restoreSession();
      }
    });
    return unsubscribe;
  }, [restoreSession]);

  // Proactive token refresh check (~60s before expiry and on tab focus)
  const checkAndRefreshToken = useCallback(async () => {
    if (document.visibilityState === 'visible' && getToken() && isTokenExpiringSoon(60)) {
      try {
        const refreshResult = await executeTokenRefresh();
        if (refreshResult?.token) {
          setTokenState(refreshResult.token);
        }
      } catch {
        // Silent failure: will retry or let request interceptor handle
      }
    }
  }, []);

  useEffect(() => {
    proactiveTimerRef.current = setInterval(checkAndRefreshToken, 20000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndRefreshToken();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      if (proactiveTimerRef.current) clearInterval(proactiveTimerRef.current);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [checkAndRefreshToken]);

  // Login: authenticate, receive token and expiresIn, store in memory
  const login = async (credentials) => {
    const data = await loginApi(credentials);
    setToken(data.token, data.expiresIn || 900);
    setTokenState(data.token);
    setUser(data);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    broadcastAuthEvent('login', { userId: data.id });
    return data;
  };

  // Register: calls API
  const register = async (data) => {
    return await registerApi(data);
  };

  // Change Password
  const changePassword = async (currentPassword, newPassword) => {
    const data = await changePasswordApi(currentPassword, newPassword);
    if (data?.token) {
      setToken(data.token, data.expiresIn || 900);
      setTokenState(data.token);
      setUser((prev) => ({ ...prev, ...data }));
      localStorage.setItem(USER_KEY, JSON.stringify({ ...user, ...data }));
    }
    broadcastAuthEvent('password_changed');
    return data;
  };

  // Update user state partially
  const updateUser = (patch) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...patch };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Logout current session (revokes refresh token family and clears cookie)
  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore network errors
    }
    clearToken();
    setTokenState(null);
    setUser(null);
    localStorage.removeItem(USER_KEY);
    broadcastAuthEvent('logout');
  };

  // Logout from all devices
  const logoutAll = async () => {
    try {
      await logoutAllApi();
    } catch {
      // Ignore network errors
    }
    clearToken();
    setTokenState(null);
    setUser(null);
    localStorage.removeItem(USER_KEY);
    broadcastAuthEvent('logout');
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        logoutAll,
        changePassword,
        updateUser,
        isAuthenticated,
        getDashboardPath,
        restoreSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context easily
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
