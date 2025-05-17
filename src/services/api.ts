import axios from 'axios';

// Forzar la URL base correcta (solución definitiva)
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // SOLUCIÓN DEFINITIVA: forzar la URL correcta independientemente del entorno
  if (hostname.includes('railway.app')) {
    console.log("API Service - Railway detected - Using RELATIVE path");
    return '/api';
  } else {
    // Para cualquier otro dominio (incluyendo vercel.app), forzar la URL absoluta de Railway
    console.log("API Service - External hostname detected - Using ABSOLUTE Railway URL");
    return 'https://culturadigitalversionfinal-production.up.railway.app/api';
  }
};

const baseURL = getApiBaseUrl();
console.log("API Service - Final baseURL:", baseURL);

// Configuración base de axios con URL forzada
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para asegurar URLs correctas y debugging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Evitar duplicación de /api en la URL
    if (config.url?.startsWith('/api') && config.baseURL?.endsWith('/api')) {
      config.url = config.url.substring(4);
    }
    
    // Mostrar la URL final completa para depuración
    const finalUrl = `${config.baseURL}${config.url}`;
    console.log(`Request to: ${finalUrl}`);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
