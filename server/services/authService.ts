import crypto from 'crypto';
import { pool } from '@/config/database';
import { 
  generateToken, 
  generateRefreshToken, 
  saveRefreshToken, 
  hashPassword, 
  comparePassword,
  revokeAllUserTokens,
  checkLoginThrottle,
  logLoginAttempt
} from '@/config/auth';
import { User, ApiResponse } from '@/types';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

interface LoginData {
  username: string;
  password: string;
  ipAddress: string;
}

interface LoginResponse extends ApiResponse {
  user?: {
    id: number;
    username: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
    role: string;
    emailVerified: boolean;
  };
  token?: string;
  refreshToken?: string;
  status?: number;
}

/**
 * Registrar un nuevo usuario
 */
export async function registerUser(data: RegisterData): Promise<ApiResponse> {
  const { username, email, password, fullName } = data;
  
  try {
    // Verificar si el usuario ya existe
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (userCheck.rows.length > 0) {
      const existingUser = userCheck.rows[0];
      if (existingUser.username === username) {
        return { 
          success: false,
          error: 'El nombre de usuario ya está en uso',
          message: 'Este nombre de usuario ya ha sido registrado'
        };
      }
      if (existingUser.email === email) {
        return { 
          success: false,
          error: 'El correo electrónico ya está registrado',
          message: 'Este correo electrónico ya ha sido registrado'
        };
      }
    }
    
    // Generar token de verificación de email
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    
    // Hashear la contraseña
    const hashedPassword = await hashPassword(password);
    
    // Crear el usuario
    const result = await pool.query(
      `INSERT INTO users (
        username, 
        email, 
        password, 
        full_name, 
        email_verification_token,
        role
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        username, 
        email, 
        hashedPassword, 
        fullName || null, 
        emailVerificationToken,
        'user'
      ]
    );
    
    const newUser = result.rows[0];
    
    // Generar token JWT
    const token = generateToken(newUser);
    
    // Generar refresh token
    const refreshTokenData = generateRefreshToken(newUser.id);
    await saveRefreshToken(newUser.id, refreshTokenData.token, refreshTokenData.expiresAt);
    
    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          fullName: newUser.full_name,
          avatarUrl: newUser.avatar_url,
          role: newUser.role,
          emailVerified: newUser.email_verified
        },
        token,
        refreshToken: refreshTokenData.token
      }
    };
  } catch (error) {
    console.error('Error en registerUser:', error);
    return {
      success: false,
      error: 'Error en el servidor',
      message: 'Ha ocurrido un error al procesar el registro'
    };
  }
}

/**
 * Iniciar sesión de usuario
 */
export async function loginUser(data: LoginData): Promise<LoginResponse> {
  const { username, password, ipAddress } = data;
  
  try {
    // Verificar bloqueo por intentos fallidos
    const throttleCheck = await checkLoginThrottle(username, ipAddress);
    if (throttleCheck.blocked) {
      return {
        success: false,
        error: 'Demasiados intentos',
        message: throttleCheck.message!,
        status: 429
      };
    }
    
    // Buscar el usuario por nombre de usuario o email
    const userQuery = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [username]
    );
    
    if (userQuery.rows.length === 0) {
      await logLoginAttempt(username, ipAddress, false);
      return { 
        success: false,
        error: 'Credenciales inválidas',
        message: 'Usuario o contraseña incorrectos'
      };
    }
    
    const user = userQuery.rows[0];
    
    // Verificar si el usuario está activo
    if (!user.is_active) {
      await logLoginAttempt(username, ipAddress, false);
      return {
        success: false,
        error: 'Cuenta inactiva',
        message: 'Tu cuenta ha sido desactivada. Contacta al administrador.'
      };
    }
    
    // Verificar la contraseña
    const passwordValid = await comparePassword(password, user.password);
    if (!passwordValid) {
      await logLoginAttempt(username, ipAddress, false);
      return {
        success: false,
        error: 'Credenciales inválidas',
        message: 'Usuario o contraseña incorrectos'
      };
    }
    
    // Registrar inicio de sesión exitoso
    await logLoginAttempt(username, ipAddress, true);
    
    // Generar token JWT
    const token = generateToken(user);
    
    // Generar refresh token
    const refreshTokenData = generateRefreshToken(user.id);
    await saveRefreshToken(user.id, refreshTokenData.token, refreshTokenData.expiresAt);
    
    return {
      success: true,
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        role: user.role,
        emailVerified: user.email_verified
      },
      token,
      refreshToken: refreshTokenData.token
    };
  } catch (error) {
    console.error('Error en loginUser:', error);
    return {
      success: false,
      error: 'Error en el servidor',
      message: 'Ha ocurrido un error al procesar el inicio de sesión'
    };
  }
}

/**
 * Obtener información del usuario actual
 */
export async function getCurrentUser(userId: number): Promise<User | null> {
  try {
    const userQuery = await pool.query(
      'SELECT id, username, email, role, full_name as "fullName", avatar_url as "avatarUrl", email_verified FROM users WHERE id = $1', 
      [userId]
    );
    
    if (userQuery.rows.length === 0) {
      return null;
    }
    
    return userQuery.rows[0];
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    return null;
  }
}

/**
 * Cerrar sesión de usuario
 */
export async function logoutUser(userId: number): Promise<void> {
  try {
    // Revocar todos los refresh tokens del usuario
    await revokeAllUserTokens(userId);
  } catch (error) {
    console.error('Error en logoutUser:', error);
    throw error;
  }
}

/**
 * Solicitar restablecimiento de contraseña
 */
export async function requestPasswordReset(email: string): Promise<ApiResponse> {
  try {
    // Verificar si el usuario existe
    const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userQuery.rows.length === 0) {
      // Por seguridad, no revelamos si el email existe o no
      return {
        success: true,
        message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña'
      };
    }
    
    const user = userQuery.rows[0];
    
    // Generar token de restablecimiento
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hora
    
    // Guardar token en la base de datos
    await pool.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
      [resetToken, resetExpires, user.id]
    );
    
    // TODO: Aquí se debería enviar el email con el token
    console.log(`Token de restablecimiento para ${email}: ${resetToken}`);
    
    return {
      success: true,
      message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña'
    };
  } catch (error) {
    console.error('Error en requestPasswordReset:', error);
    return {
      success: false,
      error: 'Error en el servidor',
      message: 'Error al procesar la solicitud'
    };
  }
}

/**
 * Verificar token de restablecimiento
 */
export async function verifyResetToken(token: string): Promise<boolean> {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
      [token]
    );
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error al verificar token de restablecimiento:', error);
    return false;
  }
}

/**
 * Restablecer contraseña
 */
export async function resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
  try {
    // Verificar token
    const userQuery = await pool.query(
      'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
      [token]
    );
    
    if (userQuery.rows.length === 0) {
      return {
        success: false,
        error: 'Token inválido',
        message: 'El token de restablecimiento es inválido o ha expirado'
      };
    }
    
    const user = userQuery.rows[0];
    
    // Hashear nueva contraseña
    const hashedPassword = await hashPassword(newPassword);
    
    // Actualizar contraseña y limpiar token
    await pool.query(
      'UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );
    
    // Revocar todos los tokens de sesión por seguridad
    await revokeAllUserTokens(user.id);
    
    return {
      success: true,
      message: 'Contraseña restablecida exitosamente'
    };
  } catch (error) {
    console.error('Error en resetPassword:', error);
    return {
      success: false,
      error: 'Error en el servidor',
      message: 'Error al restablecer la contraseña'
    };
  }
}
