import axios from 'axios';

// Configuración dinámica de la baseURL
const getBaseURL = () => {
  // En producción, usar la URL actual sin puerto específico
  if (import.meta.env.PROD) {
    return `${window.location.protocol}//${window.location.host}`;
  }
  
  // En desarrollo, usar string vacío para que el proxy de Vite funcione
  return '';
};

// Crear instancia de axios con baseURL dinámica
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Aumentado para mejor experiencia en producción
  withCredentials: true, // Cambiado a true para que coincida con el servidor
});

// Interceptor para agregar el token y manejar rutas API
api.interceptors.request.use(
  config => {
    // En desarrollo, siempre agregar /api al inicio si no está presente
    if (
      !import.meta.env.PROD && 
      config.url &&
      !config.url.startsWith('/api/') &&
      !config.url.startsWith('http')
    ) {
      config.url = '/api' + (config.url.startsWith('/') ? config.url : '/' + config.url);
    }
    
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
