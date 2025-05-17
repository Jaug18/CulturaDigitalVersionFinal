import api from './api';

export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      throw error;
    }
  },
  // ...otros métodos
};
