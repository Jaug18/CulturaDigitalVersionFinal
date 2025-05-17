
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
}) => {
  // Función para extraer ID de YouTube de la URL
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    
    let videoId = '';
    
    // Patrones comunes de URL de YouTube
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
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };
  
  // Determine si es un enlace de video de YouTube o Vimeo
  const isYouTube = videoUrl?.includes('youtube') || videoUrl?.includes('youtu.be');
  const isVimeo = videoUrl?.includes('vimeo');
  
  // Genera el iframe adecuado según el tipo de video
  const renderVideoEmbed = () => {
    if (!videoUrl) return null;
    
    if (isYouTube) {
      const embedUrl = getYouTubeEmbedUrl(videoUrl);
      if (!embedUrl) return null;
      
      return (
        <iframe 
          width="100%" 
          height="315" 
          src={embedUrl}
          title="YouTube video player" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        ></iframe>
      );
    } else if (isVimeo) {
      const vimeoId = videoUrl.match(/(?:vimeo\.com\/)(\d+)/i)?.[1];
      if (!vimeoId) return null;
      
      return (
        <iframe 
          src={`https://player.vimeo.com/video/${vimeoId}`} 
          width="100%" 
          height="315" 
          frameBorder="0" 
          allow="autoplay; fullscreen; picture-in-picture" 
          allowFullScreen
        ></iframe>
      );
    }
    
    // Si no es YouTube ni Vimeo, mostrar un enlace al video
    return (
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <a href={videoUrl} target="_blank" rel="noopener noreferrer" style={{ 
          display: 'inline-block',
          padding: '12px 20px',
          backgroundColor: '#4A56E2',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontWeight: 500
        }}>
          Ver Video
        </a>
      </div>
    );
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      fontFamily: "'Poppins', sans-serif",
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header con diseño moderno y logo */}
      <div style={{ 
        position: 'relative',
        background: 'linear-gradient(135deg, #0052A5 0%, #4A56E2 100%)',
        padding: '40px 20px',
        textAlign: 'center',
        color: 'white',
        overflow: 'hidden'
      }}>
        {/* Elementos decorativos */}
        <div style={{ 
          position: 'absolute',
          top: '-20px',
          left: '-20px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(255, 216, 0, 0.2)',
          zIndex: 1
        }}></div>
        <div style={{ 
          position: 'absolute',
          bottom: '-30px',
          right: '-30px',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'rgba(255, 216, 0, 0.15)',
          zIndex: 1
        }}></div>
        
        {/* Logo de Cultura Digital */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '20px',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            {/* Círculo amarillo para el logo */}
            <div style={{
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              backgroundColor: '#FFD800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0052A5',
              fontWeight: 'bold',
              fontSize: '20px',
            }}>
              CD
            </div>
            <span style={{
              fontWeight: 'bold',
              fontSize: '22px',
              color: 'white'
            }}>
              Cultura Digital
            </span>
          </div>
        </div>
        
        {logoBase64 && (
          <div style={{ marginBottom: '15px', position: 'relative', zIndex: 2 }}>
            <img src={logoBase64} alt="Logo" style={{ maxHeight: '60px', margin: '0 auto' }} />
          </div>
        )}
        
        <h1 style={{ 
          margin: '0 0 10px',
          fontSize: '28px',
          fontWeight: 700,
          position: 'relative',
          zIndex: 2,
          textShadow: '1px 1px 3px rgba(0, 0, 0, 0.2)'
        }}>
          {heading || "Nuevas estrategias digitales para tu empresa"}
        </h1>
        
        <h2 style={{ 
          margin: '0',
          fontSize: '18px',
          fontWeight: 400,
          opacity: 0.9,
          position: 'relative',
          zIndex: 2,
          maxWidth: '80%',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          {subheading || "Aprende a implementar herramientas modernas en tu organización"}
        </h2>
      </div>
      
      {/* Contenido principal */}
      <div style={{ padding: '25px 30px' }}>
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
                height: 'auto'
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
      </div>
      
      {/* Footer con avatar 3D */}
      <div style={{ 
        backgroundColor: '#0052A5', 
        padding: '25px', 
        color: 'white', 
        textAlign: 'center',
        fontSize: '13px',
        position: 'relative',
        overflow: 'visible'
      }}>
        {/* Avatar 3D que resalta desde el footer */}
        <div style={{ 
          position: 'absolute', 
          top: '-45px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          filter: 'drop-shadow(0px 6px 12px rgba(0,0,0,0.25))'
        }}>
          <img 
            src="https://branzontech.com/wp-content/uploads/2025/05/ChatGPT_Image_2_may_2025__15_32_43-removebg-preview.png" 
            alt="Avatar 3D" 
            style={{ 
              height: '85px',
              transform: 'perspective(800px) rotateX(10deg)',
              animation: 'float 4s ease-in-out infinite'
            }}
          />
        </div>
        
        {/* Añade espaciado superior para que el texto no se solape con la imagen */}
        <div style={{ paddingTop: '50px' }}>
          <p style={{ margin: '0 0 10px 0', opacity: '0.9' }}>
            Programa de Cultura Digital | cultura.digital@ejemplo.com
          </p>
          <p style={{ margin: '0', opacity: '0.7' }}>
            © 2025 Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoTemplate;