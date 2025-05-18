import axios from 'axios';

// Versión ultra simplificada y segura
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000
});

// Añadir intercepción básica
api.interceptors.request.use(
  config => {
    // Determinar la URL base correcta según el entorno
    const hostname = window?.location?.hostname || '';
    
    // Ajustar baseURL según el entorno
    if (!hostname.includes('railway.app')) {
      // Si no estamos en Railway, usar la URL absoluta
      config.baseURL = 'https://culturadigitalversionfinal-production.up.railway.app/api';
    }
    
    // Agregar el token si existe
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log simplificado
    console.log('Request:', config.method, config.baseURL + config.url);
    
    return config;
  },
  error => Promise.reject(error)
);

export default api;
