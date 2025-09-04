import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<string>("user");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [touched, setTouched] = useState({
    fullName: false,
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const authContext = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Acceso denegado", {
        description: "Debes iniciar sesión para acceder a esta página"
      });
      navigate("/login", { replace: true });
      return;
    }
    
    if (user?.role !== 'admin') {
      toast.error("Acceso restringido", {
        description: "No tienes permisos para crear usuarios"
      });
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const validateFullName = (value: string) => {
    if (!value.trim()) return "El nombre completo es obligatorio";
    if (value.trim().length < 3) return "El nombre debe tener al menos 3 caracteres";
    if (value.length > 255) return "El nombre es demasiado largo (máx 255 caracteres)";
    // Permitir letras (incluyendo tildes y ñ), números, espacios, puntos, guiones y apostrofes
    if (/[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ ._'-]/.test(value)) return "El nombre contiene caracteres no permitidos";
    return "";
  };

  const validateUsername = (value: string) => {
    if (!value.trim()) return "El nombre de usuario es obligatorio";
    if (value.trim().length < 3) return "El nombre de usuario debe tener al menos 3 caracteres";
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return "El nombre de usuario solo puede contener letras, números y guiones bajos";
    return "";
  };

  const validateEmail = (value: string) => {
    if (!value.trim()) return "El correo electrónico es obligatorio";
    // Regex más permisivo que acepta caracteres Unicode (tildes, ñ, etc.)
    const emailRegex = /^[\w.!#$%&'*+/=?^`{|}~\u00A0-\uFFFF-]+@[a-zA-Z0-9\u00A0-\uFFFF](?:[a-zA-Z0-9\u00A0-\uFFFF-]{0,61}[a-zA-Z0-9\u00A0-\uFFFF])?(?:\.[a-zA-Z0-9\u00A0-\uFFFF](?:[a-zA-Z0-9\u00A0-\uFFFF-]{0,61}[a-zA-Z0-9\u00A0-\uFFFF])?)*$/;
    if (!emailRegex.test(value)) return "Introduce un correo electrónico válido";
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) return "La contraseña es obligatoria";
    if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    if (!/[A-Z]/.test(value)) return "La contraseña debe contener al menos una mayúscula";
    if (!/[0-9]/.test(value)) return "La contraseña debe contener al menos un número";
    return "";
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) return "Debes confirmar la contraseña";
    if (value !== password) return "Las contraseñas no coinciden";
    return "";
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched({...touched, [field]: true});
    
    let error = "";
    switch(field) {
      case "fullName":
        error = validateFullName(fullName);
        break;
      case "username":
        error = validateUsername(username);
        break;
      case "email":
        error = validateEmail(email);
        break;
      case "password":
        error = validatePassword(password);
        break;
      case "confirmPassword":
        error = validateConfirmPassword(confirmPassword);
        break;
    }
    
    setErrors({...errors, [field]: error});
  };

  const getPasswordStrength = () => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  };

  const renderPasswordStrength = () => {
    if (!password) return null;
    
    const strength = getPasswordStrength();
    const width = `${(strength / 4) * 100}%`;
    
    let bgColor = "bg-red-500";
    let text = "Débil";
    
    if (strength >= 2) {
      bgColor = "bg-yellow-500";
      text = "Moderada";
    }
    if (strength >= 3) {
      bgColor = "bg-green-500";
      text = "Fuerte";
    }
    if (strength === 4) {
      bgColor = "bg-green-600";
      text = "Muy fuerte";
    }
    
    return (
      <div className="mt-1">
        <div className="h-2 w-full bg-gray-200 rounded-full">
          <div 
            className={`h-2 rounded-full ${bgColor}`} 
            style={{ width }}
          ></div>
        </div>
        <p className="text-xs mt-1 text-gray-600">Fuerza: {text}</p>
      </div>
    );
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fullNameError = validateFullName(fullName);
    const usernameError = validateUsername(username);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);
    
    const newErrors = {
      fullName: fullNameError,
      username: usernameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError
    };
    
    setErrors(newErrors);
    
    if (fullNameError || usernameError || emailError || passwordError || confirmPasswordError) {
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (typeof authContext.register !== 'function') {
        throw new Error('La función de registro no está disponible');
      }
      
      await authContext.register(
        username, 
        email, 
        password, 
        fullName, 
        role, 
        isActive, 
        avatarUrl
      );
      
      toast.success(`Usuario "${username}" creado exitosamente`, {
        description: `Se ha creado un usuario con rol: ${role === 'admin' ? 'Administrador' : 'Usuario normal'}`
      });
      
      setFullName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("user");
      setIsActive(true);
      setAvatarUrl("");
      setTouched({
        fullName: false,
        username: false,
        email: false,
        password: false,
        confirmPassword: false
      });
      
    } catch (error: any) {
      console.error("Error al crear usuario:", error);
      
      if (error.response?.data?.field) {
        const field = error.response.data.field;
        const errorMessage = error.response.data.message || error.response.data.error;
        
        if (field === 'username') {
          setErrors(prev => ({ ...prev, username: errorMessage }));
        } else if (field === 'email') {
          setErrors(prev => ({ ...prev, email: errorMessage }));
        } else {
          toast.error("Error al crear usuario", {
            description: errorMessage || "Por favor intenta nuevamente con datos diferentes"
          });
        }
      } else {
        toast.error("Error en la creación del usuario", {
          description: "No se pudo completar el registro. Por favor intenta nuevamente."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-[#0052A5] to-[#0088cc] p-8 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIj48L3JlY3Q+PC9zdmc+')] opacity-10"></div>
        <div className="relative z-10 text-white max-w-md mx-auto text-center">
          <img 
            src="https://cuidadoseguro.com.co/csc3/wp-content/uploads/2025/04/CULTURA-DIGITAL-CURVAS1.svg" 
            alt="Cultura Digital Logo" 
            className="mx-auto h-16 mb-8" 
          />
          <h2 className="text-3xl font-bold mb-4">Gestión de Usuarios</h2>
          <p className="text-lg opacity-90 mb-8">Crea cuentas de usuario para personal autorizado que necesita acceder a la plataforma de Cultura Digital.</p>
          
          <div className="mt-12 flex justify-center">
            <img 
              src="https://branzontech.com/wp-content/uploads/2025/05/avatar_pose_2-removebg-preview.png" 
              alt="Decorative Avatar" 
              className="w-3/4 h-auto drop-shadow-2xl animation-float" 
            />
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="flex justify-center md:hidden mb-6">
              <img 
                src="https://cuidadoseguro.com.co/csc3/wp-content/uploads/2025/04/CULTURA-DIGITAL-CURVAS1.svg" 
                alt="Cultura Digital Logo" 
                className="h-12" 
              />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Crear nuevo usuario</h2>
            <p className="mt-2 text-sm text-gray-600">
              Panel de administración para crear cuentas de usuario
            </p>
          </div>
          
          <Card className="shadow-lg border-t-4 border-t-[#0052A5]">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Formulario de creación de usuario</CardTitle>
              <CardDescription>
                Completa todos los campos para crear un nuevo usuario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="fullName">
                    Nombre completo
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Ej. Juan Pérez"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onBlur={() => handleBlur("fullName")}
                    className={errors.fullName && touched.fullName ? "border-red-500" : ""}
                  />
                  {errors.fullName && touched.fullName && (
                    <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="username">
                    Nombre de usuario
                  </Label>
                  <Input
                    id="username"
                    placeholder="Ej. juanito123"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={() => handleBlur("username")}
                    className={errors.username && touched.username ? "border-red-500" : ""}
                  />
                  {errors.username && touched.username && (
                    <p className="text-xs text-red-500 mt-1">{errors.username}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="email">
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur("email")}
                    className={errors.email && touched.email ? "border-red-500" : ""}
                  />
                  {errors.email && touched.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="avatarUrl">
                    URL de imagen de perfil (opcional)
                  </Label>
                  <Input
                    id="avatarUrl"
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="password">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => handleBlur("password")}
                      className={errors.password && touched.password ? "border-red-500 pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                  )}
                  {renderPasswordStrength()}
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword">
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="********"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() => handleBlur("confirmPassword")}
                      className={errors.confirmPassword && touched.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="role">
                    Rol de usuario
                  </Label>
                  <Select
                    value={role}
                    onValueChange={setRole}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuario normal</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Los administradores tienen acceso a todas las funciones del sistema
                  </p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="isActive" className="cursor-pointer">
                      Activar cuenta inmediatamente
                    </Label>
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Si se desactiva, el usuario no podrá iniciar sesión hasta que se active su cuenta
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-[#0052A5] to-[#0076cc] hover:from-[#004494] hover:to-[#0068b5]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando usuario...
                    </>
                  ) : "Crear usuario"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col">
              <p className="text-center text-sm text-gray-600">
                <Link to="/home" className="font-medium text-[#0052A5] hover:text-[#0076cc]">
                  Volver al panel principal
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
