import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Función para crear el transportador de correo
export const createTransporter = async (): Promise<Transporter | null> => {
  try {
    console.log('Inicializando servicio de correo...');
    
    // Configuración de Email genérica (EMAIL_*)
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      const emailConfig: EmailConfig = {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      };
      
      const transporter = nodemailer.createTransport(emailConfig);
      await transporter.verify();
      console.log('✅ Configuración de email configurada correctamente');
      return transporter;
    }
    
    console.warn('⚠️  No se encontró configuración de correo válida');
    console.log('Variables requeridas: EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD');
    console.log('Variables opcionales: EMAIL_PORT (default: 587), EMAIL_SECURE (default: false)');
    
    return null;
  } catch (error) {
    console.error('❌ Error al configurar el transportador de correo:', error);
    return null;
  }
};
