import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

// Provides cart count to the whole app (only loads for CUSTOMER role)
export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);

  // Fetch cart count from backend
  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
      setCartCount(0);
      return;
    }
    try {
      setCartLoading(true);
      const res = await cartService.get();
      setCartCount(res.data.itemCount || 0);
    } catch {
      setCartCount(0);
    } finally {
      setCartLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  // Load cart when customer logs in, reset on logout or role change
  useEffect(() => {
    if (isAuthenticated && user?.role === 'CUSTOMER') {
      refreshCart();
    } else {
      setCartCount(0);
    }
  }, [isAuthenticated, user?.role, refreshCart]);

  return (
    <CartContext.Provider value={{ cartCount, cartLoading, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook to access cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
