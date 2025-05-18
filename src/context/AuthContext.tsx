import React, { createContext, useContext, useState, useEffect } from 'react';
import api from "@/services/api";
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  fullName?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  register: (
    username: string, 
    email: string, 
    password: string, 
    fullName: string, 
    role?: string,
    isActive?: boolean,
    avatarUrl?: string
  ) => Promise<{ success: boolean; message: string; user?: User }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticación con manejo de errores mejorado
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      console.log("AuthContext: Checking auth...");
      
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!token) {
        console.log("AuthContext: No token found");
        setUser(null);
        setToken(null);
        return;
      }
      
      if (storedUser) {
        try {
          // Restaurar usuario de localStorage mientras verificamos
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(token);
          console.log("AuthContext: User restored from localStorage", parsedUser);
        } catch (e) {
          console.error("AuthContext: Error parsing stored user", e);
        }
      }
      
      // Intentar obtener información del usuario usando el token
      console.log("AuthContext: Verifying with server...");
      const response = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.user) {
        console.log("AuthContext: Server verification successful", response.data.user);
        setUser(response.data.user);
        setToken(token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        console.log("AuthContext: Server response missing user data");
        // Importante: NO limpiamos el usuario ni el token si ya fue restaurado de localStorage
        if (!storedUser) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('AuthContext: Error checking authentication', error);
      
      // CRÍTICO: No limpiar datos si hay un error de red
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        console.log("AuthContext: Keeping localStorage auth data during network error");
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } catch (e) {
          console.error("AuthContext: Error parsing stored user during error recovery", e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Restaurar inmediatamente los datos de localStorage al montar
 useEffect(() => {
  const restoreAuthState = () => {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        return true;
        } catch (error) {
          console.error('AuthContext: Error restoring auth data', error);
        }
      }
      return false;
    };
    
    // Primero restauramos inmediatamente desde localStorage
    const hasRestoredState = restoreAuthState();
    
    // Luego verificamos con el servidor en segundo plano (pero ya mostramos UI autenticada)
    if (hasRestoredState) {
      console.log("AuthContext: Checking with server after localStorage restore");
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Configurar interceptor de Axios para incluir token en solicitudes
  useEffect(() => {
    const interceptor = api.interceptors.request.use(
      config => {
        const currentToken = localStorage.getItem('token') || token;
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [token]);

const login = async (username: string, password: string, rememberMe?: boolean) => {
  try {
    console.log("Intentando iniciar sesión con:", username);
    
    // CRÍTICO: Crear petición con URL absolutamente correcta como fallback
    let response;
    try {
      // Intentar primero con el cliente api configurado
      response = await api.post("/auth/login", { username, password });
    } catch (error) {
      console.error("Error en primera petición, intentando con URL absoluta:", error);
      
      // Si falla, intentar directamente con axios y URL absoluta
      const backupUrl = 'https://culturadigitalversionfinal-production.up.railway.app/api/auth/login';
      console.log("Intentando con URL de respaldo:", backupUrl);
      
      response = await axios.post(backupUrl, { username, password }, {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (response.data.success) {
      const { token, refreshToken, user } = response.data;
      
      // Guardar tokens y datos de usuario
      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("refreshToken", refreshToken);
        sessionStorage.setItem("user", JSON.stringify(user));
      }
      
      setUser(user);
      setToken(token);
      
      console.log("Login exitoso:", user);
    } else {
      console.error("Error de login:", response.data.message);
      throw new Error(response.data.message || 'Error de autenticación');
    }
  } catch (error) {
    console.error("Error de conexión con el servidor:", error);
    throw error;
  }
};

  const register = async (
    username: string, 
    email: string, 
    password: string, 
    fullName: string, 
    role: string = "user",
    isActive: boolean = true,
    avatarUrl: string = ""
  ) => {
    try {
      console.log("Registrando usuario:", { username, email, fullName, role, isActive, avatarUrl });
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
        full_name: fullName,
        role,
        is_active: isActive,
        avatar_url: avatarUrl
      });
      
      console.log("Respuesta del servidor:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };

  const logout = () => {
    // Limpiar estado
    setUser(null);
    setToken(null);
    
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Limpiar token en api
    delete api.defaults.headers.common['Authorization'];
    
    // Limpiar cualquier caché de datos
    // Esto es crucial para evitar que datos de un usuario aparezcan para otro
    sessionStorage.clear();
    
    // Purgar caché de API
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        isLoading,
        checkAuth,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
