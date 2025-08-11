import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  PlusCircle, 
  Search, 
  Trash2, 
  Edit, 
  UserCog,
  AlertTriangle,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
  UserCheck,
  UserX,
  Calendar,
  Mail
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type User = {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  full_name?: string;
  role: string;
  is_active?: boolean;
  avatar_url?: string;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
};

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editedValues, setEditedValues] = useState({
    fullName: "",
    username: "",
    email: "",
    role: "",
    is_active: true,
    avatar_url: "",
    email_verified: false
  });
  const [isEditing, setIsEditing] = useState(false);

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
        description: "No tienes permisos para acceder a esta sección"
      });
      navigate("/", { replace: true });
      return;
    }
    
    fetchUsers();
  }, [isAuthenticated, user, navigate]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      let usersData = [];
      
      if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        usersData = response.data.data;
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        usersData = response.data.data;
      } else {
        throw new Error("Estructura de respuesta no reconocida");
      }
      
      const normalizedUsers = usersData.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName || user.full_name || "",
        role: user.role || "user",
        created_at: user.created_at || new Date().toISOString(),
        is_active: user.is_active !== undefined ? user.is_active : true,
        avatar_url: user.avatar_url || "",
        email_verified: user.email_verified || false
      }));
      
      setUsers(normalizedUsers);
      
      toast.success("Usuarios cargados correctamente", {
        description: `Se cargaron ${normalizedUsers.length} usuarios del sistema`
      });
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      
      if (error.response) {
        console.error('Respuesta del servidor:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor:', error.request);
      } else {
        console.error('Error al configurar la petición:', error.message);
      }
      
      toast.error("Error al cargar usuarios", {
        description: "No se pudieron cargar los usuarios del sistema. Intente de nuevo más tarde."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(`/api/admin/users/${userId}`, { role: newRole }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setUsers(users.map(u => u.id === userId ? {...u, role: newRole} : u));
      
      toast.success("Rol actualizado", {
        description: "El rol del usuario ha sido actualizado correctamente"
      });
    } catch (error) {
      console.error('Error al cambiar rol:', error);
      toast.error("Error al cambiar rol", {
        description: "No se pudo actualizar el rol del usuario. Pruebe de nuevo más tarde."
      });
    }
  };

  const changeUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(`/api/admin/users/${userId}`, { is_active: isActive }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setUsers(users.map(u => u.id === userId ? {...u, is_active: isActive} : u));
      
      toast.success("Estado actualizado", {
        description: `El usuario ha sido ${isActive ? 'activado' : 'desactivado'} correctamente`
      });
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error("Error al cambiar estado", {
        description: "No se pudo actualizar el estado del usuario. Pruebe de nuevo más tarde."
      });
    }
  };

  const deleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`/api/admin/users/${userToDelete.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setUsers(users.filter(u => u.id !== userToDelete.id));
      
      toast.success("Usuario eliminado", {
        description: `El usuario "${userToDelete.username}" ha sido eliminado correctamente.`
      });
      
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      toast.error("Error al eliminar usuario", {
        description: "No se pudo eliminar el usuario. Intente de nuevo más tarde."
      });
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  const confirmDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const prepareEdit = (user: User) => {
    setUserToEdit(user);
    setEditedValues({
      fullName: user.fullName || user.full_name || "",
      username: user.username,
      email: user.email,
      role: user.role,
      is_active: user.is_active !== undefined ? user.is_active : true,
      avatar_url: user.avatar_url || "",
      email_verified: user.email_verified || false
    });
    setEditDialogOpen(true);
  };

  const saveUserEdits = async () => {
    if (!userToEdit) return;
    
    setIsEditing(true);
    try {
      const token = localStorage.getItem('token');
      
      const updatedUserData = {
        username: editedValues.username,
        email: editedValues.email,
        full_name: editedValues.fullName,
        role: editedValues.role,
        is_active: editedValues.is_active,
        avatar_url: editedValues.avatar_url,
        email_verified: editedValues.email_verified
      };
      
      await axios.put(`/api/admin/users/${userToEdit.id}`, updatedUserData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setUsers(users.map(u => u.id === userToEdit.id ? {
        ...u,
        username: editedValues.username,
        email: editedValues.email,
        fullName: editedValues.fullName,
        role: editedValues.role,
        is_active: editedValues.is_active,
        avatar_url: editedValues.avatar_url,
        email_verified: editedValues.email_verified
      } : u));
      
      toast.success("Usuario actualizado", {
        description: `La información de "${editedValues.username}" ha sido actualizada correctamente.`
      });
      
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      
      if (error.response) {
        console.error('Respuesta del servidor:', error.response.status, error.response.data);
      }
      
      toast.error("Error al actualizar usuario", {
        description: "No se pudo actualizar la información del usuario."
      });
    } finally {
      setIsEditing(false);
      setUserToEdit(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.fullName || user.full_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "inactive" && !user.is_active);
    const matchesEmailVerified = emailVerifiedFilter === "all" ||
      (emailVerifiedFilter === "verified" && user.email_verified) ||
      (emailVerifiedFilter === "unverified" && !user.email_verified);
    
    return matchesSearch && matchesRole && matchesStatus && matchesEmailVerified;
  });

  // Ordenar usuarios
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case "username":
        aValue = a.username.toLowerCase();
        bValue = b.username.toLowerCase();
        break;
      case "email":
        aValue = a.email.toLowerCase();
        bValue = b.email.toLowerCase();
        break;
      case "role":
        aValue = a.role;
        bValue = b.role;
        break;
      case "created_at":
        aValue = new Date(a.created_at || 0);
        bValue = new Date(b.created_at || 0);
        break;
      default:
        aValue = a.username.toLowerCase();
        bValue = b.username.toLowerCase();
    }
    
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Calcular paginación
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, endIndex);
  
  // Funciones de paginación
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1));
  const goToNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1));
  
  // Reset página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, emailVerifiedFilter, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setEmailVerifiedFilter("all");
    setSortBy("created_at");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No disponible";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Fecha inválida";
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="w-full max-w-none px-6 py-8">
        <div className="mx-auto">
          <Card className="w-full shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-800">Administración de Usuarios</CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      Gestiona y supervisa todos los usuarios del sistema
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    onClick={fetchUsers} 
                    disabled={isLoading}
                    className="flex items-center gap-2 hover:bg-blue-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Actualizar
                  </Button>
                  <Link to="/register">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Crear Usuario
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Filtros y búsqueda */}
              <div className="p-6 bg-white border-b border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  {/* Búsqueda */}
                  <div className="lg:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Buscar usuarios..." 
                        className="pl-10 focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Filtro por rol */}
                  <div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder="Rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los roles</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Filtro por estado */}
                  <div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="active">Activos</SelectItem>
                        <SelectItem value="inactive">Inactivos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Filtro por email verificado */}
                  <div>
                    <Select value={emailVerifiedFilter} onValueChange={setEmailVerifiedFilter}>
                      <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder="Email" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="verified">Verificados</SelectItem>
                        <SelectItem value="unverified">Sin verificar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Limpiar filtros */}
                  <div>
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                      className="w-full hover:bg-gray-50"
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                </div>
                
                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-800 mt-1">{users.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Activos</span>
                    </div>
                    <p className="text-2xl font-bold text-green-800 mt-1">
                      {users.filter(u => u.is_active).length}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <UserX className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium text-red-700">Inactivos</span>
                    </div>
                    <p className="text-2xl font-bold text-red-800 mt-1">
                      {users.filter(u => !u.is_active).length}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">Verificados</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-800 mt-1">
                      {users.filter(u => u.email_verified).length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabla de usuarios */}
              <div className="overflow-hidden">
                {isLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="text-center">
                      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-500">Cargando usuarios...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="w-16 text-center">#</TableHead>
                            <TableHead className="min-w-[200px]">
                              <Button 
                                variant="ghost" 
                                className="h-auto p-0 font-semibold hover:bg-transparent"
                                onClick={() => {
                                  if (sortBy === "username") {
                                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                  } else {
                                    setSortBy("username");
                                    setSortOrder("asc");
                                  }
                                }}
                              >
                                Usuario {sortBy === "username" && (sortOrder === "asc" ? "↑" : "↓")}
                              </Button>
                            </TableHead>
                            <TableHead className="min-w-[250px]">
                              <Button 
                                variant="ghost" 
                                className="h-auto p-0 font-semibold hover:bg-transparent"
                                onClick={() => {
                                  if (sortBy === "email") {
                                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                  } else {
                                    setSortBy("email");
                                    setSortOrder("asc");
                                  }
                                }}
                              >
                                Email {sortBy === "email" && (sortOrder === "asc" ? "↑" : "↓")}
                              </Button>
                            </TableHead>
                            <TableHead className="min-w-[120px]">
                              <Button 
                                variant="ghost" 
                                className="h-auto p-0 font-semibold hover:bg-transparent"
                                onClick={() => {
                                  if (sortBy === "role") {
                                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                  } else {
                                    setSortBy("role");
                                    setSortOrder("asc");
                                  }
                                }}
                              >
                                Rol {sortBy === "role" && (sortOrder === "asc" ? "↑" : "↓")}
                              </Button>
                            </TableHead>
                            <TableHead className="min-w-[100px] text-center">Estado</TableHead>
                            <TableHead className="min-w-[100px] text-center">Email</TableHead>
                            <TableHead className="min-w-[150px]">
                              <Button 
                                variant="ghost" 
                                className="h-auto p-0 font-semibold hover:bg-transparent"
                                onClick={() => {
                                  if (sortBy === "created_at") {
                                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                  } else {
                                    setSortBy("created_at");
                                    setSortOrder("desc");
                                  }
                                }}
                              >
                                Creado {sortBy === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
                              </Button>
                            </TableHead>
                            <TableHead className="w-[120px] text-center">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedUsers.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-12">
                                <div className="text-gray-500">
                                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                  <p className="text-lg font-medium">No se encontraron usuarios</p>
                                  <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            paginatedUsers.map((user, index) => (
                              <TableRow key={user.id || index} className="hover:bg-gray-50 transition-colors">
                                <TableCell className="text-center font-medium text-gray-500">
                                  {startIndex + index + 1}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border-2 border-gray-200">
                                      <AvatarImage src={user.avatar_url} />
                                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                                        {(user.fullName || user.full_name || user.username || "")
                                          .split(' ')
                                          .slice(0, 2)
                                          .map(name => name[0])
                                          .join('')
                                          .toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-semibold text-gray-900">{user.username}</p>
                                      <p className="text-sm text-gray-500">
                                        {user.fullName || user.full_name || "Sin nombre completo"}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-900">{user.email}</span>
                                    {user.email_verified && (
                                      <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                        Verificado
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={user.role}
                                    onValueChange={(value) => changeUserRole(user.id, value)}
                                  >
                                    <SelectTrigger className="w-[130px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="user">Usuario</SelectItem>
                                      <SelectItem value="admin">Administrador</SelectItem>
                                      <SelectItem value="editor">Editor</SelectItem>
                                      <SelectItem value="viewer">Visualizador</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => changeUserStatus(user.id, !user.is_active)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      user.is_active 
                                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                    }`}
                                  >
                                    {user.is_active ? 'Activo' : 'Inactivo'}
                                  </Button>
                                </TableCell>
                                <TableCell className="text-center">
                                  {user.email_verified ? (
                                    <Mail className="h-4 w-4 text-green-600 mx-auto" />
                                  ) : (
                                    <Mail className="h-4 w-4 text-gray-400 mx-auto" />
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-gray-600">
                                  {formatDate(user.created_at)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-center gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => prepareEdit(user)}
                                      className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600"
                                      title="Editar usuario"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => confirmDelete(user)}
                                      className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600"
                                      title="Eliminar usuario"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {/* Paginación */}
                    {totalPages > 1 && (
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-700">Mostrar:</span>
                              <Select 
                                value={itemsPerPage.toString()} 
                                onValueChange={(value) => setItemsPerPage(Number(value))}
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="5">5</SelectItem>
                                  <SelectItem value="10">10</SelectItem>
                                  <SelectItem value="25">25</SelectItem>
                                  <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                              </Select>
                              <span className="text-sm text-gray-700">por página</span>
                            </div>
                            <div className="text-sm text-gray-700">
                              Mostrando {startIndex + 1} a {Math.min(endIndex, sortedUsers.length)} de {sortedUsers.length} usuarios
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={goToFirstPage}
                              disabled={currentPage === 1}
                              className="h-9 w-9 p-0"
                            >
                              <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={goToPreviousPage}
                              disabled={currentPage === 1}
                              className="h-9 w-9 p-0"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            
                            <div className="flex items-center gap-1">
                              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNumber;
                                if (totalPages <= 5) {
                                  pageNumber = i + 1;
                                } else if (currentPage <= 3) {
                                  pageNumber = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                  pageNumber = totalPages - 4 + i;
                                } else {
                                  pageNumber = currentPage - 2 + i;
                                }
                                
                                return (
                                  <Button
                                    key={pageNumber}
                                    variant={currentPage === pageNumber ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(pageNumber)}
                                    className="h-9 w-9 p-0"
                                  >
                                    {pageNumber}
                                  </Button>
                                );
                              })}
                            </div>
                            
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={goToNextPage}
                              disabled={currentPage === totalPages}
                              className="h-9 w-9 p-0"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={goToLastPage}
                              disabled={currentPage === totalPages}
                              className="h-9 w-9 p-0"
                            >
                              <ChevronsRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Eliminar usuario
            </DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. El usuario ya no podrá acceder al sistema.
            </DialogDescription>
          </DialogHeader>
          
          {userToDelete && (
            <div className="py-4">
              <p className="mb-4">
                ¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete.username}</strong>?
              </p>
              <div className="bg-gray-50 p-3 rounded-md border">
                <p className="text-sm"><strong>Nombre:</strong> {userToDelete.fullName || userToDelete.full_name || "Sin nombre"}</p>
                <p className="text-sm"><strong>Email:</strong> {userToDelete.email}</p>
                <p className="text-sm"><strong>Rol:</strong> {userToDelete.role}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={deleteUser}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar usuario"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Editar usuario
            </DialogTitle>
            <DialogDescription>
              Actualiza la información del usuario según los campos disponibles en el sistema.
            </DialogDescription>
          </DialogHeader>
          
          {userToEdit && (
            <div className="py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Información básica */}
                <div className="space-y-2 md:col-span-2">
                  <h3 className="font-medium text-gray-700">Información básica</h3>
                  <div className="border-b mb-3"></div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-fullName">Nombre completo</Label>
                  <Input
                    id="edit-fullName"
                    value={editedValues.fullName}
                    onChange={(e) => setEditedValues({...editedValues, fullName: e.target.value})}
                    placeholder="Nombre completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Nombre de usuario</Label>
                  <Input
                    id="edit-username"
                    value={editedValues.username}
                    onChange={(e) => setEditedValues({...editedValues, username: e.target.value})}
                    placeholder="Nombre de usuario"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Correo electrónico</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editedValues.email}
                    onChange={(e) => setEditedValues({...editedValues, email: e.target.value})}
                    placeholder="Correo electrónico"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Rol</Label>
                  <Select
                    value={editedValues.role}
                    onValueChange={(value) => setEditedValues({...editedValues, role: value})}
                  >
                    <SelectTrigger id="edit-role">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuario</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-avatar-url">URL de imagen de perfil</Label>
                  <Input
                    id="edit-avatar-url"
                    value={editedValues.avatar_url}
                    onChange={(e) => setEditedValues({...editedValues, avatar_url: e.target.value})}
                    placeholder="URL de imagen de perfil"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="edit-is-active">Estado de cuenta</Label>
                    <input
                      type="checkbox"
                      id="edit-is-active"
                      checked={editedValues.is_active}
                      onChange={(e) => setEditedValues({...editedValues, is_active: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-500">Cuenta activa</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="edit-email-verified">Verificación de email</Label>
                    <input
                      type="checkbox"
                      id="edit-email-verified"
                      checked={editedValues.email_verified}
                      onChange={(e) => setEditedValues({...editedValues, email_verified: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-500">Email verificado</span>
                  </div>
                </div>
                
                {editedValues.avatar_url && (
                  <div className="md:col-span-2 flex justify-center my-2">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={editedValues.avatar_url} />
                      <AvatarFallback>
                        {editedValues.fullName.split(' ').slice(0, 2).map(name => name[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
              disabled={isEditing}
            >
              Cancelar
            </Button>
            <Button 
              onClick={saveUserEdits}
              disabled={isEditing}
            >
              {isEditing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
