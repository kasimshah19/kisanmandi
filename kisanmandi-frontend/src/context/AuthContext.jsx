import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, register as registerApi, getMe } from '../services/authService';

const TOKEN_KEY = 'kisanmandi_token';
const USER_KEY = 'kisanmandi_user';

const AuthContext = createContext(null);

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
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app start, restore user & token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser  = localStorage.getItem(USER_KEY);

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object') {
          setToken(savedToken);
          setUser(parsed);
        } else {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      } catch (e) {
        console.warn('Corrupted session data in localStorage, clearing auth state.', e);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Login: call API, store token + user, return user info
  const login = async (credentials) => {
    const data = await loginApi(credentials);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    setToken(data.token);
    setUser(data);
    return data;
  };

  // Register: just calls API (user must then log in separately)
  const register = async (data) => {
    const result = await registerApi(data);
    return result;
  };

  // Logout: clear everything
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated, getDashboardPath }}>
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

export { AuthContext };
