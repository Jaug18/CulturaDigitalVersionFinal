import 'tsconfig-paths/register';
import dotenv from 'dotenv';

// Cargar variables de entorno antes que todo
dotenv.config();

import app, { initializeServices } from './app';

const PORT = process.env.PORT || 3000;

// Función para verificar y enviar correos programados
async function checkScheduledEmails(): Promise<void> {
  try {
    console.log('Verificando correos programados...');
    
    // Importar el pool aquí para evitar dependencias circulares
    const { pool } = await import('./config/database');
    
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
    
    // Importar el servicio de email aquí
    const { sendEmail } = await import('./services/emailService');
    
    // Procesar cada correo programado
    for (const scheduledEmail of result.rows) {
      console.log(`Procesando correo programado ID: ${scheduledEmail.id}`);
      
      try {
        // Marcar como procesando
        await pool.query(
          'UPDATE scheduled_emails SET status = $1 WHERE id = $2',
          ['processing', scheduledEmail.id]
        );
        
        // Preparar datos del email
        const emailData = {
          to: scheduledEmail.to_email,
          subject: scheduledEmail.subject,
          htmlContent: scheduledEmail.html_content,
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
        const sendResult = await sendEmail(emailData, scheduledEmail.user_id);
        
        if (sendResult.success) {
          // Marcar como enviado
          await pool.query(
            'UPDATE scheduled_emails SET status = $1, processed_at = NOW() WHERE id = $2',
            ['sent', scheduledEmail.id]
          );
          console.log(`Correo programado ${scheduledEmail.id} enviado exitosamente`);
        } else {
          // Marcar como fallido
          await pool.query(
            'UPDATE scheduled_emails SET status = $1, processed_at = NOW(), error_message = $2 WHERE id = $3',
            ['failed', sendResult.message, scheduledEmail.id]
          );
          console.error(`Error al enviar correo programado ${scheduledEmail.id}:`, sendResult.message);
        }
      } catch (error) {
        console.error(`Error al procesar correo programado ${scheduledEmail.id}:`, error);
        
        // Marcar como fallido
        await pool.query(
          'UPDATE scheduled_emails SET status = $1, processed_at = NOW(), error_message = $2 WHERE id = $3',
          ['failed', error instanceof Error ? error.message : 'Unknown error', scheduledEmail.id]
        );
      }
    }
  } catch (error) {
    console.error('Error al verificar correos programados:', error);
  }
}

// Configurar ejecución periódica del programador de correos
let schedulerInterval: NodeJS.Timeout;

function startScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }
  
  // Ejecutar cada minuto
  schedulerInterval = setInterval(checkScheduledEmails, 60 * 1000);
  console.log('Programador de correos iniciado');
  
  // Ejecutar inmediatamente al iniciar
  checkScheduledEmails();
}

// Manejar cierre limpio del servidor
process.on('SIGINT', () => {
  console.log('Cerrando servidor...');
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    console.log('Programador de correos detenido');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Cerrando servidor...');
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    console.log('Programador de correos detenido');
  }
  process.exit(0);
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
