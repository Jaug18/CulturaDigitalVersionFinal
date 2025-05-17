import axios from 'axios';

// Determinar la URL base de la API según el entorno
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const isProduction = process.env.NODE_ENV === 'production' || !hostname.includes('localhost');
  
  console.log("API Service - Environment:", isProduction ? "PRODUCTION" : "DEVELOPMENT");
  console.log("API Service - Hostname:", hostname);
  
  // Si estamos en Railway (todo en uno), usamos ruta relativa
  if (hostname.includes('railway.app')) {
    return '/api';
  }
  
  // Si estamos en Vercel, necesitamos la URL completa de Railway
  if (isProduction) {
    return 'https://culturadigitalversionfinal-production.up.railway.app/api';
  }
  
  // En desarrollo local usamos ruta relativa
  return '/api';
};

// Configuración base de axios
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configurar interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
