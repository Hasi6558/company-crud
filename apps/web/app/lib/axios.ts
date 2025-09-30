import axios from 'axios';
import { parseCookies, destroyCookie } from 'nookies';

const api = axios.create({
  baseURL: 'http://localhost:4001',
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const cookies = parseCookies(); // read cookies on client
      const token = cookies.token; // "token" cookie
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        destroyCookie(null, 'token'); // remove cookie
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
