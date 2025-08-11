import { Request, Response } from 'express';
import { AdminService } from '@/services/adminService';
import { AuthenticatedRequest } from '@/types/requests';
import { ApiError, handleAsyncError } from '@/utils/errors';

export class AdminController {
  private adminService: AdminService;

  constructor(adminService: AdminService) {
    this.adminService = adminService;
  }

  getAllUsers = handleAsyncError(async (req: AuthenticatedRequest, res: Response) => {
    const users = await this.adminService.getAllUsers();
    
    res.json({
      success: true,
      data: users
    });
  });

  updateUser = handleAsyncError(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { username, email, role, password, full_name, is_active, avatar_url, email_verified } = req.body;

    if (!id) {
      throw new ApiError('ID de usuario requerido', 400);
    }

    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new ApiError('ID de usuario inválido', 400);
    }

    // Validar que al menos un campo se está actualizando
    if (!username && !email && !role && !password && full_name === undefined && is_active === undefined && avatar_url === undefined && email_verified === undefined) {
      throw new ApiError('Se debe proporcionar al menos un campo para actualizar', 400);
    }

    // Validar email si se proporciona
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError('Formato de email inválido', 400);
    }

    // Validar rol si se proporciona
    if (role && !['admin', 'user', 'editor', 'viewer'].includes(role)) {
      throw new ApiError('Rol inválido. Debe ser "admin", "user", "editor" o "viewer"', 400);
    }

    // Validar contraseña si se proporciona
    if (password && password.length < 6) {
      throw new ApiError('La contraseña debe tener al menos 6 caracteres', 400);
    }

    const updatedUser = await this.adminService.updateUser(
      userId,
      username?.trim(),
      email?.trim(),
      role,
      password,
      full_name?.trim(),
      is_active,
      avatar_url?.trim(),
      email_verified
    );

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: updatedUser
    });
  });

  // Método PATCH para actualizaciones parciales
  patchUser = handleAsyncError(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { username, email, role, password, full_name, is_active, avatar_url, email_verified } = req.body;

    if (!id) {
      throw new ApiError('ID de usuario requerido', 400);
    }

    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new ApiError('ID de usuario inválido', 400);
    }

    // Para PATCH, permitimos actualizaciones de un solo campo
    const fieldsToUpdate = [username, email, role, password, full_name, is_active, avatar_url, email_verified].filter(field => field !== undefined);
    if (fieldsToUpdate.length === 0) {
      throw new ApiError('Se debe proporcionar al menos un campo para actualizar', 400);
    }

    // Validar email si se proporciona
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError('Formato de email inválido', 400);
    }

    // Validar rol si se proporciona
    if (role && !['admin', 'user', 'editor', 'viewer'].includes(role)) {
      throw new ApiError('Rol inválido. Debe ser "admin", "user", "editor" o "viewer"', 400);
    }

    // Validar contraseña si se proporciona
    if (password && password.length < 6) {
      throw new ApiError('La contraseña debe tener al menos 6 caracteres', 400);
    }

    const updatedUser = await this.adminService.updateUser(
      userId,
      username?.trim(),
      email?.trim(),
      role,
      password,
      full_name?.trim(),
      is_active,
      avatar_url?.trim(),
      email_verified
    );

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: updatedUser
    });
  });

  deleteUser = handleAsyncError(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new ApiError('ID de usuario requerido', 400);
    }

    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new ApiError('ID de usuario inválido', 400);
    }

    // Evitar que el admin se elimine a sí mismo
    if (req.user?.id === userId) {
      throw new ApiError('No puedes eliminar tu propia cuenta', 400);
    }

    await this.adminService.deleteUser(userId);

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  });

  getStats = handleAsyncError(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await this.adminService.getUserStats();

    res.json({
      success: true,
      data: stats
    });
  });

  // Método para crear un nuevo usuario
  createUser = handleAsyncError(async (req: AuthenticatedRequest, res: Response) => {
    const { username, email, password, full_name, role = 'user', is_active = true } = req.body;

    // Validaciones básicas
    if (!username || !email || !password) {
      throw new ApiError('Username, email y password son requeridos', 400);
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError('Formato de email inválido', 400);
    }

    // Validar rol
    if (!['admin', 'user', 'editor', 'viewer'].includes(role)) {
      throw new ApiError('Rol inválido. Debe ser "admin", "user", "editor" o "viewer"', 400);
    }

    // Validar contraseña
    if (password.length < 6) {
      throw new ApiError('La contraseña debe tener al menos 6 caracteres', 400);
    }

    const newUser = await this.adminService.createUser(
      username.trim(),
      email.trim(),
      password,
      full_name?.trim(),
      role,
      is_active
    );

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: newUser
    });
  });
}
