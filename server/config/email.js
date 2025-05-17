const nodemailer = require('nodemailer');
require('dotenv').config();

// Función para crear el transporter de Nodemailer
const createTransporter = async () => {
  try {
    // Imprimir variables para depuración
    console.log('Configurando servicio de correo con:');
    console.log('- Host:', process.env.EMAIL_HOST);
    console.log('- Puerto:', process.env.EMAIL_PORT);
    console.log('- Usuario:', process.env.EMAIL_USER);
    console.log('- Remitente predeterminado:', process.env.DEFAULT_FROM_EMAIL);
    
    // Obtener configuración directamente de las variables EMAIL_*
    const host = process.env.EMAIL_HOST;
    const port = process.env.EMAIL_PORT;
    const secure = process.env.EMAIL_SECURE === 'true' || false;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD;
    
    // Verificar que existen las credenciales necesarias
    if (!host || !port || !user || !pass) {
      console.error('Faltan credenciales de correo electrónico:');
      console.error('Host:', host ? 'OK' : 'FALTA');
      console.error('Puerto:', port ? 'OK' : 'FALTA');
      console.error('Usuario:', user ? 'OK' : 'FALTA');
      console.error('Contraseña:', pass ? 'OK' : 'FALTA');
      return null;
    }
    
    // Crear el transporter con la configuración
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass
      },
      // En producción permitir certificados autofirmados
      tls: {
        rejectUnauthorized: process.env.NODE_ENV !== 'production'
      }
    });
    
    // Verificar la configuración del transporter
    await transporter.verify();
    console.log('Configuración de Nodemailer verificada correctamente');
    
    return transporter;
  } catch (error) {
    console.error('Error al configurar Nodemailer:', error);
    return null;
  }
};

module.exports = { createTransporter };