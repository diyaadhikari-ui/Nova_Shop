import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('nova_token');
    const savedUser = localStorage.getItem('nova_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token, refreshToken) => {
    localStorage.setItem('nova_token', token);
    localStorage.setItem('nova_refresh_token', refreshToken);
    localStorage.setItem('nova_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('nova_token');
    localStorage.removeItem('nova_refresh_token');
    localStorage.removeItem('nova_user');
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'admin' || user?.role === 'gallery_admin';
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout, isAdmin,
      isLoggedIn: !!user
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};