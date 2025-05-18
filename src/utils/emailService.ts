import React from "react";
import ReactDOMServer from "react-dom/server";
import TemplateOne from "@/components/email-templates/TemplateOne";
import TemplateTwo from "@/components/email-templates/TemplateTwo";
import TemplateThree from "@/components/email-templates/TemplateThree";
import TemplateFour from "@/components/email-templates/TemplateFour";
import TemplateFive from "@/components/email-templates/TemplateFive";
import TemplateSix from "@/components/email-templates/TemplateSix";
import TemplateSeven from "@/components/email-templates/TemplateSeven";
import TemplateEight from "@/components/email-templates/TemplateEight";
import TemplateNine from "@/components/email-templates/TemplateNine";
import TemplateTen from "@/components/email-templates/TemplateTen";
import TemplateEleven from "@/components/email-templates/TemplateEleven";
import TemplateTwelve from "@/components/email-templates/TemplateTwelve";
import VideoTemplate  from "@/components/email-templates/VideoTemplate";

// Configurar la URL base
import api from '../services/api';
const axios = api;

// Configurar la URL base - Usar la API configurada desde servicios
const axiosInstance = axios;

export interface EmailHistory {
  id: number;
  to_email: string[];
  subject: string;
  from_email: string;
  from_name: string | null;
  status: string;
  message: string;
  email_id: string;
  content_preview: string;
  titulo_principal: string | null;
  subtitulo: string | null;
  contenido: string | null;
  imagenes_base64: number;
  imagenes_url: number;
  imagenes_total_kb: number;
  timestamp: string;
}

export interface EmailPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface EmailHistoryResponse {
  success: boolean;
  data: EmailHistory[];
  pagination: EmailPagination;
}

export interface ScheduledEmail {
  id: number;
  to_email: string[];
  subject: string;
  html_content: string;
  from_email: string;
  from_name: string | null;
  scheduled_for: string;
  status: string;
  titulo_principal: string | null;
  subtitulo: string | null;
  contenido: string | null;
  template_id: string | null;
  image_url: string | null;
  created_at: string;
  processed_at: string | null;
  error_message: string | null;
}

export interface ScheduledEmailsResponse {
  success: boolean;
  data: ScheduledEmail[];
  pagination: EmailPagination;
}

// Obtener historial de emails enviados
export const getEmailHistory = async (page = 1, limit = 20): Promise<EmailHistoryResponse> => {
  try {
    const response = await axios.get('/api/emails', { 
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial de emails:', error);
    throw error;
  }
};

// Obtener historial de correos programados
export const getScheduledEmails = async (status?: string, page = 1, limit = 20): Promise<ScheduledEmailsResponse> => {
  try {
    const params: Record<string, string | number> = { page, limit };
    if (status) params.status = status;
    
    const response = await axios.get('/api/scheduled-emails', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener correos programados:', error);
    throw error;
  }
};

// Cancelar un correo programado
export const cancelScheduledEmail = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.patch(`/api/scheduled-emails/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error al cancelar correo programado:', error);
    throw error;
  }
};

interface EmailRecipient {
  email: string;
  name?: string;
}

interface EmailSendOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  htmlContent: string;
  from?: EmailRecipient;
  templateId?: string;
  templateProps?: {
    subject: string;
    heading: string;
    subheading: string;
    content: string;
    buttonText: string;
    buttonUrl: string;
    imageUrl: string;
  };
  scheduledFor?: string;
}

interface EmailSendResponse {
  success: boolean;
  message: string;
  previewUrl?: string;
}

const imageCache = new Map<string, string>();

const debug = (message: string) => {
  console.warn(`[DEBUG IMÁGENES] ${message}`);
};

const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
  try {
    if (imageUrl.startsWith('data:')) {
      debug(`Imagen ya está en base64: ${imageUrl.substring(0, 30)}...`);
      if (!imageUrl.includes(';base64,')) {
        throw new Error('Formato base64 incompleto - falta ;base64,');
      }
      return imageUrl;
    }

    if ((imageUrl.startsWith('https://') || imageUrl.startsWith('http://'))) {
      debug(`Usando URL de imagen directa: ${imageUrl}`);
      if (imageUrl.startsWith('http://')) {
        return imageUrl.replace('http://', 'https://');
      }
      return imageUrl;
    }

    if (imageCache.has(imageUrl)) {
      debug(`Usando imagen en caché: ${imageUrl}`);
      return imageCache.get(imageUrl)!;
    }

    debug(`Convirtiendo imagen a base64: ${imageUrl}`);

    if (imageUrl.startsWith('/')) {
      imageUrl = `${window.location.origin}${imageUrl}`;
      debug(`URL convertida a absoluta: ${imageUrl}`);
    }

    if (imageUrl.startsWith('//')) {
      imageUrl = `https:${imageUrl}`;
      debug(`Añadido protocolo a URL: ${imageUrl}`);
    }

    const response = await fetch(imageUrl, { 
      headers: {
        'Accept': 'image/*',
      },
      mode: 'cors',
      cache: 'force-cache'
    });

    if (!response.ok) {
      throw new Error(`No se pudo cargar la imagen (status ${response.status}): ${imageUrl}`);
    }

    let contentType = response.headers.get('content-type');
    if (!contentType) {
      if (imageUrl.match(/\.(jpeg|jpg)$/i)) contentType = 'image/jpeg';
      else if (imageUrl.match(/\.(png)$/i)) contentType = 'image/png';
      else if (imageUrl.match(/\.(gif)$/i)) contentType = 'image/gif';
      else if (imageUrl.match(/\.(svg)$/i)) contentType = 'image/svg+xml';
      else if (imageUrl.match(/\.(webp)$/i)) contentType = 'image/webp';
      else contentType = 'image/png';
    }

    const arrayBuffer = await response.arrayBuffer();

    if (arrayBuffer.byteLength === 0) {
      throw new Error('La imagen descargada está vacía');
    }

    const base64 = btoa(
      new Uint8Array(arrayBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    const dataUrl = `data:${contentType};base64,${base64}`;

    debug(`Tamaño de la imagen base64: ${Math.round(dataUrl.length / 1024)}KB`);

    if (base64.length < 10) {
      throw new Error('Datos base64 demasiado cortos - probablemente error');
    }

    imageCache.set(imageUrl, dataUrl);
    return dataUrl;
  } catch (error) {
    debug(`Error procesando imagen: ${error.message}`);
    return 'https://via.placeholder.com/600x300?text=Imagen+no+disponible';
  }
};

const cleanupHtml = (html: string): string => {
  let cleaned = html.replace(/\s+data-[a-zA-Z0-9\-_]+="[^"]*"/g, '');
  cleaned = cleaned.replace(/\s+class="[^"]*"/g, '');
  cleaned = cleaned.replace(/\s+id="[^"]*"/g, '');
  debug(`HTML limpiado de atributos problemáticos`);
  return cleaned;
};

// Añadir esta función para convertir archivos de imagen a base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Añadir una función para manejar imágenes locales
export const handleLocalImage = async (file: File): Promise<string> => {
  try {
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo seleccionado no es una imagen');
    }
    
    // Verificar el tamaño (máximo 5MB para evitar problemas)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      debug(`Imagen demasiado grande (${Math.round(file.size/1024)}KB), redimensionando...`);
      // Aquí puedes implementar redimensionamiento de imagen si es necesario
      // Por ahora, solo advertimos
    }
    
    // Convertir a base64
    const base64Data = await fileToBase64(file);
    debug(`Imagen local convertida a base64 (${Math.round(base64Data.length/1024)}KB)`);
    
    return base64Data;
  } catch (error) {
    console.error('Error al procesar imagen local:', error);
    return 'https://via.placeholder.com/600x300?text=Error+al+procesar+imagen';
  }
};

interface TemplateProps {
  subject?: string;
  heading?: string;
  subheading?: string;
  content?: string;
  buttonText?: string;
  buttonUrl?: string;
  imageUrl?: string | File;
  logoUrl?: string;
}

const processTemplateProps = async (props: TemplateProps): Promise<TemplateProps> => {
  const processedProps = { ...props };

  // Para la imagen principal
  if (props.imageUrl) {
    // Si imageUrl es un objeto File (imagen local seleccionada por el usuario)
    if (props.imageUrl instanceof File) {
      debug('Imagen local detectada, convirtiendo a base64...');
      try {
        processedProps.imageUrl = await handleLocalImage(props.imageUrl);
      } catch (error) {
        debug(`Error al procesar imagen local: ${error.message}`);
        processedProps.imageUrl = 'https://picsum.photos/600/300';
      }
    }
    // Si es base64, mantenerla como está
    else if (props.imageUrl.startsWith('data:image/')) {
      debug('Imagen base64 detectada en imageUrl, usando tal cual');
      // No modificar la imageUrl
    }
    // Si no es HTTPS ni base64, usar placeholder
    else if (!props.imageUrl.startsWith('https://')) {
      debug(`URL no segura reemplazada: ${props.imageUrl}`);
      processedProps.imageUrl = 'https://picsum.photos/600/300';
    }
    // Si es HTTPS, mantenerla como está
  }

  // Para el logo, usar URL fija
  processedProps.logoUrl = "https://res.cloudinary.com/dolpwpgtw/image/upload/v1746459857/uxt4iqleuilxpqofn5s9.png";

  return processedProps;
};

// También debemos modificar la función fixImageUrls para manejar mejor las imágenes locales que se insertan en el HTML
const fixImageUrls = async (html: string): Promise<string> => {
  try {
    debug(`Procesando imágenes en HTML...`);
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
    let result = html;
    let match;

    const images = [];
    while ((match = imgRegex.exec(html)) !== null) {
      const imgTag = match[0];
      const imgSrc = match[1];
      images.push({ imgTag, imgSrc });
    }

    debug(`Encontradas ${images.length} imágenes en el HTML`);

    // Contar imágenes base64 y URLs
    let base64Count = 0;
    let urlCount = 0;
    let totalKb = 0;

    for (const { imgTag, imgSrc } of images) {
      try {
        let newImgTag = imgTag;
        let optimizedSrc = imgSrc;

        // Procesar imágenes base64
        if (imgSrc.startsWith('data:')) {
          base64Count++;
          // Calcular tamaño aproximado en KB
          const base64Data = imgSrc.split(',')[1];
          if (base64Data) {
            const sizeKb = Math.round((base64Data.length * 0.75) / 1024);
            totalKb += sizeKb;
            debug(`Imagen base64 detectada: ~${sizeKb}KB`);
          }
          
          // Si la imagen es excesivamente grande (>1MB), podríamos considerar redimensionarla
          // aquí en una implementación futura
          
          // Añadir atributos para mejorar la visualización de imágenes base64
          newImgTag = imgTag
            .replace(/\s+data-[^=]+="[^"]*"/g, '')
            .replace(/<img/, '<img alt="Imagen" border="0" style="max-width:100%;height:auto;display:block;margin:0 auto;border:0;"');
        }
        // Manejar imágenes con rutas de archivo local (pueden aparecer en algunas situaciones)
        else if (imgSrc.startsWith('file://') || imgSrc.startsWith('C:') || imgSrc.startsWith('/')) {
          debug(`Detectada ruta de archivo local: ${imgSrc}`);
          // Reemplazar con un placeholder
          optimizedSrc = 'https://via.placeholder.com/600x300?text=Imagen+Local+No+Disponible';
          newImgTag = imgTag
            .replace(/src=["'][^"']+["']/, `src="${optimizedSrc}"`)
            .replace(/<img/, '<img alt="Imagen no disponible" border="0" style="max-width:100%;height:auto;display:block;margin:0 auto;border:0;"');
          urlCount++;
        }
        // Procesar imágenes URL normales
        else {
          urlCount++;

          if (imgSrc.startsWith('/')) {
            optimizedSrc = `${window.location.origin}${imgSrc}`;
          } 

          if (optimizedSrc.startsWith('http://')) {
            optimizedSrc = optimizedSrc.replace('http://', 'https://');
          }

          newImgTag = imgTag
            .replace(/\s+data-[^=]+="[^"]*"/g, '')
            .replace(/src=["'][^"']+["']/, `src="${optimizedSrc}"`)
            .replace(/<img/, '<img alt="Imagen" border="0" style="max-width:100%;height:auto;display:block;margin:0 auto;border:0;"');
        }

        result = result.replace(imgTag, newImgTag);
      } catch (err) {
        debug(`Error procesando imagen ${imgSrc}: ${err.message}`);
      }
    }

    // Almacenar estadísticas de imágenes para el backend
    window.__emailImageStats = {
      base64Count,
      urlCount,
      totalKb
    };
    
    debug(`Procesadas ${base64Count} imágenes base64 y ${urlCount} imágenes URL (Total: ~${totalKb}KB)`);
    return result;
  } catch (error) {
    debug(`Error en fixImageUrls: ${error.message}`);
    return html;
  }
};

const extractContentPreview = (html: string): string => {
  try {
    // Eliminar DOCTYPE, html, head, body, etc.
    let content = html;
    
    // Eliminar las etiquetas DOCTYPE, html, head, body, tables externas, etc.
    content = content.replace(/<!DOCTYPE[^>]*>/gi, '');
    content = content.replace(/<html[^>]*>|<\/html>/gi, '');
    content = content.replace(/<head[\s\S]*?<\/head>/gi, '');
    content = content.replace(/<body[^>]*>/gi, '').replace(/<\/body>/gi, '');
    
    // Eliminar tablas de estructura externas comunes en emails
    content = content.replace(/<table[^>]*>\s*<tr>\s*<td[^>]*>\s*<table/gi, '<table');
    content = content.replace(/<\/table>\s*<\/td>\s*<\/tr>\s*<\/table>/gi, '</table>');
    
    // Eliminar estilos y scripts
    content = content.replace(/<style[\s\S]*?<\/style>/gi, '');
    content = content.replace(/<script[\s\S]*?<\/script>/gi, '');
    
    // Eliminar comentarios HTML
    content = content.replace(/<!--[\s\S]*?-->/g, '');
    
    return content.trim();
  } catch (error) {
    console.error('Error al extraer vista previa del contenido:', error);
    return '<p>Error al procesar el contenido del correo</p>';
  }
};

export const sendEmail = async (options: EmailSendOptions): Promise<EmailSendResponse> => {
  try {
    const fromEmail = "jaug171@gmail.com";

    console.log("Preparando envío de email...");

    // Si hay programación, usar el endpoint de programación
    const isScheduled = !!options.scheduledFor;
    const endpoint = isScheduled ? '/api/schedule-email' : '/api/send-email';

    let finalHtmlContent = options.htmlContent;
    let cleanPreviewContent = '';

    // Variables para estadísticas de imágenes
    let base64Count = 0;
    let urlCount = 0;
    let totalKb = 0;

    if (options.templateId && options.templateProps) {
      try {
        debug(`Usando plantilla ${options.templateId}`);

        // Procesar la imagen principal de la plantilla
        if (options.templateProps.imageUrl) {
          // Solo reemplazar si NO es HTTPS y NO es base64
          if (
            !options.templateProps.imageUrl.startsWith('https://') &&
            !options.templateProps.imageUrl.startsWith('data:image/')
          ) {
            const publicImage = 'https://picsum.photos/600/300';
            debug(`Usando imagen pública: ${publicImage}`);
            options.templateProps.imageUrl = publicImage;
          }
        }

        // Procesar propiedades de la plantilla
        const processedProps = await processTemplateProps(options.templateProps);
        
        // Generar el HTML de la plantilla
        const templateComponent = getTemplateComponent(options.templateId, processedProps);
        finalHtmlContent = ReactDOMServer.renderToStaticMarkup(templateComponent);
        
        // Limpiar HTML de atributos que no son necesarios
        finalHtmlContent = cleanupHtml(finalHtmlContent);
        
        // Procesar todas las imágenes, tanto URLs como base64
        finalHtmlContent = await fixImageUrls(finalHtmlContent);

        // DEPURACIÓN: Mostrar todas las imágenes encontradas en el HTML final
        const imgMatches = Array.from(finalHtmlContent.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/g));
        if (imgMatches.length > 0) {
          console.log("Imágenes encontradas en el HTML final:");
          imgMatches.forEach((match, idx) => {
            console.log(`  [${idx + 1}] src: ${match[1].substring(0, 80)}${match[1].length > 80 ? '...' : ''}`);
          });
        } else {
          console.log("No se encontraron imágenes en el HTML final.");
        }

        // Actualizar contadores de imágenes
        if (window.__emailImageStats) {
          base64Count = window.__emailImageStats.base64Count || 0;
          urlCount = window.__emailImageStats.urlCount || 0;
          totalKb = window.__emailImageStats.totalKb || 0;
        }

        // Guardar versión sin wrapper para previsualización
        cleanPreviewContent = finalHtmlContent.replace(/<!DOCTYPE[^>]*>/, '')
          .replace(/<html[^>]*>[\s\S]*?<body[^>]*>/i, '')
          .replace(/<\/body>[\s\S]*?<\/html>/i, '');
        
        // Añadir el wrapper para el email real
        finalHtmlContent = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1991/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${options.subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border: 1px solid #e0e0e0;">
          <tr>
            <td align="center" style="padding: 20px;">
              ${finalHtmlContent}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `;
      } catch (renderError) {
        console.error("Error al renderizar la plantilla:", renderError);
        finalHtmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>${options.subject}</h1>
            <p>${options.templateProps?.content || "No se pudo cargar el contenido de la plantilla."}</p>
          </div>
        `;
      }
    } else {
      // Si no es una plantilla, procesar directamente el HTML
      finalHtmlContent = await fixImageUrls(options.htmlContent);
      
      // Actualizar contadores de imágenes
      if (window.__emailImageStats) {
        base64Count = window.__emailImageStats.base64Count || 0;
        urlCount = window.__emailImageStats.urlCount || 0;
        totalKb = window.__emailImageStats.totalKb || 0;
      }
      
      // Guardar una versión limpia del HTML
      cleanPreviewContent = extractContentPreview(finalHtmlContent);
    }

    // Registrar estadísticas de imágenes
    debug(`Estadísticas finales: ${base64Count} imágenes base64, ${urlCount} URLs, ${totalKb}KB total`);

    const emailData = {
      to: options.to,
      subject: options.subject,
      titulo_principal: options.templateProps?.heading || "Título Principal",
      subtitulo: options.templateProps?.subheading || "Subtítulo Principal",
      contenido: options.templateProps?.content || "Contenido Principal",
      htmlContent: finalHtmlContent,
      content_preview: cleanPreviewContent,
      image_url: options.templateProps?.imageUrl || "",
      template_id: options.templateId || "",
      from: {
        email: fromEmail,
        name: "Programa Cultura Digital"
      },
      scheduled_for: options.scheduledFor,
      // Incluir estadísticas de imágenes para el backend
      imagenes_base64: base64Count,
      imagenes_url: urlCount,
      imagenes_total_kb: totalKb
    };

    console.log(`Enviando solicitud al backend (${isScheduled ? 'programado' : 'inmediato'})...`);

    const response = await axios.post(endpoint, emailData);

    console.log(`Email ${isScheduled ? 'programado' : 'enviado'} exitosamente:`, response.data);
    return {
      success: true,
      message: isScheduled ? "Correo programado exitosamente" : "Correo enviado exitosamente",
      previewUrl: isScheduled ? undefined : response.data.previewUrl
    };
  } catch (error) {
    console.error("Error al procesar el envío de email:", error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
};

// Añade esta declaración al final del archivo
declare global {
  interface Window {
    __emailImageStats?: {
      base64Count: number;
      urlCount: number;
      totalKb: number;
    };
  }
}
// Nueva función para previsualizar el correo
export const previewEmail = async (options: EmailSendOptions): Promise<string> => {
  try {
    let previewHtml = options.htmlContent;

    if (options.templateId && options.templateProps) {
      const processedProps = await processTemplateProps(options.templateProps);
      const templateComponent = getTemplateComponent(options.templateId, processedProps);
      
      previewHtml = ReactDOMServer.renderToStaticMarkup(templateComponent);
      previewHtml = cleanupHtml(previewHtml);
      previewHtml = await fixImageUrls(previewHtml);
    }

    // Envolver en HTML básico para visualización pero sin DOCTYPE ni elementos complejos
    return `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <div style="background-color: #f7f7f7; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
        <div style="font-weight: bold; margin-bottom: 5px;">Asunto: ${options.subject}</div>
        <div>De: Programa Cultura Digital</div>
        <div>Para: ${Array.isArray(options.to) 
          ? options.to.map(r => typeof r === 'object' ? r.email : r).join(', ') 
          : typeof options.to === 'object' ? options.to.email : options.to}</div>
      </div>
      
      <div style="border: 1px solid #e0e0e0; padding: 20px; border-radius: 4px; background-color: white;">
        ${previewHtml}
      </div>
    </div>
    `;
  } catch (error) {
    console.error("Error al generar previsualización:", error);
    return `<div style="color: red; padding: 20px;">Error al generar previsualización: ${error.message}</div>`;
  }
};

const getTemplateComponent = (templateId: string, props: any) => {
  switch (templateId) {
    case "template1": return React.createElement(TemplateOne, props);
    case "template2": return React.createElement(TemplateTwo, props);
    case "template3": return React.createElement(TemplateThree, props);
    case "template4": return React.createElement(TemplateFour, props);
    case "template5": return React.createElement(TemplateFive, props);
    case "template6": return React.createElement(TemplateSix, props);
    case "template7": return React.createElement(TemplateSeven, props);
    case "template8": return React.createElement(TemplateEight, props);
    case "template9": return React.createElement(TemplateNine, props);
    case "template10": return React.createElement(TemplateTen, props);
    case "template11": return React.createElement(TemplateEleven, props);
    case "template12": return React.createElement(TemplateTwelve, props);
    case "videoTemplate": return React.createElement(VideoTemplate, props);
    default: return React.createElement(TemplateOne, props);
  }
};

export const validateEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

declare global {
  interface Window {
    __emailImageStats?: {
      base64Count: number;
      urlCount: number;
      totalKb: number;
    };
  }
}


export const parseEmailList = (emailsString: string): EmailRecipient[] => {
  const emails = emailsString.split(/[,;\n]+/).map(email => email.trim()).filter(Boolean);

  return emails
    .filter(validateEmail)
    .map(email => ({ email }));
};
