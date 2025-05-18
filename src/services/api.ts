import axios from 'axios';

// Crear instancia de axios con configuración básica fija
// Sin variables intermedias ni funciones que puedan causar inicializaciones prematuras
const api = axios.create({
  baseURL: '/api', // URL base por defecto
  headers: {
    'Content-Type': 'application/json',
  }
});

// No usar interceptores complejos - solo lo mínimo necesario
api.interceptors.request.use(function(config) {
  // Configuración dinámica muy simplificada
  try {
    // Usar URL absoluta solo si no estamos en Railway
    if (window.location.hostname && !window.location.hostname.includes('railway.app')) {
      config.baseURL = 'https://culturadigitalversionfinal-production.up.railway.app/api';
    }
    
    // Agregar token si existe
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.error('Error en interceptor:', e);
  }
  
  return config;
});

export default api;
