import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8190/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT Bearer Token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clinic_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('clinic_jwt_token');
      localStorage.removeItem('clinic_user');
      window.dispatchEvent(new Event('auth_change'));
    }
    return Promise.reject(error);
  }
);

export default api;
