import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Automatically add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nova_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle token expiry automatically
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nova_token');
      localStorage.removeItem('nova_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
