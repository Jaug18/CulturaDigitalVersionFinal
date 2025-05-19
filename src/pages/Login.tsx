import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const [rememberMe, setRememberMe] = useState(false);

  // Obtener la ruta de donde venimos (si existe)
  const from = location.state?.from || "/home";

  // Si el usuario ya está autenticado, redirigir automáticamente
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!username.trim()) {
      setError("Por favor ingresa tu nombre de usuario o correo electrónico");
      return;
    }

    if (!password) {
      setError("Por favor ingresa tu contraseña");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // CAMBIO: pasar rememberMe al método login
      await login(username, password, rememberMe);
      // La redirección se maneja en el useEffect
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      
      // Mostrar mensaje específico según el tipo de error
      if (error.response) {
        const { data } = error.response;

        if (data && data.message) {
          setError(data.message);
        } else if (error.response.status === 401) {
          setError("No se pudo iniciar sesión. Verifica tus credenciales e intenta nuevamente.");
        } else if (error.response.status === 429) {
          setError("Demasiados intentos fallidos. Intenta de nuevo más tarde.");
        } else {
          setError("Error al conectar con el servidor. Intenta de nuevo más tarde.");
        }
      } else if (error.request) {
        setError("No se pudo establecer conexión con el servidor. Intenta de nuevo en unos minutos.");
      } else {
        setError("Error al intentar iniciar sesión. Intenta de nuevo más tarde.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Left section with image and gradient */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-[#0052A5] to-[#0088cc] p-8 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIj48L3JlY3Q+PC9zdmc+')] opacity-10"></div>
        <div className="relative z-10 text-white max-w-md mx-auto text-center">
          <img 
            src="/drilldown.png" 
            alt="Cultura Digital Logo" 
            className="mx-auto h-16 mb-8" 
          />
          <h2 className="text-3xl font-bold mb-4">Bienvenido al Programa de Cultura Digital</h2>
          <p className="text-lg opacity-90 mb-8">Accede a nuestra plataforma para gestionar tus plantillas de email y mucho más.</p>
          
          <div className="mt-12 flex justify-center">
            <img 
              src="https://branzontech.com/wp-content/uploads/2025/05/avatar_pose_1-removebg-preview.png" 
              alt="Decorative Avatar" 
              className="w-3/4 h-auto drop-shadow-2xl animation-float" 
            />
          </div>
        </div>
      </div>
      
      {/* Right section with login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="flex justify-center md:hidden mb-6">
              <img 
                src="https://cuidadoseguro.com.co/csc3/wp-content/uploads/2025/04/CULTURA-DIGITAL-CURVAS1.svg" 
                alt="Cultura Digital Logo" 
                className="h-12" 
              />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Iniciar Sesión</h2>
            <p className="mt-2 text-sm text-gray-600">
              Accede a tu cuenta para gestionar tus plantillas de email
            </p>
          </div>
          
          <Card className="shadow-lg border-t-4 border-t-[#0052A5]">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Autenticación</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de usuario o correo electrónico</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="usuario o correo@ejemplo.com"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full"
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Contraseña</Label>
                    <a href="/forgot-password" className="text-sm text-[#0066cc] hover:underline">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                  <div className="flex items-center">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-700">
                    Recordar sesión
                  </label>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-[#0052A5] to-[#0076cc] hover:from-[#004494] hover:to-[#0068b5]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col">
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 mt-2">
                  Para solicitar una cuenta, contacta al administrador del sistema.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Al iniciar sesión, aceptas nuestros{" "}
                  <a href="#" className="text-[#0052A5] hover:underline">términos y condiciones</a>.
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;