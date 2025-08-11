interface AuthenticatedRequest {
  path: string;
  session?: {
    user?: any;
  };
}

interface AuthResponse {
  redirect: (path: string) => void;
}

type NextFunction = () => void;

function ensureAuthenticated(req: AuthenticatedRequest, res: AuthResponse, next: NextFunction): void {
    // Lista de rutas públicas que no requieren autenticación
    const publicRoutes: string[] = ['/login', '/register', '/css', '/js', '/images', '/favicon.ico'];
    
    // Verificar si la ruta actual está en la lista de rutas públicas
    const isPublicRoute: boolean = publicRoutes.some(route => 
        req.path === route || req.path.startsWith(route + '/'));
    
    // Si es una ruta pública o el usuario ya tiene sesión, permitir el acceso
    if (isPublicRoute || (req.session && req.session.user)) {
        return next();
    } else {
        // Redirigir al login para todas las demás rutas
        res.redirect('/login');
    }
}

export default ensureAuthenticated;
