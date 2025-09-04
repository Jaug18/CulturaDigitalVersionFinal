import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertCircle, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/services/api";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (!email.trim() || !email.includes('@')) {
      setError("Por favor ingresa un correo electrónico válido");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      
      // Si la solicitud fue exitosa, mostrar mensaje de éxito
      toast.success("Solicitud enviada", {
        description: "Si el correo existe en nuestra base de datos, recibirás instrucciones para restablecer tu contraseña."
      });
      
      setIsSuccess(true);
    } catch (error: unknown) {
      console.error('Error al solicitar restablecimiento:', error);
      
      // Para mayor seguridad, no revelar si el email existe o no
      // Solo mostrar errores de servidor
      if (axios.isAxiosError(error) && error.response && error.response.status >= 500) {
        setError("Hubo un problema al procesar tu solicitud. Por favor intenta de nuevo más tarde.");
      } else {
        // Si todo salió bien del lado del servidor (incluso si el email no existe)
        // mostrar mensaje de éxito para prevenir enumeración de usuarios
        setIsSuccess(true);
        toast.success("Solicitud enviada", {
          description: "Si el correo existe en nuestra base de datos, recibirás instrucciones para restablecer tu contraseña."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

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
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Recuperar contraseña</h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu correo electrónico para recibir instrucciones
          </p>
        </div>
        
        <Card className="shadow-lg border-t-4 border-t-[#0052A5]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Restablecer acceso</CardTitle>
            <CardDescription>
              Te enviaremos un enlace para crear una nueva contraseña
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
            
            {isSuccess ? (
              <div className="text-center py-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Solicitud enviada</h3>
                <p className="text-gray-600 mb-4">
                  Hemos enviado instrucciones para restablecer tu contraseña al correo: 
                  <span className="font-medium"> {email}</span>
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Revisa tu bandeja de entrada y carpetas de spam. El enlace será válido por 30 minutos.
                </p>
                <Button asChild variant="outline" className="mt-2">
                  <Link to="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a iniciar sesión
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tucorreo@ejemplo.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    autoComplete="email"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-[#0052A5] to-[#0076cc] hover:from-[#004494] hover:to-[#0068b5]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar instrucciones"
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

export default ForgotPassword;
