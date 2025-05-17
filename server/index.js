const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { pool, initializeDatabase } = require('./config/database');
const { createTransporter } = require('./config/email');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const csv = require('csv-parser');
const crypto = require('crypto');
const { 
  generateToken, 
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
} = require('./config/auth');

// Función de debug
const debugImages = (message) => {
  console.log(`[DEBUG IMÁGENES SERVIDOR] ${message}`);
};

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const allowedOrigins = [
  // URLs de producción
  'https://culturadigital.vercel.app',
  'https://www.culturadigital.vercel.app',
  // URLs de desarrollo - comentadas en producción
  // 'http://localhost:8080',
  // 'http://localhost:8081',
  // 'http://localhost:5173',
  // 'http://127.0.0.1:8080',
  // 'http://127.0.0.1:5173',
  // 'http://192.168.20.180:5173'
];

// Updated CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Durante el desarrollo, podemos permitir todas las solicitudes
    // En producción, esto debería ser más estricto
    if (!origin || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`Origin ${origin} not allowed by CORS policy, but allowing in development`);
      callback(null, true); // Permitir en desarrollo aunque no esté en la lista
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));

// Modificar la segunda configuración CORS (línea ~47)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD'); // ✅ Añadido PATCH
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Configurar multer para la subida de archivos
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo no soportado'), false);
    }
  }
});

// Variables globales para servicios
let transporter;

// Nueva configuración para servir archivos estáticos del frontend
const frontendBuildPath = path.join(__dirname, '../dist');
if (fs.existsSync(frontendBuildPath)) {
  console.log('Sirviendo archivos estáticos desde:', frontendBuildPath);
  app.use(express.static(frontendBuildPath));
}

// Basic route to check if server is running
app.get('/', (req, res) => {
  res.status(200).send('Servidor de correo electrónico funcionando correctamente (Nodemailer)');
});

// Inicialización de servicios
const initializeServices = async () => {
  try {
    console.log('Inicializando servicios del servidor...');
    
    // Inicializar base de datos
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.warn('PostgreSQL no está disponible - el historial de emails no funcionará');
    }
    
    // Inicializar servicio de correo
    transporter = await createTransporter();
    if (!transporter) {
      console.error('Error: Configuración de correo electrónico inválida');
      return { success: false, error: 'Email configuration missing' };
    }
    
    console.log('Inicialización de servicios completada');
    return { success: true };
  } catch (error) {
    console.error('Error general en la inicialización de servicios:', error);
    return { success: false, error };
  }
};

// Función para registrar el email en PostgreSQL
async function logEmailToDatabase(emailData, result, userId) {
  try {
    // Convertir destinatarios a array de strings
    let recipients = [];
    if (Array.isArray(emailData.to)) {
      recipients = emailData.to.map(r => typeof r === 'object' ? r.email : r);
    } else {
      recipients = [typeof emailData.to === 'object' ? emailData.to.email : emailData.to];
    }
    
    // Limpiar el content_preview - NUEVO
    let contentPreview = emailData.content_preview || '';
    
    // Si es demasiado largo, acortarlo
    if (contentPreview.length > 5000) {
      contentPreview = contentPreview.substring(0, 5000) + '...';
    }

    // Usar userId o valor por defecto (1 para compatibilidad con registros antiguos)
    const userIdValue = userId || 1;
    
    // Insertar registro con el content_preview limpio
    await pool.query(
      `INSERT INTO emails 
        (user_id, to_email, subject, from_email, from_name, status, message, email_id, content_preview, 
        titulo_principal, subtitulo, contenido, imagenes_base64, imagenes_url, imagenes_total_kb, template_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        userIdValue,
        recipients,
        emailData.subject,
        typeof emailData.from === 'object' ? emailData.from.email : emailData.from,
        typeof emailData.from === 'object' ? emailData.from.name : null,
        result.success ? 'sent' : 'failed',
        result.message,
        result.id,
        contentPreview, // Usamos la versión limpiada
        emailData.titulo_principal || null,
        emailData.subtitulo || null,
        emailData.contenido || null,
        emailData.imagenes_base64 || 0,
        emailData.imagenes_url || 0,
        emailData.imagenes_total_kb || 0,
        emailData.template_id || null // Guardar el ID de la plantilla
      ]
    );
    console.log('Email registrado en PostgreSQL');
  } catch (error) {
    console.error('Error al registrar el email en PostgreSQL:', error);
  }
}

const prepareHtmlForEmail = (html) => {
  debugImages(`Procesando HTML para correo...`);
  
  // 1. Eliminar completamente atributos data-*
  let cleanHtml = html.replace(/\s+data-[a-zA-Z0-9\-_]+="[^"]*"/g, '');
  debugImages(`Atributos data-* eliminados`);
  
  // 2. Cambiar todas las imágenes a una estructura más compatible
  cleanHtml = cleanHtml.replace(/<img([^>]*)>/g, (match, attributes) => {
    debugImages(`Procesando etiqueta de imagen`);
    
    // Extraer el src de la imagen
    const srcMatch = attributes.match(/src=["']([^"']*)["']/);
    if (!srcMatch) {
      debugImages(`Imagen sin atributo src - omitiendo`);
      return match;
    }
    
    const imgSrc = srcMatch[1];
    debugImages(`Imagen src: ${imgSrc.substring(0, 30)}...`);
    
    // Verificar el tipo de imagen (base64 o URL)
    const isBase64 = imgSrc.startsWith('data:');
    
    // Extraer el atributo alt si existe
    const altMatch = attributes.match(/alt=["']([^"']*)["']/);
    const altText = altMatch ? altMatch[1] : 'Imagen';
    
    // Usar siempre la URL original y asegurar que las URLs externas carguen correctamente
    return `
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="center" style="padding: 10px;">
            <img src="${imgSrc}" alt="${altText}" style="display: block; max-width: 100%; height: auto; border: 0;" border="0" width="auto" />
          </td>
        </tr>
      </table>`;
  });
  
  debugImages(`Procesamiento HTML completado`);
  return cleanHtml;
};

// Función para enviar correo con Nodemailer
const sendWithNodemailer = async (data) => {
  try {
    const { to, subject, html, from } = data;
    const defaultFromEmail = process.env.DEFAULT_FROM_EMAIL || 'noreply@example.com';
    let fromEmail;
    
    if (typeof from === 'object' && from.email) {
      fromEmail = `"${from.name || 'Programa Cultura Digital'}" <${from.email}>`;
    } else if (typeof from === 'string') {
      if (from.includes('<') && from.includes('>')) {
        fromEmail = from;
      } else {
        fromEmail = `"Programa Cultura Digital" <${from}>`;
      }
    } else {
      fromEmail = `"Programa Cultura Digital" <${defaultFromEmail}>`;
    }
    
    console.log('Nodemailer: Enviando desde', fromEmail);
    console.log('Nodemailer: Enviando a', JSON.stringify(to));
    
    const formattedTo = Array.isArray(to) 
      ? to.map(r => typeof r === 'object' ? r.email : r).join(',') 
      : typeof to === 'object' ? to.email : to;

    // IMPORTANTE: Primero procesar el HTML
    const processedHtml = prepareHtmlForEmail(html);
    
    // Convertir a texto plano para mejorar la entrega
    const plainText = processedHtml
      .replace(/<[^>]*>?/gm, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Contar imágenes para depuración (AHORA ES SEGURO USAR processedHtml)
    const base64Count = (processedHtml.match(/data:image\//g) || []).length;
    const urlCount = (processedHtml.match(/src=["']https?:\/\//g) || []).length;
    debugImages(`El correo contiene ${base64Count} imágenes base64 y ${urlCount} imágenes URL`);

   // Extraer imágenes del HTML
const imageUrls = [];
const imageBase64 = [];
let modifiedHtml = processedHtml.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/g, (match, src) => {
  // Procesar imágenes externas (URLs)
  if (src.startsWith('https://') || src.startsWith('http://')) {
    // Generar un ID único para cada imagen
    const cid = `img-${Date.now()}-${imageUrls.length + 1}@culturadigital`;
    imageUrls.push({ url: src, cid: cid });
    // Reemplazar el src con cid: format
    return match.replace(/src=["'][^"']+["']/g, `src="cid:${cid}"`);
  }
  // Procesar imágenes base64
  else if (src.startsWith('data:image/')) {
    try {
      // Extraer tipo de imagen y datos
      const matches = src.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const imageType = matches[1]; // jpeg, png, etc.
        const base64Data = matches[2];
        const cid = `base64-${Date.now()}-${imageBase64.length + 1}@culturadigital`;
        
        imageBase64.push({
          data: base64Data,
          type: imageType,
          cid: cid
        });
        
        // Reemplazar base64 con referencia CID
        return match.replace(/src=["'][^"']+["']/g, `src="cid:${cid}"`);
      }
    } catch (e) {
      console.error('Error procesando imagen base64:', e);
    }
  }
  return match;
});

// Preparar adjuntos con los Content-ID correctos
const attachments = [
  // Imágenes de URL
  ...imageUrls.map(img => ({
    filename: `imagen-${img.cid.split('@')[0]}.jpg`,
    path: img.url,
    cid: img.cid,
    contentDisposition: 'inline',
    contentType: 'image/jpeg'
  })),
  
  // Imágenes base64
  ...imageBase64.map(img => ({
    filename: `imagen-${img.cid.split('@')[0]}.${img.type}`,
    content: Buffer.from(img.data, 'base64'),
    cid: img.cid,
    contentDisposition: 'inline',
    contentType: `image/${img.type}`
  }))
];

// Enviar email con los adjuntos
const info = await transporter.sendMail({
  from: fromEmail,
  to: formattedTo,
  subject: subject,
  text: plainText,
  html: modifiedHtml,
  attachments: attachments
});

    debugImages(`Correo enviado con éxito - ID ${info.messageId}`);
    
    return {
      success: true,
      message: 'Correo enviado exitosamente con Nodemailer',
      id: info.messageId || Date.now().toString(),
      imageInfo: {
        base64Count,
        urlCount,
        totalSize: Math.round(processedHtml.length/1024)
      }
    };
  } catch (error) {
    console.error('Error al enviar correo con Nodemailer:', error);
    throw new Error(`Nodemailer: ${error.message}`);
  }
};

// Endpoint para solicitar restablecimiento de contraseña
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email requerido',
        message: 'Por favor proporcione un correo electrónico'
      });
    }
    
    // Buscar al usuario por email
    const userQuery = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    // Si el usuario no existe, simulamos éxito por seguridad
    // (evitamos revelar información sobre qué emails están registrados)
    if (userQuery.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Instrucciones de restablecimiento enviadas (si el email existe)'
      });
    }
    
    const user = userQuery.rows[0];
    
    // Generar token de restablecimiento (válido por 24 horas en lugar de 30 minutos)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
    
    // Guardar token en la base de datos
    await pool.query(
      `UPDATE users 
       SET reset_password_token = $1, reset_password_expires = $2 
       WHERE id = $3`,
      [resetToken, resetExpires, user.id]
    );
    
    // Determinar la URL base para el enlace de restablecimiento
    let baseUrl = process.env.FRONTEND_URL || 'https://culturadigital.vercel.app';
    
    console.log(`Using base URL for password reset: ${baseUrl}`);
    
    // Construir URL de restablecimiento con la URL base
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;
    
    console.log(`Generando enlace de restablecimiento: ${resetUrl} para ${email}`);
    
    // Enviar correo electrónico con el enlace
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0052A5;">Restablecimiento de contraseña</h2>
        <p>Hola ${user.full_name || user.username},</p>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <p style="margin: 20px 0;">
          <a href="${resetUrl}" 
             style="background-color: #0052A5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
             Restablecer mi contraseña
          </a>
        </p>
        <p>Si el botón no funciona, copia y pega esta URL en tu navegador:</p>
        <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 14px;">${resetUrl}</p>
        <p>Este enlace expirará en 24 horas.</p>
        <p>Si no solicitaste este restablecimiento, puedes ignorar este mensaje y tu contraseña seguirá siendo la misma.</p>
        <p>Saludos,<br>Equipo de Cultura Digital</p>
      </div>
    `;
    
    try {
      // Enviar el correo utilizando la función existente de envío de correos
      await sendWithNodemailer({
        to: user.email,
        subject: "Restablecimiento de contraseña - Cultura Digital",
        html: emailHtml,
        from: {
          name: "Programa Cultura Digital",
          email: process.env.DEFAULT_FROM_EMAIL || "noreply@example.com"
        }
      });
      
      res.status(200).json({
        success: true,
        message: 'Instrucciones de restablecimiento enviadas'
      });
    } catch (emailError) {
      console.error('Error al enviar correo de restablecimiento:', emailError);
      // Si falla el envío, eliminar el token de restablecimiento
      await pool.query(
        'UPDATE users SET reset_password_token = NULL, reset_password_expires = NULL WHERE id = $1',
        [user.id]
      );
      
      return res.status(500).json({
        success: false,
        error: 'Error al enviar correo',
        message: 'No se pudo enviar el correo de restablecimiento'
      });
    }
  } catch (error) {
    console.error('Error en solicitud de restablecimiento:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor',
      message: 'Ha ocurrido un error al procesar la solicitud de restablecimiento'
    });
  }
});

// Endpoint para verificar token de restablecimiento
app.get('/api/auth/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token requerido',
        message: 'Token no proporcionado'
      });
    }
    
    console.log(`Verificando token: ${token}`);
    
    // Buscar usuario con este token y que no haya expirado
    const userQuery = await pool.query(
      `SELECT * FROM users 
       WHERE reset_password_token = $1 AND reset_password_expires > NOW()`,
      [token]
    );
    
    if (userQuery.rows.length === 0) {
      console.log(`Token inválido o expirado: ${token}`);
      return res.status(400).json({
        success: false,
        error: 'Token inválido',
        message: 'El token es inválido o ha expirado'
      });
    }
    
    console.log(`Token válido para usuario: ${userQuery.rows[0].username}`);
    res.status(200).json({
      success: true,
      message: 'Token válido'
    });
  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor',
      message: 'Ha ocurrido un error al verificar el token'
    });
  }
});

// Endpoint para restablecer contraseña
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos',
        message: 'Token y contraseña son requeridos'
      });
    }
    
    // Validar longitud de contraseña
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Contraseña insegura',
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    }
    
    // Buscar usuario con este token y que no haya expirado
    const userQuery = await pool.query(
      `SELECT * FROM users 
       WHERE reset_password_token = $1 AND reset_password_expires > NOW()`,
      [token]
    );
    
    if (userQuery.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Token inválido',
        message: 'El enlace de restablecimiento es inválido o ha expirado'
      });
    }
    
    const user = userQuery.rows[0];
    
    // Hashear nueva contraseña
    const hashedPassword = await hashPassword(password);
    
    // Actualizar contraseña y eliminar token de restablecimiento
    await pool.query(
      `UPDATE users 
       SET password = $1, reset_password_token = NULL, reset_password_expires = NULL, updated_at = NOW() 
       WHERE id = $2`,
      [hashedPassword, user.id]
    );
    
    // Revocar todas las sesiones existentes para mayor seguridad
    await revokeAllUserTokens(user.id);
    
    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor',
      message: 'Ha ocurrido un error al restablecer la contraseña'
    });
  }
});

// Función para registrar intento de inicio de sesión
async function logLoginAttempt(username, ipAddress, success) {
  try {
    await pool.query(
      'INSERT INTO login_attempts (username, ip_address, success) VALUES ($1, $2, $3)',
      [username, ipAddress, success]
    );
  } catch (error) {
    console.error('Error al registrar intento de inicio de sesión:', error);
  }
}

// Función para verificar bloqueo por intentos fallidos
async function checkLoginThrottle(username, ipAddress) {
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
    
    // Si hay más de 5 intentos fallidos, bloquear temporalmente
    if (attempts >= 100) {
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
}

// Ruta para enviar correos
app.post('/api/send-email', authenticateToken, async (req, res) => {
  try {
    const { to, subject, htmlContent, from, titulo_principal, subtitulo, contenido, template_id } = req.body;
    
    // Obtener el ID del usuario del token de autenticación
    const userId = req.user.id;

    if (!to || !subject || !htmlContent) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan campos requeridos (to, subject, htmlContent)' 
      });
    }
    
    console.log('Nueva solicitud de envío de correo:');
    console.log(`- Destinatario: ${typeof to === 'object' ? JSON.stringify(to) : to}`);
    console.log(`- Asunto: ${subject}`);
    console.log(`- Titulo: ${titulo_principal}`);
    console.log(`- Subtitulo: ${subtitulo}`);
    console.log(`- Contenido: ${contenido}`);
    console.log(`- Tamaño del contenido: ${htmlContent.length} bytes`);
    
    const defaultFromEmail = process.env.DEFAULT_FROM_EMAIL || 'noreply@example.com';
    const formattedFrom = from?.name 
      ? { email: from.email || defaultFromEmail, name: from.name }
      : defaultFromEmail;
    
    let validatedTo;
    if (Array.isArray(to)) {
      validatedTo = to.filter(email => {
        const emailStr = typeof email === 'object' ? email.email : email;
        return emailStr && emailStr.includes('@') && emailStr.includes('.');
      });
      if (validatedTo.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No hay direcciones de correo válidas entre los destinatarios'
        });
      }
    } else if (typeof to === 'object' && to.email) {
      if (!to.email.includes('@') || !to.email.includes('.')) {
        return res.status(400).json({
          success: false,
          message: 'La dirección de correo del destinatario no es válida'
        });
      }
      validatedTo = to;
    } else if (typeof to === 'string') {
      if (!to.includes('@') || !to.includes('.')) {
        return res.status(400).json({
          success: false,
          message: 'La dirección de correo del destinatario no es válida'
        });
      }
      validatedTo = to;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Formato de destinatario no válido'
      });
    }
    
    // Modificamos la forma en que procesamos content_preview
    let contentPreview = req.body.content_preview || '';
    
    // Limpiamos las marcas de DOCTYPE y etiquetas HTML externas antes de guardar
    contentPreview = contentPreview
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/<html[^>]*>|<\/html>/gi, '')
      .replace(/<head[\s\S]*?<\/head>/gi, '')
      .replace(/<body[^>]*>/gi, '').replace(/<\/body>/gi, '');
    
    const result = await sendWithNodemailer({
      to: validatedTo,
      from: formattedFrom,
      subject,
      html: htmlContent
    });
    
        // Extrae la info de imágenes del resultado
        const imagenes_base64 = result.imageInfo?.base64Count || 0;
        const imagenes_url = result.imageInfo?.urlCount || 0;
        const imagenes_total_kb = result.imageInfo?.totalSize || 0;
    
        // Incluye todos los campos en emailData
        const emailData = { 
          to: validatedTo, 
          subject, 
          htmlContent, 
          from: formattedFrom,
          titulo_principal,
          subtitulo,
          contenido,
          content_preview: contentPreview,
          template_id: template_id || null,
          imagenes_base64,
          imagenes_url,
          imagenes_total_kb
        };
    await logEmailToDatabase(emailData, result, userId).catch(err => {
      console.error('Error al registrar email:', err);
    });
    
    res.header('Access-Control-Allow-Origin', '*');
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.header('Access-Control-Allow-Origin', '*');
    res.status(500).json({
      success: false,
      message: `Error al enviar el correo: ${error.message}`,
    });
  }
});

// Endpoint para programar correo para envío futuro
app.post('/api/schedule-email', authenticateToken, async (req, res) => {
  try {
    const { 
      to, subject, htmlContent, scheduled_for, 
      from, titulo_principal, subtitulo, contenido, template_id, image_url 
    } = req.body;

    // Obtener el ID del usuario del token de autenticación
    const userId = req.user && req.user.id ? req.user.id : null;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado',
        message: 'No se pudo identificar el usuario para programar el correo'
      });
    }

    if (!to || !subject || !htmlContent || !scheduled_for) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos',
        message: 'Los campos destinatario, asunto, contenido y fecha de programación son obligatorios'
      });
    }
    
    // Validar la fecha de programación
    const scheduledDate = new Date(scheduled_for);
    const now = new Date();
    
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Fecha inválida',
        message: 'El formato de la fecha de programación es inválido'
      });
    }
    
    if (scheduledDate <= now) {
      return res.status(400).json({
        success: false,
        error: 'Fecha en el pasado',
        message: 'La fecha de programación debe ser en el futuro'
      });
    }
    
    // Validar destinatario
    let validatedTo;
    if (Array.isArray(to)) {
      validatedTo = to.map(recipient => {
        return typeof recipient === 'object' ? recipient : { email: recipient };
      });
    } else {
      validatedTo = [typeof to === 'object' ? to : { email: to }];
    }
    
    // Validar remitente
    const defaultFromEmail = process.env.DEFAULT_FROM_EMAIL || 'noreply@example.com';
    const formattedFrom = from?.name 
      ? { email: from.email || defaultFromEmail, name: from.name }
      : { email: defaultFromEmail, name: 'Programa Cultura Digital' };

    const emailsArray = validatedTo.map(recipient => 
      typeof recipient === 'object' ? recipient.email : recipient
    );
    
    // Guardar en la base de datos (ahora incluye user_id)
    const result = await pool.query(
      `INSERT INTO scheduled_emails 
       (user_id, to_email, subject, html_content, from_email, from_name, 
        scheduled_for, status, titulo_principal, subtitulo, contenido, 
        template_id, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id`,
      [
        userId,
        emailsArray,
        subject,
        htmlContent,
        formattedFrom.email,
        formattedFrom.name,
        scheduledDate,
        'pending',
        titulo_principal || null,
        subtitulo || null,
        contenido || null,
        template_id || null,
        image_url || null
      ]
    );
    
    res.status(201).json({
      success: true,
      message: 'Correo programado exitosamente',
      id: result.rows[0].id,
      scheduled_for: scheduledDate
    });
  } catch (error) {
    console.error('Error al programar correo:', error);
    res.status(500).json({
      success: false,
      message: `Error al programar el correo: ${error.message}`,
    });
  }
});

// Endpoint para obtener correos programados
app.get('/api/scheduled-emails', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const userId = req.user.id; // Obtener el ID del usuario autenticado
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Construir query con filtrado por usuario
    const queryParams = [userId]; // Primer parámetro es siempre el userId
    let query = 'SELECT * FROM scheduled_emails WHERE user_id = $1';
    
    // Agregar filtro por status si existe
    if (status) {
      query += ' AND status = $2';
      queryParams.push(status);
    }
    
    // Agregar límite y offset
    query += ' ORDER BY scheduled_for DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    queryParams.push(limit, offset);
    
    console.log("Query correos programados:", query);
    console.log("Params:", queryParams);
    
    const result = await pool.query(query, queryParams);
    
    // Obtener el conteo total (filtrado por usuario)
    let countQuery = 'SELECT COUNT(*) FROM scheduled_emails WHERE user_id = $1';
    const countParams = [userId];
    
    if (status) {
      countQuery += ' AND status = $2';
      countParams.push(status);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener correos programados:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor',
      message: `Error al obtener correos programados: ${error.message}`
    });
  }
});

// Endpoint para cancelar un correo programado
app.patch('/api/scheduled-emails/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que exista y esté pendiente
    const checkResult = await pool.query(
      'SELECT * FROM scheduled_emails WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No encontrado',
        message: 'El correo programado no existe'
      });
    }
    
    const scheduledEmail = checkResult.rows[0];
    
    if (scheduledEmail.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Estado inválido',
        message: `No se puede cancelar un correo en estado "${scheduledEmail.status}"`
      });
    }
    
    // Cancelar el correo
    await pool.query(
      'UPDATE scheduled_emails SET status = $1, processed_at = NOW() WHERE id = $2',
      ['cancelled', id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Correo programado cancelado exitosamente'
    });
  } catch (error) {
    console.error('Error al cancelar correo programado:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor',
      message: `Error al cancelar correo programado: ${error.message}`
    });
  }
});

// Endpoint para editar un correo programado (solo si está en estado 'pending'/'scheduled')
app.put('/api/scheduled-emails/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, to_email, html_content, scheduled_for } = req.body;
    
    // Verificar que el usuario autenticado tenga acceso a este correo
    const userId = req.user.id;
    
    // Solo permitir editar si está programado/pending
    const checkResult = await pool.query(
      'SELECT * FROM scheduled_emails WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No encontrado',
        message: 'El correo programado no existe'
      });
    }
    
    const scheduledEmail = checkResult.rows[0];
    
    // Verificar el estado - solo permitir editar en estado pending o scheduled
    if (scheduledEmail.status !== 'pending' && scheduledEmail.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        error: 'No editable',
        message: 'Solo se pueden editar correos programados que aún no han sido enviados'
      });
    }
    
    // Preparar datos para actualizar
    const updateFields = [];
    const updateValues = [];
    let paramCounter = 1;
    
    // Construir la consulta dinámicamente según los campos recibidos
    if (subject) {
      updateFields.push(`subject = $${paramCounter}`);
      updateValues.push(subject);
      paramCounter++;
    }
    
    if (to_email) {
      // Convertir a array si no lo es
      const emailArray = Array.isArray(to_email) ? to_email : [to_email];
      updateFields.push(`to_email = $${paramCounter}`);
      updateValues.push(emailArray);
      paramCounter++;
    }
    
    if (html_content) {
      updateFields.push(`html_content = $${paramCounter}`);
      updateValues.push(html_content);
      paramCounter++;
    }
    
    if (scheduled_for) {
      const newScheduledDate = new Date(scheduled_for);
      const now = new Date();
      
      if (isNaN(newScheduledDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Fecha inválida',
          message: 'El formato de la fecha de programación es inválido'
        });
      }
      
      if (newScheduledDate <= now) {
        return res.status(400).json({
          success: false,
          error: 'Fecha en el pasado',
          message: 'La fecha de programación debe ser en el futuro'
        });
      }
      
      updateFields.push(`scheduled_for = $${paramCounter}`);
      updateValues.push(newScheduledDate);
      paramCounter++;
    }
    
    // Agregar updated_at siempre
    updateFields.push(`updated_at = NOW()`);
    
    // Si no hay campos para actualizar, retornar error
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos insuficientes',
        message: 'No se proporcionaron campos para actualizar'
      });
    }
    
    // Agregar el ID como último parámetro
    updateValues.push(id);
    
    // Construir y ejecutar la consulta SQL
    const updateQuery = `
      UPDATE scheduled_emails 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, updateValues);
    
    res.status(200).json({
      success: true,
      message: 'Correo programado actualizado correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al editar correo programado:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor',
      message: `Error al editar correo programado: ${error.message}`
    });
  }
});

// Función para verificar y enviar correos programados
const checkScheduledEmails = async () => {
  try {
    console.log('Verificando correos programados...');
    
    // Obtener correos pendientes cuya hora programada ya pasó
    const now = new Date();
    const result = await pool.query(
      `SELECT * FROM scheduled_emails 
       WHERE status = 'pending' AND scheduled_for <= $1
       ORDER BY scheduled_for ASC
       LIMIT 10`,
      [now]
    );
    
    if (result.rows.length === 0) {
      return;
    }
    
    console.log(`Encontrados ${result.rows.length} correos programados para enviar`);
    
    // Procesar cada correo programado
    for (const scheduledEmail of result.rows) {
      console.log(`Procesando correo programado ID: ${scheduledEmail.id}`);
      
      try {
        // Actualizar estado a "procesando"
        await pool.query(
          `UPDATE scheduled_emails SET status = 'processing' WHERE id = $1`,
          [scheduledEmail.id]
        );
        
  // Preparar datos de envío - MODIFICAR ESTA PARTE
  let toRecipients;
  
  // Verificar el tipo de dato de to_email
  if (Array.isArray(scheduledEmail.to_email)) {
    // Ya es un array, usarlo directamente
    toRecipients = scheduledEmail.to_email;
  } else if (typeof scheduledEmail.to_email === 'string') {
    // Si es un string, pero no es JSON (comienza con '['), tratarlo como email único
    if (scheduledEmail.to_email.startsWith('[')) {
      try {
        toRecipients = JSON.parse(scheduledEmail.to_email);
      } catch (e) {
        // Si falla el parsing, tratarlo como un array con un único email
        toRecipients = [scheduledEmail.to_email];
      }
    } else {
      // Es un email único
      toRecipients = [scheduledEmail.to_email];
    }
  } else {
    // Valor por defecto si no es array ni string
    toRecipients = [];
  }
        
        const emailData = {
          to: toRecipients,
          subject: scheduledEmail.subject,
          html: scheduledEmail.html_content,
          from: {
            email: scheduledEmail.from_email,
            name: scheduledEmail.from_name
          },
          titulo_principal: scheduledEmail.titulo_principal,
          subtitulo: scheduledEmail.subtitulo,
          contenido: scheduledEmail.contenido,
          template_id: scheduledEmail.template_id
        };
        
        // Enviar el correo
        const result = await sendWithNodemailer(emailData);
        
        // Registrar el resultado
        await pool.query(
          `UPDATE scheduled_emails 
           SET status = $1, processed_at = NOW(), error_message = $2
           WHERE id = $3`,
          [result.success ? 'sent' : 'failed', result.success ? null : result.message, scheduledEmail.id]
        );
        
        console.log(`Correo programado enviado exitosamente: ${scheduledEmail.id}`);
        
        // Registrar el email enviado en la tabla emails
        await logEmailToDatabase(emailData, result, scheduledEmail.user_id).catch(err => {
          console.error('Error al registrar correo enviado:', err);
        });
        
      } catch (error) {
        console.error(`Error al procesar correo programado ${scheduledEmail.id}:`, error);
        
        // Actualizar el estado a fallido
        await pool.query(
          `UPDATE scheduled_emails 
           SET status = 'failed', processed_at = NOW(), error_message = $1
           WHERE id = $2`,
          [error.message, scheduledEmail.id]
        );
      }
    }
  } catch (error) {
    console.error('Error al verificar correos programados:', error);
  }
};

// Configurar ejecución periódica (cada minuto)
let schedulerInterval;

const startScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }
  
  // Ejecutar cada minuto
  schedulerInterval = setInterval(checkScheduledEmails, 60 * 1000);
  console.log('Programador de correos iniciado');
  
  // Ejecutar inmediatamente al iniciar
  checkScheduledEmails();
};

// Ruta para verificar el estado de los servicios
app.get('/api/status', async (req, res) => {
  const services = {
    server: true,
    email: !!transporter,
    database: await pool.query('SELECT NOW()').then(() => true).catch(() => false)
  };
  
  res.status(200).json({
    status: 'online',
    services,
    timestamp: new Date().toISOString()
  });
});

// Ruta para obtener historial de emails
app.get('/api/emails', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id; // Obtener el ID del usuario autenticado
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Obtener emails filtrando por usuario
    const emailsResult = await pool.query(
      `SELECT * FROM emails 
       WHERE user_id = $1
       ORDER BY timestamp DESC 
       LIMIT $2 OFFSET $3`, 
      [userId, limit, offset]
    );
    
    // Obtener conteo total para este usuario
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM emails WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countResult.rows[0].count);
    
    res.status(200).json({
      success: true,
      data: emailsResult.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener historial de emails:', error);
    res.status(500).json({
      success: false,
      message: `Error al obtener historial de emails: ${error.message}`,
      error: 'database_error'
    });
  }
});

// Endpoints para contactos
app.get('/api/contacts', authenticateToken, async (req, res) => {
  try {
    const { search } = req.query;
    const userId = req.user.id; // Obtener ID del usuario autenticado
    
    let query = 'SELECT * FROM contacts WHERE user_id = $1';
    const values = [userId];
    
    if (search) {
      query += ' AND (name ILIKE $2 OR email ILIKE $2)';
      values.push(`%${search}%`);
    }
    
    query += ' ORDER BY name ASC';
    
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener contactos:', error);
    res.status(500).json({ error: 'Error al obtener contactos' });
  }
});

// Busca alrededor de la línea 908 - Endpoint para crear contactos
app.post('/api/contacts', authenticateToken, async (req, res) => {
  try {
    const { name, email, status } = req.body;
    
    // Obtener el ID del usuario del token de autenticación
    const userId = req.user.id;
    
    // Verificar si el contacto ya existe para este usuario
    const existingContact = await pool.query(
      `SELECT * FROM contacts WHERE email = $1 AND user_id = $2`,
      [email, userId]
    );
    
    if (existingContact.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Contacto duplicado',
        message: 'Ya existe un contacto con ese email'
      });
    }
    
    // Incluir user_id en la inserción
    const result = await pool.query(
      `INSERT INTO contacts (name, email, status, user_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, email, status || 'active', userId]
    );
    
    res.status(201).json({
      success: true,
      contact: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear contacto:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor',
      message: `Error al crear contacto: ${error.message}`
    });
  }
});

app.patch('/api/contacts/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }
    
    const result = await pool.query(
      'UPDATE contacts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar estado del contacto:', error);
    res.status(500).json({ error: 'Error al actualizar estado del contacto' });
  }
});

// Endpoint para editar un contacto
app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }
    
    // Verificar si el email ya existe (y no es del mismo contacto)
    const checkEmail = await pool.query('SELECT id FROM contacts WHERE email = $1 AND id != $2', [email, id]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado por otro contacto' });
    }
    
    const result = await pool.query(
      'UPDATE contacts SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, email, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar contacto:', error);
    res.status(500).json({ error: 'Error al actualizar contacto' });
  }
});

// Endpoint para eliminar un contacto
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM contacts WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    
    res.json({ message: 'Contacto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar contacto:', error);
    res.status(500).json({ error: 'Error al eliminar contacto' });
  }
});

// Endpoint para exportar contactos a CSV
app.get('/api/contacts/export', async (req, res) => {
  try {
    const { listId, status } = req.query;
    
    let query = 'SELECT id, name, email, status FROM contacts';
    const params = [];
    let paramCount = 1;
    
    // Condiciones WHERE
    const conditions = [];
    
    // Si se proporciona un ID de lista, obtener solo los contactos de esa lista
    if (listId) {
      query = `
        SELECT c.id, c.name, c.email, c.status
        FROM contacts c
        JOIN list_contacts lc ON c.id = lc.contact_id
        WHERE lc.list_id = $${paramCount}
      `;
      params.push(listId);
      paramCount++;
    } else {
      query += ' WHERE 1=1';
    }
    
    // Si se proporciona un estado, filtrar por él
    if (status && ['active', 'inactive'].includes(status)) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    query += ' ORDER BY name ASC';
    
    const result = await pool.query(query, params);
    
    // Crear el contenido CSV
    const csvHeader = 'ID,Nombre,Email,Estado\n';
    const csvRows = result.rows.map(contact => {
      return `${contact.id},"${contact.name}","${contact.email}","${contact.status}"`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    // Configurar la respuesta como un archivo CSV para descargar
    res.setHeader('Content-Disposition', 'attachment; filename=contactos.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Error al exportar contactos:', error);
    res.status(500).json({ error: 'Error al exportar contactos' });
  }
});

// Endpoint para subir y procesar archivo CSV de contactos
app.post('/api/contacts/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    const results = [];
    let headers = [];

    // Procesar el archivo CSV
    fs.createReadStream(req.file.path)
      .pipe(csv({ mapHeaders: ({ header }) => header.trim().toLowerCase() }))
      .on('headers', (csvHeaders) => {
        headers = csvHeaders.map(h => h.trim().toLowerCase());
      })
      .on('data', (data) => {
        // Soportar tanto encabezados en español como en inglés
        // Normalizar claves
        const name = data.nombre || data.name;
        const email = data.email;
        const status = (data.estado || data.status || '').toLowerCase();

        // Permitir importar aunque venga el campo ID (lo ignoramos)
        if (name && email) {
          results.push({
            name: name.trim(),
            email: email.trim(),
            status: status === 'inactive' || status === 'inactivo' ? 'inactive' : 'active'
          });
        }
      })
      .on('end', () => {
        // Eliminar el archivo temporal
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error al eliminar archivo temporal:', err);
        });

        res.status(200).json({
          contacts: results,
          totalFound: results.length
        });
      })
      .on('error', (error) => {
        console.error('Error al procesar CSV:', error);
        res.status(500).json({ error: 'Error al procesar el archivo' });
      });
  } catch (error) {
    console.error('Error al procesar archivo de contactos:', error);
    res.status(500).json({ error: 'Error al procesar el archivo' });
  }
});

// FALTABA EL ENDPOINT PARA IMPORTAR CONTACTOS DESDE EL FRONTEND
// Debe ir después del endpoint de upload de contactos

app.post('/api/contacts/import', require('./config/auth').authenticateToken, async (req, res) => {
  try {
    const { contacts } = req.body;
    const userId = req.user.id;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ error: 'No hay contactos para importar' });
    }

    await pool.query('BEGIN');

    const insertedContacts = [];
    const errors = [];
    for (const contact of contacts) {
      try {
        // Validar campos requeridos
        if (!contact.name || !contact.email) {
          errors.push({ contact, error: 'Faltan campos requeridos (nombre o email)' });
          continue;
        }

        // Verificar si el contacto ya existe para este usuario
        const existing = await pool.query(
          'SELECT id FROM contacts WHERE email = $1 AND user_id = $2',
          [contact.email, userId]
        );
        if (existing.rows.length > 0) {
          errors.push({ contact, error: 'El email ya existe' });
          continue;
        }

        // Insertar contacto
        const result = await pool.query(
          'INSERT INTO contacts (name, email, status, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
          [contact.name, contact.email, contact.status || 'active', userId]
        );
        insertedContacts.push(result.rows[0]);
      } catch (error) {
        errors.push({ contact, error: error.message });
      }
    }

    await pool.query('COMMIT');
    res.status(200).json({
      success: insertedContacts.length,
      errors: errors.length,
      insertedContacts,
      errorDetails: errors
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error al importar contactos:', error);
    res.status(500).json({ error: 'Error al importar contactos' });
  }
});

// Endpoints para listas
app.get('/api/lists', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Obtener ID del usuario autenticado
    
    const result = await pool.query(`
      SELECT l.*, COUNT(lc.contact_id) as contact_count 
      FROM lists l 
      LEFT JOIN list_contacts lc ON l.id = lc.list_id 
      WHERE l.user_id = $1
      GROUP BY l.id 
      ORDER BY l.name ASC
    `, [userId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener listas:', error);
    res.status(500).json({ error: 'Error al obtener listas' });
  }
});

// Busca alrededor de la línea 1125 - Endpoint para crear listas
app.post('/api/lists', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Obtener el ID del usuario del token de autenticación
    const userId = req.user.id;
    
    // Incluir user_id en la inserción
    const result = await pool.query(
      `INSERT INTO lists (name, description, user_id) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, description, userId]
    );
    
    res.status(201).json({
      success: true,
      list: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear lista:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor',
      message: `Error al crear lista: ${error.message}`
    });
  }
});

app.put('/api/lists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Nombre es requerido' });
    }
    
    const result = await pool.query(
      'UPDATE lists SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, description || null, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar lista:', error);
    res.status(500).json({ error: 'Error al actualizar lista' });
  }
});

app.delete('/api/lists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM lists WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }
    
    res.json({ message: 'Lista eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar lista:', error);
    res.status(500).json({ error: 'Error al eliminar lista' });
  }
});


// Endpoint para eliminar un contacto de una lista
app.delete('/api/lists/:listId/contacts/:contactId', authenticateToken, async (req, res) => {
  try {
    const { listId, contactId } = req.params;
    const userId = req.user.id;
    
    console.log(`Intentando eliminar contacto ${contactId} de la lista ${listId} para usuario ${userId}`);
    
    // Verificar que la lista exista y pertenezca al usuario actual
    const listCheck = await pool.query(
      'SELECT id FROM lists WHERE id = $1 AND user_id = $2', 
      [listId, userId]
    );
    
    if (listCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Lista no encontrada',
        message: 'La lista no existe o no tienes permisos para modificarla'
      });
    }
    
    // Verificar que el contacto exista y pertenezca al usuario
    const contactCheck = await pool.query(
      'SELECT id FROM contacts WHERE id = $1 AND user_id = $2',
      [contactId, userId]
    );
    
    if (contactCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contacto no encontrado',
        message: 'El contacto no existe o no tienes permisos para eliminarlo de esta lista'
      });
    }
    
    // Eliminar la relación de la tabla list_contacts
    const result = await pool.query(
      'DELETE FROM list_contacts WHERE list_id = $1 AND contact_id = $2 RETURNING *',
      [listId, contactId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Relación no encontrada',
        message: 'El contacto no está asociado a esta lista'
      });
    }
    
    console.log(`Contacto ${contactId} eliminado exitosamente de la lista ${listId}`);
    
    res.status(200).json({
      success: true,
      message: 'Contacto eliminado de la lista exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar contacto de la lista:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor',
      message: 'Error al eliminar el contacto de la lista'
    });
  }
});

// Manejar la asignación de contactos a listas
app.post('/api/lists/:listId/contacts', authenticateToken, async (req, res) => {
  try {
    const { listId } = req.params;
    const { contactIds } = req.body;
    const userId = req.user.id; // Obtener el ID del usuario autenticado
    
    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({ error: 'Se requiere un array de IDs de contactos' });
    }
    
    // Verificar que la lista exista y pertenezca al usuario actual
    const listCheck = await pool.query(
      'SELECT id FROM lists WHERE id = $1 AND user_id = $2', 
      [listId, userId]
    );
    
    if (listCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Lista no encontrada',
        message: 'La lista no existe o no tienes permisos para modificarla'
      });
    }
    
    // Verificar que todos los contactos pertenezcan al usuario actual
    const contactsCheck = await pool.query(
      'SELECT COUNT(*) FROM contacts WHERE id = ANY($1::int[]) AND user_id = $2',
      [contactIds, userId]
    );
    
    if (parseInt(contactsCheck.rows[0].count) !== contactIds.length) {
      return res.status(403).json({ 
        error: 'Operación no permitida',
        message: 'Algunos contactos no existen o no tienes permisos para agregarlos a esta lista'
      });
    }
    
    // Usar una transacción para asegurar la integridad
    await pool.query('BEGIN');
    
    try {
      // Eliminar asignaciones existentes para evitar duplicados
      await pool.query(
        'DELETE FROM list_contacts WHERE list_id = $1 AND contact_id = ANY($2::int[])', 
        [listId, contactIds]
      );
      
      // Insertar nuevas asignaciones - usando un solo query
      const values = contactIds.map(contactId => `(${listId}, ${contactId})`).join(', ');
      
      if (values.length > 0) {
        await pool.query(`
          INSERT INTO list_contacts (list_id, contact_id) 
          VALUES ${values}
          ON CONFLICT (list_id, contact_id) DO NOTHING
        `);
      }
      
      await pool.query('COMMIT');
      
      res.status(200).json({ 
        success: true,
        message: 'Contactos agregados a la lista correctamente' 
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error al agregar contactos a la lista:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error en el servidor',
      message: `Error al agregar contactos a la lista: ${error.message}`
    });
  }
});

// Obtener contactos de una lista específica
app.get('/api/lists/:listId/contacts', authenticateToken, async (req, res) => {
  try {
    const { listId } = req.params;
    const userId = req.user.id; // Obtener ID del usuario autenticado
    
    // Verificar que la lista exista y pertenezca al usuario actual
    const listCheck = await pool.query(
      'SELECT id FROM lists WHERE id = $1 AND user_id = $2', 
      [listId, userId]
    );
    
    if (listCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Lista no encontrada',
        message: 'La lista no existe o no tienes permisos para acceder a ella'
      });
    }
    
    const result = await pool.query(`
      SELECT c.* 
      FROM contacts c
      JOIN list_contacts lc ON c.id = lc.contact_id
      WHERE lc.list_id = $1 AND c.user_id = $2
      ORDER BY c.name ASC
    `, [listId, userId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener contactos de la lista:', error);
    res.status(500).json({ error: 'Error al obtener contactos de la lista' });
  }
});

// Endpoint para exportar listas a CSV
app.get('/api/lists/export', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.id, l.name, l.description, COUNT(lc.contact_id) as contact_count 
      FROM lists l 
      LEFT JOIN list_contacts lc ON l.id = lc.list_id 
      GROUP BY l.id 
      ORDER BY l.name ASC
    `);
    
    // Crear el contenido CSV
    const csvHeader = 'ID,Nombre,Descripción,Cantidad de Contactos\n';
    const csvRows = result.rows.map(list => {
      return `${list.id},"${list.name}","${list.description || ''}","${list.contact_count || 0}"`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    // Configurar la respuesta como un archivo CSV para descargar
    res.setHeader('Content-Disposition', 'attachment; filename=listas.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Error al exportar listas:', error);
    res.status(500).json({ error: 'Error al exportar listas' });
  }
});

// Endpoint para subir y procesar archivo CSV de listas
app.post('/api/lists/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    const results = [];
    
    // Procesar el archivo CSV
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        // Validar que tenga al menos nombre
        if (data.nombre) {
          results.push({
            name: data.nombre.trim(),
            description: data.descripcion?.trim() || ''
          });
        } else if (data.name) {
          results.push({
            name: data.name.trim(),
            description: data.description?.trim() || ''
          });
        }
      })
      .on('end', () => {
        // Eliminar el archivo temporal
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error al eliminar archivo temporal:', err);
        });

        res.status(200).json({
          lists: results,
          totalFound: results.length
        });
      })
      .on('error', (error) => {
        console.error('Error al procesar CSV:', error);
        res.status(500).json({ error: 'Error al procesar el archivo' });
      });
  } catch (error) {
    console.error('Error al procesar archivo de listas:', error);
    res.status(500).json({ error: 'Error al procesar el archivo' });
  }
});


// Endpoint para importar listas desde el frontend (después de /api/lists/upload)
app.post('/api/lists/import', require('./config/auth').authenticateToken, async (req, res) => {
  try {
    const { lists } = req.body;
    const userId = req.user.id;

    if (!lists || !Array.isArray(lists) || lists.length === 0) {
      return res.status(400).json({ error: 'No hay listas para importar' });
    }

    await pool.query('BEGIN');

    const insertedLists = [];
    const errors = [];
    for (const list of lists) {
      try {
        // Validar campos requeridos
        if (!list.name) {
          errors.push({ list, error: 'Nombre faltante' });
          continue;
        }

        // Verificar si la lista ya existe para este usuario
        const existing = await pool.query(
          'SELECT id FROM lists WHERE name = $1 AND user_id = $2',
          [list.name, userId]
        );
        if (existing.rows.length > 0) {
          errors.push({ list, error: 'El nombre de la lista ya existe' });
          continue;
        }

        // Insertar lista
        const result = await pool.query(
          'INSERT INTO lists (name, description, user_id) VALUES ($1, $2, $3) RETURNING *',
          [list.name, list.description || '', userId]
        );
        insertedLists.push(result.rows[0]);
      } catch (error) {
        errors.push({ list, error: error.message });
      }
    }

    await pool.query('COMMIT');
    res.status(200).json({
      success: insertedLists.length,
      errors: errors.length,
      insertedLists,
      errorDetails: errors
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error al importar listas:', error);
    res.status(500).json({ error: 'Error al importar listas' });
  }
});

// Ruta que requiere rol de administrador
app.get('/api/admin/users', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const usersQuery = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    
    // No devolver las contraseñas ni tokens
    const users = usersQuery.rows.map(user => {
      const { password, reset_password_token, reset_password_expires, email_verification_token, ...userData } = user;
      return userData;
    });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error en el servidor',
      message: 'Ha ocurrido un error al obtener la lista de usuarios' 
    });
  }
});

// Endpoint para actualizar un usuario (para administración)
app.put('/api/admin/users/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      username, 
      email, 
      full_name, 
      role, 
      is_active, 
      avatar_url,
      email_verified 
    } = req.body;
    
    // Verificar si el usuario existe
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        message: 'El usuario que intentas actualizar no existe'
      });
    }
    
    // Verificar si el username o email ya están en uso por otro usuario
    if (username || email) {
      const duplicateCheck = await pool.query(
        'SELECT * FROM users WHERE (username = $1 OR email = $2) AND id != $3', 
        [username, email, id]
      );
      
      if (duplicateCheck.rows.length > 0) {
        const duplicate = duplicateCheck.rows[0];
        if (duplicate.username === username) {
          return res.status(400).json({
            success: false,
            error: 'Nombre de usuario duplicado',
            message: 'Este nombre de usuario ya está en uso por otro usuario'
          });
        }
        if (duplicate.email === email) {
          return res.status(400).json({
            success: false,
            error: 'Email duplicado',
            message: 'Este email ya está en uso por otro usuario'
          });
        }
      }
    }
    
    // Construir el objeto de actualización y la consulta dinámicamente
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (username) {
      updates.push(`username = $${paramIndex}`);
      values.push(username);
      paramIndex++;
    }
    
    if (email) {
      updates.push(`email = $${paramIndex}`);
      values.push(email);
      paramIndex++;
    }
    
    if (full_name !== undefined) {
      updates.push(`full_name = $${paramIndex}`);
      values.push(full_name);
      paramIndex++;
    }
    
    if (role) {
      updates.push(`role = $${paramIndex}`);
      values.push(role);
      paramIndex++;
    }
    
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      values.push(is_active);
      paramIndex++;
    }
    
    if (avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramIndex}`);
      values.push(avatar_url);
      paramIndex++;
    }
    
    if (email_verified !== undefined) {
      updates.push(`email_verified = $${paramIndex}`);
      values.push(email_verified);
      paramIndex++;
    }
    
    // Agregar id como último parámetro
    values.push(id);
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos insuficientes',
        message: 'No se proporcionaron datos para actualizar'
      });
    }
    
    // Construir la consulta final
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = NOW() 
      WHERE id = $${paramIndex} 
      RETURNING id, username, email, full_name, role, is_active, avatar_url, email_verified, created_at, updated_at
    `;
    
    const result = await pool.query(query, values);
    
    res.json({
      success: true,
      message: 'Usuario actualizado correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor',
      message: `Error al actualizar usuario: ${error.message}`
    });
  }
});

// También agregar una versión con PATCH para cubrir ambos métodos HTTP
app.patch('/api/admin/users/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      username, 
      email, 
      full_name, 
      role, 
      is_active, 
      avatar_url,
      email_verified 
    } = req.body;
    
    // El resto del código es idéntico al endpoint PUT
    // Verificar si el usuario existe
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        message: 'El usuario que intentas actualizar no existe'
      });
    }
    
    // Verificar si el username o email ya están en uso por otro usuario
    if (username || email) {
      const duplicateCheck = await pool.query(
        'SELECT * FROM users WHERE (username = $1 OR email = $2) AND id != $3', 
        [username, email, id]
      );
      
      if (duplicateCheck.rows.length > 0) {
        const duplicate = duplicateCheck.rows[0];
        if (duplicate.username === username) {
          return res.status(400).json({
            success: false,
            error: 'Nombre de usuario duplicado',
            message: 'Este nombre de usuario ya está en uso por otro usuario'
          });
        }
        if (duplicate.email === email) {
          return res.status(400).json({
            success: false,
            error: 'Email duplicado',
            message: 'Este email ya está en uso por otro usuario'
          });
        }
      }
    }
    
    // Construir el objeto de actualización y la consulta dinámicamente
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (username) {
      updates.push(`username = $${paramIndex}`);
      values.push(username);
      paramIndex++;
    }
    
    if (email) {
      updates.push(`email = $${paramIndex}`);
      values.push(email);
      paramIndex++;
    }
    
    if (full_name !== undefined) {
      updates.push(`full_name = $${paramIndex}`);
      values.push(full_name);
      paramIndex++;
    }
    
    if (role) {
      updates.push(`role = $${paramIndex}`);
      values.push(role);
      paramIndex++;
    }
    
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      values.push(is_active);
      paramIndex++;
    }
    
    if (avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramIndex}`);
      values.push(avatar_url);
      paramIndex++;
    }
    
    if (email_verified !== undefined) {
      updates.push(`email_verified = $${paramIndex}`);
      values.push(email_verified);
      paramIndex++;
    }
    
    // Agregar id como último parámetro
    values.push(id);
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos insuficientes',
        message: 'No se proporcionaron datos para actualizar'
      });
    }
    
    // Construir la consulta final
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = NOW() 
      WHERE id = $${paramIndex} 
      RETURNING id, username, email, full_name, role, is_active, avatar_url, email_verified, created_at, updated_at
    `;
    
    const result = await pool.query(query, values);
    
    res.json({
      success: true,
      message: 'Usuario actualizado correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor',
      message: `Error al actualizar usuario: ${error.message}`
    });
  }
});

// Endpoint para eliminar un usuario
app.delete('/api/admin/users/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el usuario existe
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        message: 'El usuario que intentas eliminar no existe'
      });
    }
    
    // No permitir eliminar al propio usuario que hace la solicitud
    if (id == req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Operación no permitida',
        message: 'No puedes eliminar tu propia cuenta de usuario'
      });
    }
    
    // Opcional: Revocar todos los tokens del usuario
    try {
      await revokeAllUserTokens(id);
      console.log(`Tokens revocados para el usuario ID: ${id}`);
    } catch (tokenError) {
      console.error('Error al revocar tokens:', tokenError);
      // Continuamos con la eliminación aunque falle esta parte
    }
    
    // Comenzar transacción para eliminar datos relacionados
    await pool.query('BEGIN');
    
    try {
      // Eliminar registros relacionados
      await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [id]);
      await pool.query('DELETE FROM login_attempts WHERE username = (SELECT username FROM users WHERE id = $1)', [id]);
      
      // Eliminar el usuario
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      
      await pool.query('COMMIT');
      
      res.json({
        success: true,
        message: 'Usuario eliminado correctamente'
      });
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    await pool.query('ROLLBACK').catch(() => {});
    
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor',
      message: `Error al eliminar usuario: ${error.message}`
    });
  }
});

// 1. Registro de usuario
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    // Validar campos requeridos
    const validation = validateUserData({ username, email, password, fullName });
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false,
        error: 'Datos de registro inválidos',
        validation: validation.errors 
      });
    }
    
    // Verificar si el usuario ya existe
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (userCheck.rows.length > 0) {
      const existingUser = userCheck.rows[0];
      if (existingUser.username === username) {
        return res.status(400).json({ 
          success: false,
          error: 'El nombre de usuario ya está en uso',
          field: 'username',
          message: 'Este nombre de usuario ya ha sido registrado'
        });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ 
          success: false,
          error: 'El correo electrónico ya está registrado',
          field: 'email',
          message: 'Este correo electrónico ya ha sido registrado'
        });
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
        'user' // Rol por defecto
      ]
    );
    
    const newUser = result.rows[0];
    
    // Generar token JWT
    const token = generateToken(newUser);
    
    // Generar refresh token
    const refreshTokenData = generateRefreshToken(newUser.id);
    await saveRefreshToken(newUser.id, refreshTokenData.token, refreshTokenData.expiresAt);
    
    // Enviar respuesta de éxito
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
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
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error en el servidor',
      message: 'Ha ocurrido un error al procesar el registro'
    });
  }
});


// Agregar después del endpoint de registro

// 2. Inicio de sesión
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Datos incompletos',
        message: 'Usuario y contraseña son requeridos' 
      });
    }
    
    // Verificar bloqueo por intentos fallidos
    const throttleCheck = await checkLoginThrottle(username, ipAddress);
    if (throttleCheck.blocked) {
      return res.status(429).json({
        success: false,
        error: 'Demasiados intentos',
        message: throttleCheck.message
      });
    }
    
    // Buscar el usuario por nombre de usuario o email
    const userQuery = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [username]
    );
    
    if (userQuery.rows.length === 0) {
      await logLoginAttempt(username, ipAddress, false);
      return res.status(401).json({ 
        success: false,
        error: 'Credenciales inválidas',
        message: 'Usuario o contraseña incorrectos' 
      });
    }
    
    const user = userQuery.rows[0];
    
    // Verificar si el usuario está activo
    if (!user.is_active) {
      await logLoginAttempt(username, ipAddress, false);
      return res.status(401).json({
        success: false,
        error: 'Cuenta inactiva',
        message: 'Tu cuenta ha sido desactivada. Contacta al administrador.'
      });
    }
    
    // Verificar la contraseña
    const passwordValid = await comparePassword(password, user.password);
    if (!passwordValid) {
      await logLoginAttempt(username, ipAddress, false);
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas',
        message: 'Usuario o contraseña incorrectos'
      });
    }
    
    // Registrar inicio de sesión exitoso
    await logLoginAttempt(username, ipAddress, true);
    
    // Generar token JWT
    const token = generateToken(user);
    
    // Generar refresh token
    const refreshTokenData = generateRefreshToken(user.id);
    await saveRefreshToken(user.id, refreshTokenData.token, refreshTokenData.expiresAt);
    
    // Enviar respuesta exitosa
    res.json({
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
    });
  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor',
      message: 'Ha ocurrido un error al procesar el inicio de sesión'
    });
  }
});

// Endpoint para obtener info del usuario actual
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    console.log("Verificando usuario actual, ID:", req.user?.id);
    
    // Si no hay req.user, algo falló en el middleware authenticateToken
    if (!req.user || !req.user.id) {
      console.log("ID de usuario no disponible en el token");
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido o expirado' 
      });
    }
    
    const userId = req.user.id;
    const userQuery = await pool.query(
      'SELECT id, username, email, role, full_name as "fullName", avatar_url as "avatarUrl", email_verified FROM users WHERE id = $1', 
      [userId]
    );
    
    if (userQuery.rows.length === 0) {
      console.log("Usuario no encontrado en base de datos:", userId);
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }
    
    console.log("Usuario encontrado:", userQuery.rows[0].username);
    res.json({
      success: true,
      user: userQuery.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor' 
    });
  }
});

// Ruta wildcard para manejar rutas del frontend (debe ir después de todas las rutas API)
app.get('*', (req, res) => {
  // Solo para rutas que no empiezan con /api
  if (!req.path.startsWith('/api')) {
    if (fs.existsSync(path.join(frontendBuildPath, 'index.html'))) {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    } else {
      res.status(404).send('Frontend not built');
    }
  } else {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
});

// Iniciar el servidor
initializeServices().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT} - Entorno: ${process.env.NODE_ENV || 'production'}`);
    // Iniciar el programador de correos
    startScheduler();
  });
}).catch(err => {
  console.error('Error fatal al inicializar servicios:', err);
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en modo limitado en el puerto ${PORT} - Entorno: ${process.env.NODE_ENV || 'production'}`);
  });
});