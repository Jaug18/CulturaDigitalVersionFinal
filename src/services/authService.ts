import api from './api';

// Interfaces para los tipos de datos
interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  user?: any;
  message?: string;
  token?: string;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response: ApiResponse<AuthResponse> = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      throw error;
    }
  },
  // ...otros métodos
};
