import axios from 'axios';

// Función para determinar la URL base de la API
const getApiBaseUrl = () => {
  const isProduction = 
    window.location.hostname === 'culturadigital.vercel.app' || 
    (window.location.hostname !== 'localhost' && 
     !window.location.hostname.includes('192.168.') && 
     !window.location.hostname.includes('127.0.0.1'));
  
  console.log("API Service - Environment:", isProduction ? "PRODUCTION" : "DEVELOPMENT");
  console.log("API Service - Hostname:", window.location.hostname);
  
  if (isProduction) {
    // La API en producción parece estar en una URL diferente
    // Usar la raíz de Vercel en lugar de /api
    return 'https://culturadigital.vercel.app';
  }
  
  // En desarrollo, usar la variable de entorno o localhost por defecto
  return import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
};

// Crear instancia de axios con la URL base
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para manejar errores comunes
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.code === 'ERR_NETWORK') {
      console.error('Error de conexión con el servidor:', error);
      console.log('URL base actual:', getApiBaseUrl());
    }
    return Promise.reject(error);
  }
);

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  config => {
    // Ajustar la ruta para producción si es necesario
    const isProduction = getApiBaseUrl() === 'https://culturadigital.vercel.app';
    
    if (isProduction && !config.url.startsWith('/api/')) {
      config.url = `/api${config.url.startsWith('/') ? config.url : '/' + config.url}`;
    }
    
    console.log('Request to:', config.baseURL + config.url);
    
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Compartir la instancia de axios
api.axios = axios;

export default api;
