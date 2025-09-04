
import React from 'react';

interface VideoTemplateProps {
  subject?: string;
  heading: string;
  subheading: string;
  content: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
  videoUrl?: string;
  logoBase64?: string;
  footerCompany?: string;
  footerEmail?: string;
  footerPhone?: string;
}

const VideoTemplate: React.FC<VideoTemplateProps> = ({
  heading,
  subheading,
  content,
  buttonText,
  buttonUrl,
  imageUrl,
  videoUrl,
  logoBase64,
  footerCompany,
  footerEmail,
  footerPhone,
}) => {
  // Determine si es un enlace de video de YouTube o Vimeo
  const isYouTube = videoUrl?.includes('youtube') || videoUrl?.includes('youtu.be');
  const isVimeo = videoUrl?.includes('vimeo');
  
  // Función para obtener thumbnail de YouTube
  const getYouTubeThumbnail = (url: string) => {
    if (!url) return '';
    
    let videoId = '';
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        videoId = match[1];
        break;
      }
    }
    
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
  };

  // Genera una imagen clickeable para el video (compatible con email)
  const renderVideoEmbed = () => {
    if (!videoUrl) return null;
    
    // Para YouTube, usar thumbnail
    if (isYouTube) {
      const thumbnail = getYouTubeThumbnail(videoUrl);
      if (thumbnail) {
        return (
          <div style={{ 
            position: 'relative', 
            textAlign: 'center',
            backgroundColor: '#000',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <a href={videoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', position: 'relative' }}>
              <img 
                src={thumbnail} 
                alt="Video de YouTube" 
                style={{ 
                  width: '100%', 
                  height: 'auto',
                  display: 'block'
                }} 
              />
              {/* Botón de play superpuesto */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80px',
                height: '80px',
                backgroundColor: 'rgba(255, 0, 0, 0.8)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '0',
                  height: '0',
                  borderLeft: '20px solid white',
                  borderTop: '12px solid transparent',
                  borderBottom: '12px solid transparent',
                  marginLeft: '4px'
                }}></div>
              </div>
            </a>
            <div style={{ 
              padding: '10px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              fontSize: '14px'
            }}>
              Haz clic para ver el video en YouTube
            </div>
          </div>
        );
      }
    }
    
    // Para otros videos o si no hay thumbnail, mostrar un botón
    return (
      <div style={{ 
        textAlign: 'center', 
        margin: '20px 0',
        padding: '40px 20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '2px dashed #dee2e6'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '15px'
        }}>🎥</div>
        <h3 style={{
          margin: '0 0 15px 0',
          color: '#495057',
          fontSize: '18px'
        }}>Video disponible</h3>
        <a href={videoUrl} target="_blank" rel="noopener noreferrer" style={{ 
          display: 'inline-block',
          padding: '12px 25px',
          backgroundColor: '#4A56E2',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: '600',
          fontSize: '16px'
        }}>
          Ver Video
        </a>
      </div>
    );
  };

  return (
    <table style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      width: '100%',
      borderCollapse: 'collapse'
    }}>
      <tbody>
        {/* Header con diseño compacto - Compatible con Outlook */}
        <tr>
          <td style={{ 
            backgroundColor: '#0052A5',
            background: '#0052A5',
            padding: '20px',
            textAlign: 'center',
            color: 'white'
          }}>
            {/* Logo de Cultura Digital en el header */}
            <img 
              src="https://res.cloudinary.com/dolpwpgtw/image/upload/v1746807761/ovkwvqgr7giep2fph31x.png" 
              alt="Cultura Digital" 
              style={{ 
                height: "40px", 
                marginBottom: "15px",
                display: "block",
                margin: "0 auto 15px auto",
                border: 'none'
              }}
            />
            
            <h1 style={{ 
              margin: '0 0 8px',
              fontSize: '22px',
              fontWeight: 700,
              textShadow: '1px 1px 3px rgba(0, 0, 0, 0.2)',
              lineHeight: '1.2',
              color: 'white'
            }}>
              {heading || "Nuevas estrategias digitales para tu empresa"}
            </h1>
            
            <h2 style={{ 
              margin: '0',
              fontSize: '14px',
              fontWeight: 400,
              opacity: 0.9,
              lineHeight: '1.3',
              color: 'white'
            }}>
              {subheading || "Aprende a implementar herramientas modernas en tu organización"}
            </h2>
          </td>
        </tr>
        
        {/* Contenido principal */}
        <tr>
          <td style={{ padding: '20px 25px' }}>
            {/* Sección de video */}
            {videoUrl && (
              <div style={{ 
                marginBottom: '25px',
                borderRadius: '6px',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
              }}>
                {renderVideoEmbed()}
              </div>
            )}
            
            {/* Imagen destacada si no hay video o como complemento */}
            {(!videoUrl || true) && imageUrl && (
              <div style={{ 
                marginBottom: '25px',
                borderRadius: '6px',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
              }}>
                <img 
                  src={imageUrl} 
                  alt="Imagen destacada" 
                  style={{ 
                    width: '100%', 
                    display: 'block',
                    height: 'auto',
                    border: 'none'
                  }} 
                />
              </div>
            )}
            
            {/* Contenido de texto */}
            <div style={{ 
              color: '#333',
              lineHeight: '1.6',
              fontSize: '16px',
              marginBottom: '25px'
            }} dangerouslySetInnerHTML={{ __html: content || `
              <p>Estimados colaboradores:</p>
              <p>Nos complace compartir con ustedes este importante video sobre las nuevas tendencias en transformación digital que están revolucionando nuestro sector.</p>
              <p>En este video, exploramos:</p>
              <ul>
                <li>Las tecnologías emergentes que están cambiando la forma de trabajar</li>
                <li>Estrategias prácticas para implementar estas herramientas en su día a día</li>
                <li>Casos de éxito de empresas que han aumentado su productividad significativamente</li>
                <li>Pasos concretos para iniciar la transformación digital en su área</li>
              </ul>
              <p>Les invitamos a ver el video completo y a participar en nuestra próxima sesión de preguntas y respuestas donde podremos profundizar en estos temas.</p>
              <p>¡Juntos hacia la innovación digital!</p>
            `.replace(/\n/g, '<br />') }}>
            </div>
            
            {/* Botón de llamada a la acción */}
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <a 
                href={buttonUrl || "https://ejemplo.com/registro-webinar"} 
                style={{
                  display: 'inline-block',
                  backgroundColor: '#0052A5',
                  color: 'white',
                  padding: '12px 25px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px rgba(0, 82, 165, 0.25)'
                }}
                target="_blank" 
                rel="noopener noreferrer"
              >
                {buttonText || "Registrarse para el próximo webinar"}
              </a>
            </div>
          </td>
        </tr>
        
        {/* Footer con logo */}
        <tr>
          <td style={{ 
            backgroundColor: '#0052A5', 
            background: '#0052A5',
            padding: '20px', 
            color: 'white', 
            textAlign: 'center',
            fontSize: '13px'
          }}>
            {/* Logo del footer */}
            <img 
              src="https://res.cloudinary.com/dolpwpgtw/image/upload/v1746458788/qqrl0hsrj9wsqqepe0rp.png" 
              alt="Avatar" 
              style={{ 
                height: "40px",
                width: "80px",
                display: "block",
                margin: "0 auto 15px auto",
                objectFit: "cover",
                objectPosition: "bottom",
                border: 'none'
              }}
            />
            
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'white' }}>
              © 2025 {footerCompany || "Programa de Cultura Digital"} - Todos los derechos reservados
            </p>
            
            {/* Sección de contacto editable */}
            <p style={{ margin: '0 0 10px 0', fontSize: '12px', lineHeight: '1.4', color: 'white' }}>
              📧 {footerEmail || "culturadigital@ipscsc.com.cojemplo.com"} | 📞 {footerPhone || "+57 300 123 4567"}
            </p>
            
            {/* Texto adicional por defecto */}
            <p style={{ margin: '0', opacity: '0.8', fontSize: '12px', color: 'white' }}>
              Este correo fue enviado como parte del programa de transformación digital.
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default VideoTemplate;