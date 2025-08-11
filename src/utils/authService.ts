import api from '../services/api';
import axios from 'axios'; // Solo para isAxiosError

// Definición de interfaces
export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: string;
  emailVerified: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
  refreshToken: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  field?: string;
  validation?: Record<string, string>;
}

// Función para registrar usuario
export const registerUser = async (userData: { 
  username: string; 
  email: string; 
  password: string; 
  fullName?: string;
}): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/register', userData);
    
    // Guardar tokens en localStorage
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    
    // Establecer token en el encabezado de autorización para futuras solicitudes
    
    return response.data;
  } catch (error) {
    handleAuthError(error);
    throw error;
  }
};

// Función para iniciar sesión
export const loginUser = async (credentials: { 
  username: string; 
  password: string;
}): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    // Guardar tokens en localStorage
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    
    // Establecer token en el encabezado de autorización para futuras solicitudes
    
    return response.data;
  } catch (error) {
    handleAuthError(error);
    throw error;
  }
};

// Función para obtener perfil del usuario
export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get('/auth/me');
    return response.data.user;
  } catch (error) {
    // Si es error de autorización, intentar renovar el token
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      try {
        await refreshAuthToken();
        // Reintentar la solicitud
        const response = await api.get('/auth/me');
        return response.data.user;
      } catch (refreshError) {
        // Si falla la renovación, cerrar sesión
        logoutUser();
        throw refreshError;
      }
    }
    handleAuthError(error);
    throw error;
  }
};

// Función para cerrar sesión
export const logoutUser = async (): Promise<void> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken });
    }
  } catch (error) {
    console.error('Error al cerrar sesión en el servidor:', error);
  } finally {
    // Eliminar tokens del localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    
    // Eliminar token de los encabezados de solicitud
    delete api.defaults.headers.common['Authorization'];
  }
};

// Función para renovar el token
export const refreshAuthToken = async (): Promise<void> => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    throw new Error('No hay token de actualización disponible');
  }
  
  try {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    
    // Actualizar tokens en localStorage
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    
    // Actualizar token en los encabezados
  } catch (error) {
    // Si falla la renovación, eliminar tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    delete api.defaults.headers.common['Authorization'];
    
    handleAuthError(error);
    throw error;
  }
};

// Función para actualizar el perfil
export const updateProfile = async (profileData: {
  fullName?: string;
  avatarUrl?: string;
}): Promise<User> => {
  try {
    const response = await api.put('/auth/profile', profileData);
    return response.data.user;
  } catch (error) {
    handleAuthError(error);
    throw error;
  }
};

// Función para cambiar la contraseña
export const changePassword = async (passwordData: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ requireRelogin: boolean }> => {
  try {
    const response = await api.post('/auth/change-password', passwordData);
    return { requireRelogin: response.data.requireRelogin };
  } catch (error) {
    handleAuthError(error);
    throw error;
  }
};

// Función para solicitar restablecimiento de contraseña
export const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    handleAuthError(error);
    throw error;
  }
};

// Función para restablecer contraseña con token
export const resetPassword = async (resetData: {
  token: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  } catch (error) {
    handleAuthError(error);
    throw error;
  }
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  return !!token;
};

// Interceptor para manejar errores de token expirado
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 (No autorizado) y no es una solicitud de renovación de token
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url?.includes('/auth/refresh-token')) {
      originalRequest._retry = true;
      
      try {
        // Intentar renovar el token
        await refreshAuthToken();
        
        // Actualizar el token en la solicitud original
        originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('authToken')}`;
        
        // Reintentar la solicitud original
        return api(originalRequest);
      } catch (refreshError) {
        // Si falla la renovación, cerrar sesión
        logoutUser();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Función para manejar errores de autenticación
const handleAuthError = (error: any): void => {
  if (axios.isAxiosError(error) && error.response) {
    const data = error.response.data;
    
    // Registrar para depuración
    console.error('Error en autenticación:', {
      status: error.response.status,
      data
    });
    
    // Para errores 401/403, cerrar sesión si no es en endpoints de autenticación
    if ((error.response.status === 401 || error.response.status === 403) && 
        !error.config.url?.includes('/auth/')) {
      logoutUser();
    }
  } else {
    console.error('Error no controlado:', error);
  }
};
