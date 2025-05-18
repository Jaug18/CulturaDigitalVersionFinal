import axios from 'axios';

// Crear instancia de axios con baseURL fija
const api = axios.create({
  baseURL: 'https://culturadigitalversionfinal-production.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000
});

// Interceptor mínimo para agregar el token si existe
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
