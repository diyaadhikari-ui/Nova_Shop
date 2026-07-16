import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) fetchCart();
    else setItems([]);
  }, [isLoggedIn]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart');
      setItems(res.data.items || []);
    } catch (error) {
      console.error('Fetch cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (artworkId, variantId = null, quantity = 1) => {
    try {
      await api.post('/cart', { artworkId, variantId, quantity });
      await fetchCart();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity });
      await fetchCart();
    } catch (error) {
      console.error('Update quantity error:', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      await fetchCart();
    } catch (error) {
      console.error('Remove item error:', error);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setItems([]);
    } catch (error) {
      console.error('Clear cart error:', error);
    }
  };

  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.total_price || 0), 0
  );

  const itemCount = items.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  return (
    <CartContext.Provider value={{
      items, loading, subtotal, itemCount,
      fetchCart, addToCart, updateQuantity,
      removeItem, clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};