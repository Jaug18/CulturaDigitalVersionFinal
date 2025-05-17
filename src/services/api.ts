import axios from 'axios';

// Determinar la URL base simplificada
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  if (hostname.includes('railway.app')) {
    console.log("API Service - Railway detected - Using RELATIVE path");
    return '/api';
  } else {
    console.log("API Service - External hostname detected - Using ABSOLUTE Railway URL");
    return 'https://culturadigitalversionfinal-production.up.railway.app/api';
  }
};

// Crear instancia de axios con configuración básica
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000 // Tiempo de espera razonable
});

// Interceptor simplificado
api.interceptors.request.use(
  (config) => {
    // Obtener token de localStorage si existe
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Evitar duplicación de /api en la URL
    if (config.url && config.url.startsWith('/api') && config.baseURL && config.baseURL.endsWith('/api')) {
      config.url = config.url.substring(4);
    }
    
    // Log de depuración simplificado
    console.log(`Request to: ${config.baseURL}${config.url || ''}`);
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
