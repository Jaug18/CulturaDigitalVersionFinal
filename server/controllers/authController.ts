import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '@/types';
import * as authService from '@/services/authService';
import { validateUserData } from '@/validators/userValidator';

export class AuthController {
  /**
   * Registro de nuevo usuario
   */
  async register(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { username, email, password, fullName } = req.body;
      
      // Validar campos requeridos
      const validation = validateUserData({ username, email, password, fullName });
      if (!validation.isValid) {
        res.status(400).json({ 
          success: false,
          error: 'Datos de registro inválidos',
          validation: validation.errors 
        });
        return;
      }
      
      const result = await authService.registerUser({
        username,
        email,
        password,
        fullName
      });
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error en el servidor',
        message: 'Ha ocurrido un error al procesar el registro'
      });
    }
  }

  /**
   * Inicio de sesión
   */
  async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;
      const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
      
      if (!username || !password) {
        res.status(400).json({ 
          success: false, 
          error: 'Datos incompletos',
          message: 'Usuario y contraseña son requeridos' 
        });
        return;
      }
      
      const result = await authService.loginUser({
        username,
        password,
        ipAddress
      });
      
      if (!result.success) {
        res.status(result.status || 401).json(result);
        return;
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error en inicio de sesión:', error);
      res.status(500).json({
        success: false,
        error: 'Error en el servidor',
        message: 'Ha ocurrido un error al procesar el inicio de sesión'
      });
    }
  }

  /**
   * Obtener información del usuario actual
   */
  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("Verificando usuario actual, ID:", req.user?.id);
      
      if (!req.user || !req.user.id) {
        res.status(401).json({ 
          success: false, 
          message: 'Token inválido o expirado' 
        });
        return;
      }
      
      const user = await authService.getCurrentUser(req.user.id);
      
      if (!user) {
        res.status(404).json({ 
          success: false, 
          message: 'Usuario no encontrado' 
        });
        return;
      }
      
      console.log("Usuario encontrado:", user.username);
      res.json({
        success: true,
        user: user
      });
    } catch (error) {
      console.error('Error al obtener información del usuario:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error del servidor' 
      });
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
        return;
      }
      
      await authService.logoutUser(req.user.id);
      
      console.log(`[AUTH] Logout exitoso para usuario ${req.user.id}`);
      
      res.json({
        success: true,
        message: 'Logout exitoso'
      });
    } catch (error) {
      console.error('Error durante logout:', error);
      res.status(500).json({
        success: false,
        error: 'Error en logout',
        message: 'Error al cerrar sesión'
      });
    }
  }

  /**
   * Solicitar restablecimiento de contraseña
   */
  async forgotPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(400).json({
          success: false,
          error: 'Email requerido',
          message: 'El email es requerido para restablecer la contraseña'
        });
        return;
      }
      
      const result = await authService.requestPasswordReset(email);
      
      // Siempre devolvemos éxito por seguridad, incluso si el email no existe
      res.json({
        success: true,
        message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña'
      });
    } catch (error) {
      console.error('Error en forgot password:', error);
      res.status(500).json({
        success: false,
        error: 'Error en el servidor',
        message: 'Error al procesar la solicitud'
      });
    }
  }

  /**
   * Verificar token de restablecimiento
   */
  async verifyResetToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      
      if (!token) {
        res.status(400).json({
          success: false,
          error: 'Token requerido',
          message: 'El token es requerido'
        });
        return;
      }
      
      const isValid = await authService.verifyResetToken(token);
      
      if (!isValid) {
        res.status(400).json({
          success: false,
          error: 'Token inválido',
          message: 'El token de restablecimiento es inválido o ha expirado'
        });
        return;
      }
      
      res.json({
        success: true,
        message: 'Token válido'
      });
    } catch (error) {
      console.error('Error al verificar token:', error);
      res.status(500).json({
        success: false,
        error: 'Error en el servidor',
        message: 'Error al verificar el token'
      });
    }
  }

  /**
   * Restablecer contraseña
   */
  async resetPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        res.status(400).json({
          success: false,
          error: 'Datos incompletos',
          message: 'Token y nueva contraseña son requeridos'
        });
        return;
      }
      
      const result = await authService.resetPassword(token, newPassword);
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      res.status(500).json({
        success: false,
        error: 'Error en el servidor',
        message: 'Error al restablecer la contraseña'
      });
    }
  }
}

export default new AuthController();
