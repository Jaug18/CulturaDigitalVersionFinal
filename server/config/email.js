const nodemailer = require('nodemailer');
require('dotenv').config();

// Crear el transporte de Nodemailer
const createTransporter = async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Verificar la conexión
    await transporter.verify();
    console.log('Servicio de correo con Nodemailer configurado correctamente');
    return transporter;
  } catch (error) {
    console.error('Error al configurar Nodemailer:', error);
    return null;
  }
};

module.exports = { createTransporter };