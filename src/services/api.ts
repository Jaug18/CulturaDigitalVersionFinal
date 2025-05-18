import axios from 'axios';

// Crear instancia de axios con baseURL fija
const api = axios.create({
  baseURL: 'https://culturadigitalversionfinal-production.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000
});

// Interceptor para agregar el token y forzar el prefijo /api/ solo si corresponde
api.interceptors.request.use(
  config => {
    // Solo agregar /api si la url es relativa y no empieza por /api ni es absoluta
    if (
      config.url &&
      !config.url.startsWith('/api/') &&
      !config.url.startsWith('http')
    ) {
      config.url = '/api' + (config.url.startsWith('/') ? config.url : '/' + config.url);
    }
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
