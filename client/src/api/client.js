import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skill_relay_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not on login page, can clear token
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        // Optional: clear if token expired
      }
    }
    return Promise.reject(error);
  }
);

export default api;
