import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Bell, Users, Settings, User, LogOut, ChevronDown } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface NavbarProps {
  className?: string;
}

const Navbar = ({ className }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, checkAuth } = useAuth();
  
  // Estado local para manejar lo que se muestra durante la carga
  const [localUser, setLocalUser] = useState<any>(null);
  const [showUserUI, setShowUserUI] = useState(false);
  
  // Cargar datos locales inmediatamente - SIN validación estricta del token
  useEffect(() => {
    try {
      // Verificar si hay token y usuario en localStorage
      const token = localStorage.getItem('token');
      const storedUserData = localStorage.getItem('user');
      
      // Si hay datos de usuario almacenados, mostrarlos inmediatamente
      if (storedUserData) {
        try {
          const parsedUser = JSON.parse(storedUserData);
          setLocalUser(parsedUser);
          setShowUserUI(true);
        } catch (e) {
          console.error('Error al parsear datos de usuario:', e);
        }
      }
    } catch (error) {
      console.error('Error al inicializar datos de usuario:', error);
    }
  }, []);
  
  // Efecto para mantener el localUser sincronizado con el usuario del contexto
  useEffect(() => {
    if (user) {
      setLocalUser(user);
      setShowUserUI(true);
    }
  }, [user]);
  
  // Asegurarse de verificar la autenticación cuando se monta el componente
  // pero NO limpiamos el token si parece inválido - dejamos que el servidor decida
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Si hay un token y no estamos autenticados, verificar
    if (token && !isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated, checkAuth]);
  
  // Función de depuración para mostrar el estado actual en la consola
  useEffect(() => {
    console.log('Estado de autenticación Navbar:', { 
      isAuthenticated, 
      user, 
      localUser, 
      showUserUI,
      hasToken: !!localStorage.getItem('token'),
      hasStoredUser: !!localStorage.getItem('user')
    });
  }, [isAuthenticated, user, localUser, showUserUI]);
  
  const handleLogout = () => {
    // Limpiar todos los datos locales
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    
    // Limpiar datos en memoria
    sessionStorage.clear();
    
    // Redirigir a login
    window.location.href = '/login';
  };
  
  // Función para obtener las iniciales del usuario para el Avatar
  const getUserInitials = () => {
    const userToUse = user || localUser;
    if (!userToUse) return "U";
    
    if (userToUse.fullName) {
      const nameParts = userToUse.fullName.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return userToUse.fullName.substring(0, 2).toUpperCase();
    }
    
    return userToUse.username.substring(0, 2).toUpperCase();
  };
  
  // Determinar qué usuario mostrar (prioridad al del contexto, luego el local)
  const displayUser = user || localUser;
  
  return (
    <div className={cn("w-full bg-gradient-to-r from-[#0052A5] to-[#0066CC] text-white shadow-md px-4 py-2", className)}>
      <div className="container mx-auto flex items-center justify-between">
      {/* <div className="flex justify-end items-center">
      <img 
        src="../../public/drilldown.png" 
        alt="Cultura Digital Logo" 
        className="h-20"
      />
    </div> */}
        <span className="text-lg font-bold hidden md:block">Programa de Cultura Digital</span>

        <NavigationMenu className="mx-auto">
          <NavigationMenuList className="flex gap-4">
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/20 text-white",
                location.pathname === '/' && "bg-white/20"
              )}>
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  <span>Inicio</span>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/20 text-white",
                location.pathname === '/notifications' && "bg-white/20"
              )}>
                <Link to="/notifications">
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notificaciones</span>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-white/20 text-white",
                location.pathname === '/contacts' && "bg-white/20"
              )}>
                <Link to="/contacts">
                  <Users className="mr-2 h-4 w-4" />
                  Contactos
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        
        {/* Usar showUserUI como primera condición para evitar parpadeo */}
        {(showUserUI && displayUser) ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center space-x-2 focus:outline-none">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full hover:bg-white/20 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={displayUser.avatarUrl} alt={displayUser.username} />
                  <AvatarFallback className="bg-white/20 text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block text-sm font-medium">
                  {displayUser.fullName || displayUser.username}
                </span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium">{displayUser.fullName || displayUser.username}</p>
                <p className="text-xs text-gray-500">{displayUser.email}</p>
              </div>
              
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Mi Perfil</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </Link>
              </DropdownMenuItem>
              
              {/* Opción solo para administradores */}
              {user?.role === 'admin' && (
                <DropdownMenuItem asChild>
                  <Link to="/admin/users">
                    <Users className="mr-2 h-4 w-4" />
                    Administración de Usuarios
                  </Link>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/login" className="text-sm bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md">
            Iniciar Sesión
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;