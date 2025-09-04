import axios from 'axios';

// Configuración dinámica de la baseURL
const getBaseURL = () => {
  // Si existe VITE_API_URL, usarla (para producción)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // En desarrollo local, usar string vacío para que el proxy de Vite funcione
  if (import.meta.env.DEV) {
    return '';
  }
  
  // Fallback para desarrollo
  return 'http://localhost:3000';
};

// Crear instancia de axios con baseURL dinámica
const baseURL = getBaseURL();
console.log(`[API] Configuración inicial - Base URL: ${baseURL}`);
console.log(`[API] Environment - PROD: ${import.meta.env.PROD}, DEV: ${import.meta.env.DEV}`);
console.log(`[API] VITE_API_URL: ${import.meta.env.VITE_API_URL}`);

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Aumentado para mejor experiencia en producción
  withCredentials: true, // Cambiado a true para que coincida con el servidor
});

// Interceptor para agregar el token y manejar rutas API
api.interceptors.request.use(
  config => {
    console.log(`[API] Request original URL: ${config.url}`);
    console.log(`[API] Base URL: ${config.baseURL}`);
    
    // Siempre agregar /api al inicio si no está presente (tanto en desarrollo como en producción)
    if (
      config.url &&
      !config.url.startsWith('/api/') &&
      !config.url.startsWith('http')
    ) {
      config.url = '/api' + (config.url.startsWith('/') ? config.url : '/' + config.url);
      console.log(`[API] URL modificada a: ${config.url}`);
    }
    
    console.log(`[API] Request final URL: ${config.url}`);
    console.log(`[API] Base URL: ${config.baseURL}`);
    
    // NO agregar token para rutas de autenticación
    const isAuthRoute = config.url?.includes('/auth/login') || 
                       config.url?.includes('/auth/register') || 
                       config.url?.includes('/auth/forgot-password') ||
                       config.url?.includes('/auth/reset-password');
    
    // Agregar token de autenticación solo si NO es una ruta de auth
    if (!isAuthRoute) {
      const token = localStorage.getItem('token'); // Solo localStorage
      // Verificar que el token sea válido antes de enviarlo
      if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`[API] Token enviado en headers para ${config.url}:`, token.substring(0, 20) + '...');
      } else {
        console.log(`[API] Token no válido o ausente para ${config.url}:`, token);
        // Limpiar tokens corruptos
        if (token === 'null' || token === 'undefined' || token === null) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Limpiar sessionStorage por si acaso
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
        }
      }
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor para manejar respuestas y errores de autenticación
api.interceptors.response.use(
  response => response,
  error => {
    console.log(`[API] Error en respuesta:`, error.response?.status, error.response?.data);
    
    // Si el token es inválido o expiró, limpiar localStorage y redirigir
    if (error.response?.status === 401) {
      console.log('[API] Error 401 detectado, limpiando tokens y redirigiendo');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Limpiar sessionStorage por si acaso
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      // Solo redirigir si no estamos ya en login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
