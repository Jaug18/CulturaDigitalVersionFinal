import axios from 'axios';

// Configuración base de axios
const api = axios.create({
  // En lugar de una URL absoluta, usamos una ruta relativa
  // esto funcionará tanto en desarrollo como en producción
  baseURL: '/api',
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
