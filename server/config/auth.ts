import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from './database';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { User, ValidationResult, AuthenticatedRequest } from '../types';

// La clave secreta usada para firmar los tokens JWT - idealmente desde variables de entorno
const JWT_SECRET: string = process.env.JWT_SECRET || 'cultura_digital_secret_key';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN: string = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Función para generar un token JWT
export const generateToken = (user: User): string => {
  // No incluir información sensible en el token y limpiar valores problemáticos
  const payload = {
    id: user.id || 0,
    username: (user.username || '').toString().trim(),
    email: (user.email || '').toString().trim(),
    role: (user.role || 'user').toString().trim()
  };
  
  // Verificar que no haya valores problemáticos
  Object.keys(payload).forEach(key => {
    const value = payload[key as keyof typeof payload];
    if (value === null || value === undefined) {
      console.warn(`Valor problemático en JWT payload: ${key} = ${value}`);
    }
  });
  
  const options: jwt.SignOptions = { 
    expiresIn: JWT_EXPIRES_IN as any
  };
  
  try {
    const token = jwt.sign(payload, JWT_SECRET, options);
    console.log('Token JWT generado exitosamente para usuario:', payload.username);
    return token;
  } catch (error) {
    console.error('Error al generar token JWT:', error);
    console.error('Payload problemático:', JSON.stringify(payload, null, 2));
    throw error;
  }
};

// Generar token de actualización
export const generateRefreshToken = (userId: number) => {
  const refreshToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 días por defecto
  
  return {
    token: refreshToken,
    expiresAt: expiresAt
  };
};

// Función para guardar un refresh token en la base de datos
export const saveRefreshToken = async (userId: number, token: string, expiresAt: Date): Promise<void> => {
  try {
    // Eliminar tokens antiguos del mismo usuario primero
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
    
    // Guardar el nuevo token
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    );
    
    console.log(`[AUTH] Refresh token guardado para usuario ${userId}`);
  } catch (error) {
    console.error('Error al guardar refresh token:', error);
    throw new Error('Error al guardar token de actualización');
  }
};

// Verificar refresh token
export const verifyRefreshToken = async (token: string): Promise<{ valid: boolean; userId?: number }> => {
  try {
    const result = await pool.query(
      'SELECT user_id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    
    if (result.rows.length === 0) {
      return { valid: false };
    }
    
    return { valid: true, userId: result.rows[0].user_id };
  } catch (error) {
    console.error('Error al verificar refresh token:', error);
    return { valid: false };
  }
};

// Revocar refresh token
export const revokeRefreshToken = async (token: string): Promise<void> => {
  try {
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
    console.log(`[AUTH] Refresh token revocado`);
  } catch (error) {
    console.error('Error al revocar refresh token:', error);
    throw new Error('Error al revocar token');
  }
};

// Revocar todos los tokens de un usuario
export const revokeAllUserTokens = async (userId: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
    console.log(`[AUTH] Todos los tokens revocados para usuario ${userId}`);
  } catch (error) {
    console.error('Error al revocar tokens del usuario:', error);
    throw new Error('Error al revocar tokens del usuario');
  }
};

// Función para hashear contraseñas
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Función para comparar contraseñas
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Validar datos del usuario
export const validateUserData = (userData: {
  username?: string;
  email?: string;
  password?: string;
  fullName?: string;
}): ValidationResult => {
  const errors: Record<string, string[]> = {};

  // Validar username
  if (userData.username !== undefined) {
    if (!userData.username || userData.username.trim().length < 3) {
      errors.username = ['El nombre de usuario debe tener al menos 3 caracteres'];
    } else if (userData.username.length > 50) {
      errors.username = ['El nombre de usuario no puede tener más de 50 caracteres'];
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(userData.username)) {
      errors.username = ['El nombre de usuario solo puede contener letras, números, guiones y puntos'];
    }
  }

  // Validar email
  if (userData.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email || !emailRegex.test(userData.email)) {
      errors.email = ['Formato de email inválido'];
    } else if (userData.email.length > 255) {
      errors.email = ['El email no puede tener más de 255 caracteres'];
    }
  }

  // Validar password
  if (userData.password !== undefined) {
    if (!userData.password || userData.password.length < 8) {
      errors.password = ['La contraseña debe tener al menos 8 caracteres'];
    } else if (userData.password.length > 128) {
      errors.password = ['La contraseña no puede tener más de 128 caracteres'];
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
      errors.password = ['La contraseña debe contener al menos una minúscula, una mayúscula y un número'];
    }
  }

  // Validar fullName (opcional)
  if (userData.fullName !== undefined && userData.fullName !== null) {
    if (userData.fullName.length > 100) {
      errors.fullName = ['El nombre completo no puede tener más de 100 caracteres'];
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Middleware de autenticación
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'Header de autorización requerido'
      });
      return;
    }

    // Verificar que el header tenga el formato correcto: "Bearer TOKEN"
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Formato de token inválido. Use: Bearer <token>'
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token || token.trim() === '') {
      res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
      return;
    }

    // Verificar que el token tenga al menos el formato básico de JWT (tres partes separadas por punto)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      res.status(401).json({
        success: false,
        message: 'Token JWT malformado'
      });
      return;
    }

    // Verificar el token
    console.log('[AUTH DEBUG] Verificando token JWT...');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('[AUTH DEBUG] Token decodificado:', decoded);
    
    // Obtener información actualizada del usuario desde la base de datos
    const userQuery = await pool.query(
      'SELECT id, username, email, role, full_name, avatar_url, email_verified, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userQuery.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    const user = userQuery.rows[0];

    // Verificar si el usuario está activo
    if (!user.is_active) {
      res.status(401).json({
        success: false,
        message: 'Cuenta de usuario desactivada'
      });
      return;
    }

    // Agregar información del usuario a la request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      emailVerified: user.email_verified,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    } as User;

    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware de autorización por roles
export const authorizeRoles = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
      return;
    }

    next();
  };
};

// Función para registrar intento de inicio de sesión
export const logLoginAttempt = async (username: string, ipAddress: string, success: boolean): Promise<void> => {
  try {
    await pool.query(
      'INSERT INTO login_attempts (username, ip_address, attempted_at, success) VALUES ($1, $2, NOW(), $3)',
      [username, ipAddress, success]
    );
  } catch (error) {
    console.error('Error al registrar intento de inicio de sesión:', error);
  }
};

// Función para verificar bloqueo por intentos fallidos
export const checkLoginThrottle = async (username: string, ipAddress: string): Promise<{ blocked: boolean; message?: string; remainingTime?: string }> => {
  try {
    // Verificar intentos fallidos en los últimos 15 minutos
    const result = await pool.query(
      `SELECT COUNT(*) FROM login_attempts 
       WHERE (username = $1 OR ip_address = $2) 
       AND success = false 
       AND attempted_at > NOW() - INTERVAL '15 minutes'`,
      [username, ipAddress]
    );
    
    const attempts = parseInt(result.rows[0].count);
    
    // Si hay más de 10 intentos fallidos, bloquear temporalmente
    if (attempts >= 10) {
      return {
        blocked: true,
        message: 'Demasiados intentos fallidos. Inténtalo de nuevo después de 15 minutos.',
        remainingTime: '15 minutos'
      };
    }
    
    return { blocked: false };
  } catch (error) {
    console.error('Error al verificar intentos de inicio de sesión:', error);
    return { blocked: false }; // En caso de error, permitir el intento
  }
};

// Función para limpiar intentos de login antiguos
export const clearOldLoginAttempts = async (): Promise<void> => {
  try {
    await pool.query(
      'DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL \'24 hours\''
    );
    console.log('Intentos de login antiguos limpiados');
  } catch (error) {
    console.error('Error al limpiar intentos de login antiguos:', error);
  }
};
