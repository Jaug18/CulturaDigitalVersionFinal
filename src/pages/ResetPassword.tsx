import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertCircle, Loader2, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Verificar el token al cargar la página
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Token inválido o expirado");
        setIsVerifying(false);
        return;
      }

      try {
        console.log(`Verificando token: ${token}`);
        
        // Agregar un timeout para asegurar que no se quede colgada la verificación
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
        
        const response = await axios.get(`/api/auth/verify-reset-token/${token}`, {
          signal: controller.signal
        }).catch(err => {
          if (err.name === 'AbortError') {
            throw new Error('La solicitud ha tomado demasiado tiempo. Verifica tu conexión a internet.');
          }
          throw err;
        });
        
        clearTimeout(timeoutId);
        
        console.log('Respuesta de verificación:', response.data);
        
        if (response.data.success) {
          setIsValidToken(true);
        } else {
          setError(response.data.message || "El enlace de restablecimiento es inválido o ha expirado");
        }
      } catch (error: any) {
        console.error('Error al verificar token:', error);
        
        if (error.message.includes('Network Error') || error.message.includes('timeout')) {
          setError("No se pudo conectar al servidor. Verifica tu conexión a internet.");
        } else if (error.response && error.response.data && error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError("El enlace de restablecimiento es inválido o ha expirado");
        }
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post('/api/auth/reset-password', {
        token,
        password
      });
      
      console.log('Respuesta de restablecimiento:', response.data);
      
      if (response.data.success) {
        setIsSuccess(true);
        toast.success("¡Contraseña actualizada!", {
          description: "Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión."
        });
      } else {
        setError(response.data.message || "Error al restablecer la contraseña");
      }
    } catch (error: any) {
      console.error('Error al restablecer contraseña:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Hubo un problema al restablecer tu contraseña. Por favor intenta de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToLogin = () => {
    navigate('/login');
  };

  const redirectToForgotPassword = () => {
    navigate('/forgot-password');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-gray-600">Verificando enlace de restablecimiento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="https://cuidadoseguro.com.co/csc3/wp-content/uploads/2025/04/CULTURA-DIGITAL-CURVAS1.svg" 
              alt="Cultura Digital Logo" 
              className="h-12" 
            />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Restablecer contraseña</h2>
          <p className="mt-2 text-sm text-gray-600">
            Crea una nueva contraseña para tu cuenta
          </p>
        </div>
        
        <Card className="shadow-lg border-t-4 border-t-[#0052A5]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
            <CardDescription>
              {isValidToken 
                ? "Ingresa y confirma tu nueva contraseña" 
                : "Verifica tu enlace de restablecimiento"}
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
            
            {!isValidToken && !isSuccess ? (
              <div className="text-center py-6">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Enlace inválido</h3>
                <p className="text-gray-600 mb-4">
                  El enlace de restablecimiento que has usado es inválido o ha expirado.
                </p>
                <Button onClick={redirectToForgotPassword} className="mt-2">
                  Solicitar nuevo enlace
                </Button>
              </div>
            ) : isSuccess ? (
              <div className="text-center py-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">¡Contraseña actualizada!</h3>
                <p className="text-gray-600 mb-4">
                  Tu contraseña ha sido restablecida correctamente.
                </p>
                <Button onClick={redirectToLogin} className="mt-2">
                  Iniciar sesión
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pr-10"
                      placeholder="Mínimo 8 caracteres"
                      required
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
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full"
                      placeholder="Repite la contraseña"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-[#0052A5] to-[#0076cc] hover:from-[#004494] hover:to-[#0068b5]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    "Actualizar contraseña"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            {!isSuccess && (
              <Button asChild variant="link" className="mt-4">
                <Link to="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a iniciar sesión
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
