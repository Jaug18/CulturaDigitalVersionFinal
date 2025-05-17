function ensureAuthenticated(req, res, next) {
    // Lista de rutas públicas que no requieren autenticación
    const publicRoutes = ['/login', '/register', '/css', '/js', '/images', '/favicon.ico'];
    
    // Verificar si la ruta actual está en la lista de rutas públicas
    const isPublicRoute = publicRoutes.some(route => 
        req.path === route || req.path.startsWith(route + '/'));
    
    // Si es una ruta pública o el usuario ya tiene sesión, permitir el acceso
    if (isPublicRoute || (req.session && req.session.user)) {
        return next();
    } else {
        // Redirigir al login para todas las demás rutas
        return res.redirect('/login');
    }
}

module.exports = ensureAuthenticated;