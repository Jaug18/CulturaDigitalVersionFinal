import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Debug para diagnóstico
  console.log("ProtectedRoute - Auth Check:", { isAuthenticated, user, isLoading });

  // Si está cargando, mostrar un spinner o similar
  if (isLoading) {
    return <div>Cargando...</div>;
  }

  // Si no está autenticado, redirigir al login guardando la ruta actual
  if (!isAuthenticated || !user) {
    console.log("ProtectedRoute - Redirecting to login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene, redirigir
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Si está autenticado y tiene el rol necesario, mostrar el contenido protegido
  return <>{children}</>;
};

export default ProtectedRoute;
