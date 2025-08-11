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

  // Función para limpiar tokens corruptos
  const cleanCorruptedTokens = () => {
    const localToken = localStorage.getItem('token');
    
    // Verificar localStorage
    if (localToken && (localToken === 'null' || localToken === 'undefined' || localToken === null || !localToken.includes('.'))) {
      console.warn('Token corrupto detectado en localStorage, limpiando...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
    }
    
    // Limpiar cualquier resto de sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('refreshToken');
  };

  // Agregar función para verificar y limpiar tokens corruptos
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      console.log("AuthContext: Checking auth...");
      
      // Primero limpiar cualquier token corrupto
      cleanCorruptedTokens();
      
      // Comprobar si hay tokens almacenados después de la limpieza
      const localToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const finalToken = localToken;
      
      if (!finalToken) {
        console.log("AuthContext: No token found");
        setUser(null);
        setToken(null);
        return;
      }
      
      // Verificar que el token tenga formato válido antes de usarlo
      const isValidJwt = (token: string) => {
        return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/.test(token);
      };
      
      if (!isValidJwt(finalToken)) {
        console.error("AuthContext: Malformed JWT detected, forcing logout");
        cleanCorruptedTokens();
        setUser(null);
        setToken(null);
        return;
      }
      
      if (storedUser) {
        try {
          // Restaurar usuario de localStorage mientras verificamos
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(finalToken);
          console.log("AuthContext: User restored from localStorage", parsedUser);
        } catch (e) {
          console.error("AuthContext: Error parsing stored user", e);
        }
      }
      
      // Intentar obtener información del usuario usando el token
      console.log("AuthContext: Verifying with server...");
      const response = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${finalToken}`
        }
      });
      
      if (response.data && response.data.user) {
        console.log("AuthContext: Server verification successful", response.data.user);
        setUser(response.data.user);
        setToken(finalToken);
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
    } catch (error: any) {
      console.error('AuthContext: Error checking authentication', error);

      // Si el error es por JWT inválido, forzar logout
      if (
        error?.response?.data?.message?.toLowerCase?.().includes('jwt') ||
        error?.response?.data?.error?.toLowerCase?.().includes('jwt')
      ) {
        logout();
        return;
      }
      
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

  // Forzar verificación de token al montar el componente 
  useEffect(() => {
    // Limpiar tokens corruptos inmediatamente
    cleanCorruptedTokens();
    
    // Verificar formato del token después de la limpieza
    const localToken = localStorage.getItem('token');
    
    if (localToken && !/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/.test(localToken)) {
      console.error("Token malformado en localStorage después de limpieza, eliminando");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    checkAuth();
  }, []);

  // Restaurar inmediatamente los datos de localStorage al montar
  useEffect(() => {
    const restoreAuthState = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
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
        // Obtener token de localStorage únicamente
        const currentToken = localStorage.getItem('token') || token;
        
        if (currentToken && !config.url?.includes('/auth/login') && !config.url?.includes('/auth/register')) {
          config.headers.Authorization = `Bearer ${currentToken}`;
          console.log(`[AuthContext] Token agregado a solicitud ${config.url}:`, currentToken.substring(0, 20) + '...');
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
      
      const response = await api.post("/auth/login", { username, password });
      
      if (response.data.success) {
        const { token, refreshToken, user } = response.data;
        
        console.log("Login exitoso, configurando estado...");
        
        // SIEMPRE usar localStorage (sin importar rememberMe)
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        console.log("Token guardado en localStorage");
        
        // Configurar token en axios inmediatamente
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Luego establecer estado local
        setUser(user);
        setToken(token);
        
        // Pequeña pausa para asegurar que todo se establezca correctamente
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log("Login completamente configurado:", user);
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

  const logout = async () => {
    try {
      // Intentar revocar el token en el servidor
      const token = localStorage.getItem('token');
      if (token) {
        await api.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => {
          // Si falla, continuar con logout local
          console.warn('Error al notificar logout al servidor:', err);
        });
      }
    } catch (error) {
      console.warn('Error durante logout en servidor:', error);
    } finally {
      // Limpiar estado local siempre
      setUser(null);
      setToken(null);
      
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Limpiar sessionStorage (por si acaso)
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      
      // Limpiar headers de axios
      delete api.defaults.headers.common['Authorization'];
      
      // Limpiar caché del navegador
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      
      console.log('Logout completado');
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
