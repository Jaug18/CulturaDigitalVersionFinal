const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { pool } = require('./database');
const crypto = require('crypto');

// La clave secreta usada para firmar los tokens JWT - idealmente desde variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'cultura_digital_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

// Función para generar un token JWT
const generateToken = (user) => {
  // No incluir la contraseña en el token
  const { password, ...userData } = user;
  
  return jwt.sign(userData, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Generar token de actualización
const generateRefreshToken = (userId) => {
  const refreshToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 días por defecto
  
  return {
    token: refreshToken,
    expiresAt: expiresAt
  };
};

// Función para guardar un refresh token en la base de datos
const saveRefreshToken = async (userId, token, expiresAt) => {
  try {
    // Eliminar tokens antiguos del mismo usuario primero
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
    
    // Guardar el nuevo token
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    );
    
    return true;
  } catch (error) {
    console.error('Error al guardar refresh token:', error);
    return false;
  }
};

// Función para verificar un token JWT
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Error verificando token:', error.message);
    return null;
  }
};

// Función para verificar un refresh token
const verifyRefreshToken = async (token) => {
  try {
    const result = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error verificando refresh token:', error);
    return null;
  }
};

// Middleware para verificar autenticación
const authenticateToken = (req, res, next) => {
  // Obtener token del encabezado Authorization
  const authHeader = req.headers['authorization'];
  console.log(`[AUTH] Verificando token para ${req.method} ${req.path}`);
  
  if (!authHeader) {
    console.log('[AUTH] No se encontró token');
    return res.status(401).json({
      success: false,
      error: 'Token requerido',
      message: 'No se proporcionó token de autenticación'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    console.log('[AUTH] Token mal formateado (sin "Bearer")');
    return res.status(401).json({
      success: false,
      error: 'Token inválido',
      message: 'Formato de token inválido'
    });
  }
  
  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Adjuntar información del usuario a la solicitud para uso posterior
    req.user = decoded;
    
    // Verificar que el usuario exista en la BD y esté activo
    pool.query('SELECT is_active FROM users WHERE id = $1', [decoded.id])
      .then(result => {
        if (result.rows.length === 0) {
          console.log(`[AUTH] Usuario no encontrado: ${decoded.id}`);
          return res.status(401).json({
            success: false,
            error: 'Usuario inválido',
            message: 'El usuario asociado al token no existe'
          });
        }
        
        if (!result.rows[0].is_active) {
          console.log(`[AUTH] Usuario inactivo: ${decoded.id}`);
          return res.status(403).json({
            success: false,
            error: 'Usuario inactivo',
            message: 'Tu cuenta está desactivada. Contacta al administrador.'
          });
        }
        
        // Usuario encontrado y activo, proceder
        console.log(`[AUTH] Usuario ${decoded.id} autenticado correctamente`);
        next();
      })
      .catch(err => {
        console.error('Error al verificar usuario en BD:', err);
        return res.status(500).json({
          success: false,
          error: 'Error de servidor',
          message: 'Error al verificar usuario en la base de datos'
        });
      });
  } catch (error) {
    console.error('Error verificando token:', error.message);
    
    // Mensajes específicos según el tipo de error
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado',
        message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido',
        message: 'Token de autenticación inválido.',
        code: 'INVALID_TOKEN'
      });
    }
    
    return res.status(403).json({
      success: false,
      error: 'Error de autenticación',
      message: 'No autorizado: ' + error.message
    });
  }
};

// Middleware para verificar roles
const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'No autorizado',
        message: 'Acceso denegado' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        error: 'Permisos insuficientes',
        message: 'No tienes permiso para acceder a este recurso' 
      });
    }
    
    next();
  };
};

// Función para hashear una contraseña
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  } catch (error) {
    console.error('Error hasheando contraseña:', error);
    throw new Error('Error en el procesamiento de la contraseña');
  }
};

// Función para comparar una contraseña con un hash
const comparePassword = async (password, hash) => {
  try {
    return bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Error comparando contraseña:', error);
    throw new Error('Error en la verificación de la contraseña');
  }
};

// Función para revocar un refresh token
const revokeRefreshToken = async (token) => {
  try {
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
    return true;
  } catch (error) {
    console.error('Error revocando refresh token:', error);
    return false;
  }
};

// Función para revocar todos los tokens de un usuario
const revokeAllUserTokens = async (userId) => {
  try {
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
    return true;
  } catch (error) {
    console.error('Error revocando tokens de usuario:', error);
    return false;
  }
};

// Validación de datos de usuario
const validateUserData = (data) => {
  const errors = {};
  
  // Validar nombre de usuario
  if (!data.username) {
    errors.username = 'El nombre de usuario es obligatorio';
  } else if (data.username.length < 3) {
    errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
  } else if (data.username.length > 30) {
    errors.username = 'El nombre de usuario no puede exceder los 30 caracteres';
  } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
    errors.username = 'El nombre de usuario solo puede contener letras, números y guiones bajos';
  }
  
  // Validar email
  if (!data.email) {
    errors.email = 'El email es obligatorio';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'El formato del email no es válido';
  }
  
  // Validar contraseña
  if (!data.password) {
    errors.password = 'La contraseña es obligatoria';
  } else if (data.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres';
  } else if (!/[A-Z]/.test(data.password)) {
    errors.password = 'La contraseña debe contener al menos una letra mayúscula';
  } else if (!/[0-9]/.test(data.password)) {
    errors.password = 'La contraseña debe contener al menos un número';
  }
  
  // Validar fullName si está presente
  if (data.fullName && data.fullName.length > 100) {
    errors.fullName = 'El nombre completo no puede exceder los 100 caracteres';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken,
  authorizeRoles,
  hashPassword,
  comparePassword,
  validateUserData,
  generateRefreshToken,
  saveRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens
};
