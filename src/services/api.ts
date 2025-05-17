import axios from 'axios';

// Determinar la URL base de la API según el entorno
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const isProduction = process.env.NODE_ENV === 'production' || !hostname.includes('localhost');
  
  console.log("API Service - Environment:", isProduction ? "PRODUCTION" : "DEVELOPMENT");
  console.log("API Service - Hostname:", hostname);
  
  let baseUrl = '/api';
  
  // Si estamos en Railway (todo en uno), usamos ruta relativa
  if (hostname.includes('railway.app')) {
    console.log("API Service - Using Railway config (relative URL)");
    baseUrl = '/api';
  }
  // Verifica si estamos en Vercel o cualquier otro dominio que no sea Railway
  else if (isProduction) {
    // FORZAR SIEMPRE la URL de Railway en producción
    console.log("API Service - FORCING Railway absolute URL");
    baseUrl = 'https://culturadigitalversionfinal-production.up.railway.app/api';
    console.log("API Service - Base URL (forced):", baseUrl);
    return baseUrl;
  }
  // En desarrollo local usamos ruta relativa
  else {
    console.log("API Service - Using local development config");
    baseUrl = '/api';
  }
  
  console.log("API Service - Base URL:", baseUrl);
  return baseUrl;
};

const baseURL = getApiBaseUrl();

// Configuración base de axios
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configurar interceptor para agregar token de autenticación y debug
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // IMPORTANTE: Validar que no haya prefijos duplicados
    if (config.url?.startsWith('/api') && config.baseURL?.endsWith('/api')) {
      // Eliminar el prefijo /api duplicado
      config.url = config.url.substring(4);
      console.log("Corrigiendo URL duplicada:", config.url);
    }
    
    // Mostrar la URL completa para depuración
    console.log(`Request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
