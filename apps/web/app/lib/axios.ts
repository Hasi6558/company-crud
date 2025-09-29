import axios from 'axios';
import { parseCookies, destroyCookie } from 'nookies';

const api = axios.create({
  baseURL: 'http://localhost:4001',
  // Remove withCredentials since we're not using cookies anymore
});

// Add request interceptor to include token from localStorage
api.interceptors.request.use(
  (config) => {
    const cookies = parseCookies();
    const token = cookies.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      destroyCookie(null, 'token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
