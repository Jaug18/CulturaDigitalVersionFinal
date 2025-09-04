import { pool } from '@/config/database';
import { createTransporter } from '@/config/email';
import { EmailSendRequest, EmailScheduleRequest, ApiResponse, Email, ScheduledEmail } from '@/types';

// Variables globales para servicios
let transporter: any = null;

// Función de debug
const debugImages = (message: string) => {
  console.log(`[DEBUG IMÁGENES SERVIDOR] ${message}`);
};

interface PaginationOptions {
  page: string;
  limit: string;
  status?: string;
}

interface EmailImageInfo {
  base64Count: number;
  urlCount: number;
  totalSize: number;
}

interface EmailSendResult {
  success: boolean;
  message: string;
  id: string;
  imageInfo?: EmailImageInfo;
}

/**
 * Inicializar servicios de email
 */
export async function initializeEmailServices(): Promise<void> {
  try {
    transporter = await createTransporter();
    if (!transporter) {
      console.error('Error: Configuración de correo electrónico inválida');
    }
  } catch (error) {
    console.error('Error al inicializar servicios de email:', error);
  }
}

/**
 * Preparar HTML para email
 */
function prepareHtmlForEmail(html: string): string {
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
}

/**
 * Enviar correo con Nodemailer
 */
async function sendWithNodemailer(data: {
  to: string | string[];
  subject: string;
  html: string;
  from?: any;
}): Promise<EmailSendResult> {
  try {
    const { to, subject, html, from } = data;
    const defaultFromEmail = process.env.EMAIL_USER || 'noreply@example.com';
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
      ? to.map(r => typeof r === 'object' ? (r as any).email : r).join(',') 
      : typeof to === 'object' ? (to as any).email : to;

    // IMPORTANTE: Primero procesar el HTML
    const processedHtml = prepareHtmlForEmail(html);
    
    // Convertir a texto plano para mejorar la entrega
    const plainText = processedHtml
      .replace(/<[^>]*>?/gm, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Contar imágenes para depuración
    const base64Count = (processedHtml.match(/data:image\//g) || []).length;
    const urlCount = (processedHtml.match(/src=["']https?:\/\//g) || []).length;
    debugImages(`El correo contiene ${base64Count} imágenes base64 y ${urlCount} imágenes URL`);

    // Extraer imágenes del HTML
    const imageUrls: Array<{url: string, cid: string}> = [];
    const imageBase64: Array<{data: string, type: string, cid: string}> = [];
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
    throw new Error(`Nodemailer: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Registrar email en la base de datos
 */
async function logEmailToDatabase(emailData: any, result: EmailSendResult, userId: number): Promise<void> {
  try {
    // Convertir destinatarios a array de strings
    let recipients: string[] = [];
    if (Array.isArray(emailData.to)) {
      recipients = emailData.to.map((r: any) => typeof r === 'object' ? r.email : r);
    } else {
      recipients = [typeof emailData.to === 'object' ? emailData.to.email : emailData.to];
    }
    
    // Limpiar el content_preview
    let contentPreview = emailData.content_preview || '';
    
    // Si es demasiado largo, acortarlo
    if (contentPreview.length > 5000) {
      contentPreview = contentPreview.substring(0, 5000) + '...';
    }

    // Insertar registro con el content_preview limpio
    await pool.query(
      `INSERT INTO emails 
        (user_id, to_email, subject, from_email, from_name, status, message, email_id, content_preview, 
        titulo_principal, subtitulo, contenido, imagenes_base64, imagenes_url, imagenes_total_kb, template_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        userId,
        recipients,
        emailData.subject,
        typeof emailData.from === 'object' ? emailData.from.email : emailData.from,
        typeof emailData.from === 'object' ? emailData.from.name : null,
        result.success ? 'sent' : 'failed',
        result.message,
        result.id,
        contentPreview,
        emailData.titulo_principal || null,
        emailData.subtitulo || null,
        emailData.contenido || null,
        emailData.imagenes_base64 || 0,
        emailData.imagenes_url || 0,
        emailData.imagenes_total_kb || 0,
        emailData.template_id || null
      ]
    );
    console.log('Email registrado en PostgreSQL');
  } catch (error) {
    console.error('Error al registrar el email en PostgreSQL:', error);
  }
}

/**
 * Enviar correo inmediato
 */
export async function sendEmail(emailData: EmailSendRequest, userId: number): Promise<ApiResponse> {
  try {
    if (!transporter) {
      await initializeEmailServices();
    }

    const { to, subject, htmlContent, from, titulo_principal, subtitulo, contenido, content_preview, template_id } = emailData;

    // Validar destinatarios
    let validatedTo: any[] = [];
    if (Array.isArray(to)) {
      validatedTo = to.filter(recipient => {
        const email = typeof recipient === 'object' ? recipient.email : recipient;
        return email && email.includes('@');
      });
    } else {
      const email = typeof to === 'object' ? (to as any).email : to;
      if (email && email.includes('@')) {
        validatedTo = [to];
      }
    }

    if (validatedTo.length === 0) {
      return {
        success: false,
        message: 'No se encontraron destinatarios válidos'
      };
    }

    // Validar remitente
    const defaultFromEmail = process.env.EMAIL_USER || 'noreply@example.com';
    const formattedFrom = from?.name 
      ? { email: from.email || defaultFromEmail, name: from.name }
      : { email: defaultFromEmail, name: 'Programa Cultura Digital' };

    // Limpiar content_preview
    let cleanContentPreview = content_preview || '';
    cleanContentPreview = cleanContentPreview
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

    // Preparar datos para logging
    const emailLogData = { 
      to: validatedTo, 
      subject, 
      htmlContent, 
      from: formattedFrom,
      titulo_principal,
      subtitulo,
      contenido,
      content_preview: cleanContentPreview,
      template_id: template_id || null,
      imagenes_base64: result.imageInfo?.base64Count || 0,
      imagenes_url: result.imageInfo?.urlCount || 0,
      imagenes_total_kb: result.imageInfo?.totalSize || 0
    };

    await logEmailToDatabase(emailLogData, result, userId).catch(err => {
      console.error('Error al registrar email en BD:', err);
    });

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return {
      success: false,
      message: `Error al enviar el correo: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Programar correo para envío futuro
 */
export async function scheduleEmail(emailData: EmailScheduleRequest, userId: number): Promise<ApiResponse> {
  try {
    const { 
      to, subject, htmlContent, scheduled_for, 
      from, titulo_principal, subtitulo, contenido, template_id, image_url 
    } = emailData;

    if (!to || !subject || !htmlContent || !scheduled_for) {
      return {
        success: false,
        error: 'Datos incompletos',
        message: 'Destinatario, asunto, contenido y fecha de programación son requeridos'
      };
    }
    
    // Validar la fecha de programación
    const scheduledDate = new Date(scheduled_for);
    const now = new Date();
    
    if (isNaN(scheduledDate.getTime())) {
      return {
        success: false,
        error: 'Fecha inválida',
        message: 'La fecha de programación no es válida'
      };
    }
    
    if (scheduledDate <= now) {
      return {
        success: false,
        error: 'Fecha en el pasado',
        message: 'La fecha de programación debe ser en el futuro'
      };
    }
    
    // Validar destinatario
    let validatedTo: string[];
    if (Array.isArray(to)) {
      validatedTo = to.map(recipient => 
        typeof recipient === 'object' ? recipient.email : recipient
      );
    } else {
      validatedTo = [typeof to === 'object' ? (to as any).email : to];
    }
    
    // Validar remitente
    const defaultFromEmail = process.env.EMAIL_USER || 'noreply@example.com';
    const formattedFrom = from?.name 
      ? { email: from.email || defaultFromEmail, name: from.name }
      : { email: defaultFromEmail, name: 'Programa Cultura Digital' };

    // Guardar en la base de datos
    const result = await pool.query(
      `INSERT INTO scheduled_emails 
       (user_id, to_email, subject, html_content, from_email, from_name, 
        scheduled_for, status, titulo_principal, subtitulo, contenido, 
        template_id, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id`,
      [
        userId,
        validatedTo,
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
    
    return {
      success: true,
      message: 'Correo programado exitosamente',
      data: {
        id: result.rows[0].id,
        scheduled_for: scheduledDate
      }
    };
  } catch (error) {
    console.error('Error al programar correo:', error);
    return {
      success: false,
      message: `Error al programar el correo: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Obtener correos programados
 */
export async function getScheduledEmails(userId: number, options: PaginationOptions): Promise<ApiResponse> {
  try {
    const { status, page = '1', limit = '20' } = options;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Construir query con filtrado por usuario
    const queryParams: any[] = [userId];
    let query = 'SELECT * FROM scheduled_emails WHERE user_id = $1';
    
    // Agregar filtro por status si existe
    if (status) {
      query += ' AND status = $' + (queryParams.length + 1);
      queryParams.push(status);
    } else {
      // Si no se especifica status, excluir los emails ya enviados para evitar duplicados con el historial
      query += ' AND status IN ($' + (queryParams.length + 1) + ', $' + (queryParams.length + 2) + ')';
      queryParams.push('pending', 'processing');
    }
    
    // Agregar límite y offset
    query += ' ORDER BY scheduled_for DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    queryParams.push(limit, offset);
    
    const result = await pool.query(query, queryParams);
    
    // Obtener el conteo total
    let countQuery = 'SELECT COUNT(*) FROM scheduled_emails WHERE user_id = $1';
    const countParams: any[] = [userId];
    
    if (status) {
      countQuery += ' AND status = $2';
      countParams.push(status);
    } else {
      // Aplicar el mismo filtro que en la consulta principal
      countQuery += ' AND status IN ($2, $3)';
      countParams.push('pending', 'processing');
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    return {
      success: true,
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  } catch (error) {
    console.error('Error al obtener correos programados:', error);
    return {
      success: false,
      error: 'Error en el servidor',
      message: `Error al obtener correos programados: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Cancelar correo programado
 */
export async function cancelScheduledEmail(id: number, userId: number): Promise<ApiResponse> {
  try {
    // Verificar que exista y pertenezca al usuario
    const checkResult = await pool.query(
      'SELECT * FROM scheduled_emails WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (checkResult.rows.length === 0) {
      return {
        success: false,
        error: 'No encontrado',
        message: 'El correo programado no existe o no tienes permisos para cancelarlo'
      };
    }
    
    const scheduledEmail = checkResult.rows[0];
    
    if (scheduledEmail.status !== 'pending') {
      return {
        success: false,
        error: 'Estado inválido',
        message: `No se puede cancelar un correo en estado "${scheduledEmail.status}"`
      };
    }
    
    // Cancelar el correo
    await pool.query(
      'UPDATE scheduled_emails SET status = $1, processed_at = NOW() WHERE id = $2',
      ['cancelled', id]
    );
    
    return {
      success: true,
      message: 'Correo programado cancelado exitosamente'
    };
  } catch (error) {
    console.error('Error al cancelar correo programado:', error);
    return {
      success: false,
      error: 'Error en el servidor',
      message: `Error al cancelar correo programado: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Actualizar correo programado
 */
export async function updateScheduledEmail(id: number, updateData: any, userId: number): Promise<ApiResponse> {
  try {
    const { subject, to_email, html_content, scheduled_for } = updateData;
    
    // Verificar que el usuario tenga acceso a este correo
    const checkResult = await pool.query(
      'SELECT * FROM scheduled_emails WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (checkResult.rows.length === 0) {
      return {
        success: false,
        error: 'No encontrado',
        message: 'El correo programado no existe o no tienes permisos para editarlo'
      };
    }
    
    const scheduledEmail = checkResult.rows[0];
    
    // Verificar el estado
    if (scheduledEmail.status !== 'pending' && scheduledEmail.status !== 'scheduled') {
      return {
        success: false,
        error: 'No editable',
        message: 'Solo se pueden editar correos programados que aún no han sido enviados'
      };
    }
    
    // Preparar datos para actualizar
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCounter = 1;
    
    if (subject) {
      updateFields.push(`subject = $${paramCounter}`);
      updateValues.push(subject);
      paramCounter++;
    }
    
    if (to_email) {
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
        return {
          success: false,
          error: 'Fecha inválida',
          message: 'La fecha de programación no es válida'
        };
      }
      
      if (newScheduledDate <= now) {
        return {
          success: false,
          error: 'Fecha en el pasado',
          message: 'La fecha de programación debe ser en el futuro'
        };
      }
      
      updateFields.push(`scheduled_for = $${paramCounter}`);
      updateValues.push(newScheduledDate);
      paramCounter++;
    }
    
    updateFields.push(`updated_at = NOW()`);
    
    if (updateFields.length === 1) { // Solo updated_at
      return {
        success: false,
        error: 'Datos insuficientes',
        message: 'No se proporcionaron campos para actualizar'
      };
    }
    
    updateValues.push(id);
    
    const updateQuery = `
      UPDATE scheduled_emails 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, updateValues);
    
    return {
      success: true,
      message: 'Correo programado actualizado correctamente',
      data: result.rows[0]
    };
  } catch (error) {
    console.error('Error al editar correo programado:', error);
    return {
      success: false,
      error: 'Error en el servidor',
      message: `Error al editar correo programado: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Obtener historial de correos enviados
 */
export async function getEmailHistory(userId: number, options: PaginationOptions): Promise<ApiResponse> {
  try {
    const { page = '1', limit = '20' } = options;
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
    
    return {
      success: true,
      data: emailsResult.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  } catch (error) {
    console.error('Error al obtener historial de emails:', error);
    return {
      success: false,
      message: `Error al obtener historial de emails: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: 'database_error'
    };
  }
}

/**
 * Obtener estado de servicios
 */
export async function getServicesStatus(): Promise<ApiResponse> {
  try {
    const services = {
      server: true,
      email: !!transporter,
      database: await pool.query('SELECT NOW()').then(() => true).catch(() => false)
    };
    
    return {
      success: true,
      data: {
        status: 'online',
        services,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error al obtener estado de servicios:', error);
    return {
      success: false,
      message: 'Error al obtener estado de servicios'
    };
  }
}
