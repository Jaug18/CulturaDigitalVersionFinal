import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Notifications from "./pages/Notifications";
import Contacts from "./pages/Contacts";
import AdminUsers from "./pages/AdminUsers";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redirigir automáticamente de la raíz a login o home */}
            <Route path="/" element={
              <ProtectedRoute>
                <Navigate to="/home" replace />
              </ProtectedRoute>
            } />
            
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* Rutas protegidas - ahora Navbar se incluirá directamente en cada ruta */}
            <Route path="/home" element={
              <ProtectedRoute>
                {/* No incluimos Navbar aquí, asumiendo que Index ya lo incluye */}
                <Index />
              </ProtectedRoute>
            } />
            
            <Route path="/notifications" element={
              <ProtectedRoute>
                {/* No incluimos Navbar aquí, asumiendo que Notifications ya lo incluye */}
                <Notifications />
              </ProtectedRoute>
            } />
            
            <Route path="/contacts" element={
              <ProtectedRoute>
                {/* No incluimos Navbar aquí, asumiendo que Contacts ya lo incluye */}
                <Contacts />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Navbar />
                <div className="container mx-auto p-4">
                  <h1 className="text-2xl font-bold">Mi Perfil</h1>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Navbar />
                <div className="container mx-auto p-4">
                  <h1 className="text-2xl font-bold">Configuración</h1>
                </div>
              </ProtectedRoute>
            } />

            <Route path="/admin/users" element={
              <ProtectedRoute>
                <AdminUsers />
              </ProtectedRoute>
            } />
            
            {/* Ruta de fallback */}
            <Route path="*" element={
              <ProtectedRoute>
                <Navbar />
                <NotFound />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;