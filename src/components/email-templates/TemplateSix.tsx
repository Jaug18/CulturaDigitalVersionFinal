
import React from "react";

interface TemplateSixProps {
  subject: string;
  heading: string;
  subheading: string;
  content: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
}

const TemplateSix: React.FC<TemplateSixProps> = ({
  subject,
  heading,
  subheading,
  content,
  buttonText,
  buttonUrl,
  imageUrl,
}) => {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "'Poppins', 'Inter', 'Trebuchet MS', Arial, sans-serif", backgroundColor: "#ffffff" }}>
      {/* Curved Header */}
      <div style={{ 
        backgroundColor: "#0052A5", 
        borderRadius: "0 0 50% 50% / 0 0 20px 20px",
        padding: "35px 20px 50px 20px",
        textAlign: "center",
        position: "relative"
      }}>
        <img 
          src="https://res.cloudinary.com/dolpwpgtw/image/upload/v1746807761/ovkwvqgr7giep2fph31x.png" 
          alt="Cultura Digital" 
          style={{ height: "60px", marginBottom: "20px" }}
        />
        
        <div style={{ 
          backgroundColor: "#FFD800",
          padding: "10px 25px",
          borderRadius: "50px",
          display: "inline-block",
          color: "#0052A5",
          fontWeight: "bold",
          fontSize: "14px",
          textTransform: "uppercase",
          letterSpacing: "1px",
          boxShadow: "0 3px 6px rgba(0,0,0,0.1)"
        }}>
          {subject || "Recordatorio Importante"}
        </div>
        
        {/* Avatar Circle that overlaps the next section */}
        <div style={{ 
          width: "110px",
          height: "110px",
          borderRadius: "50%",
          backgroundColor: "#ffffff",
          position: "absolute",
          bottom: "-55px",
          left: "50%",
          transform: "translateX(-50%)",
          border: "5px solid #FFD800",
          overflow: "hidden",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
        }}>
          <img 
            src={imageUrl} 
            alt="Imagen destacada" 
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: "cover" 
            }}
          />
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{ backgroundColor: "#ffffff", padding: "70px 30px 40px 30px", textAlign: "center" }}>
        <h1 style={{ 
          color: "#0052A5", 
          fontSize: "26px", 
          margin: "0 0 15px 0",
          fontWeight: "600"
        }}>
          {heading || "Actualización de Políticas Digitales"}
        </h1>
        
        <h2 style={{ 
          color: "#555", 
          fontSize: "18px", 
          fontWeight: "normal",
          maxWidth: "440px",
          margin: "0 auto 30px auto",
          lineHeight: "1.4"
        }}>
          {subheading || "Nuevos lineamientos para el uso de recursos tecnológicos"}
        </h2>
        
        {/* Content with styled bullet points */}
        <div style={{ 
          textAlign: "left", 
          maxWidth: "480px", 
          margin: "0 auto 30px auto", 
          fontSize: "16px", 
          lineHeight: "1.6", 
          color: "#333" 
        }}>
          {content || `Estimados colaboradores:

Queremos recordarles la importancia de seguir las nuevas políticas de seguridad digital que entrarán en vigor a partir del próximo mes:

• Todas las contraseñas deberán ser actualizadas cada 60 días
• Es obligatorio el uso de la autenticación de dos factores
• Las conexiones a la red corporativa desde el exterior deberán hacerse mediante VPN
• Los dispositivos móviles que accedan a información de la empresa deberán tener instalado el software de protección corporativo

Estas medidas son esenciales para mantener la seguridad de nuestra información y sistemas. Agradecemos su compromiso con estas nuevas directrices.`}
        </div>
        
        {/* Countdown/Timeline */}
        <div style={{ 
          margin: "40px auto",
          maxWidth: "400px",
          textAlign: "center"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between", 
            position: "relative" 
          }}>
            {/* Line connecting the circles */}
            <div style={{ 
              position: "absolute", 
              top: "50%", 
              left: "58px", 
              right: "58px", 
              height: "3px", 
              backgroundColor: "#e0e0e0", 
              zIndex: "1" 
            }}></div>
            
            {/* Three timeline points */}
            <div style={{ 
              width: "50px", 
              textAlign: "center", 
              zIndex: "2" 
            }}>
              <div style={{ 
                width: "30px", 
                height: "30px", 
                borderRadius: "50%", 
                backgroundColor: "#FFD800", 
                margin: "0 auto 8px auto",
                color: "#0052A5",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px"
              }}>1</div>
              <p style={{ margin: "0", fontSize: "12px", color: "#555" }}>Anuncio</p>
            </div>
            
            <div style={{ 
              width: "50px", 
              textAlign: "center", 
              zIndex: "2" 
            }}>
              <div style={{ 
                width: "30px", 
                height: "30px", 
                borderRadius: "50%", 
                backgroundColor: "#FFD800", 
                margin: "0 auto 8px auto",
                color: "#0052A5",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px"
              }}>2</div>
              <p style={{ margin: "0", fontSize: "12px", color: "#555" }}>Preparación</p>
            </div>
            
            <div style={{ 
              width: "50px", 
              textAlign: "center", 
              zIndex: "2" 
            }}>
              <div style={{ 
                width: "30px", 
                height: "30px", 
                borderRadius: "50%", 
                backgroundColor: "#0052A5", 
                margin: "0 auto 8px auto",
                color: "white",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px"
              }}>3</div>
              <p style={{ margin: "0", fontSize: "12px", color: "#555" }}>Implementación</p>
            </div>
          </div>
          <p style={{ 
            marginTop: "25px", 
            backgroundColor: "#f0f7ff", 
            padding: "10px", 
            borderRadius: "4px", 
            fontSize: "14px", 
            color: "#0052A5" 
          }}>
            <strong>Fecha de implementación:</strong> 1 de junio, 2025
          </p>
        </div>
        
        {/* Button */}
        <div style={{ textAlign: "center", margin: "35px 0 20px 0" }}>
          <a 
            href={buttonUrl} 
            style={{ 
              backgroundColor: "#0052A5", 
              color: "#ffffff", 
              padding: "12px 35px", 
              textDecoration: "none", 
              borderRadius: "6px", 
              fontWeight: "bold",
              display: "inline-block",
              fontSize: "16px",
              boxShadow: "0 4px 8px rgba(0,82,165,0.2)",
              border: "2px solid #0052A5",
              transition: "background-color 0.3s, color 0.3s"
            }}
          >
            {buttonText}
          </a>
        </div>
        
        <p style={{ fontSize: "14px", color: "#777", marginTop: "20px" }}>
          Si tiene preguntas, contacte al departamento de TI
        </p>
      </div>
      
      {/* Footer with 3D Image */}
      <div style={{ 
        padding: "30px 20px 20px", 
        backgroundColor: "#f1f5fb",
        borderTop: "1px solid #e0e0e0",
        position: "relative",
        overflow: "visible"
      }}>
        <div style={{ 
          position: "absolute", 
          top: "-55px", 
          left: "50%", 
          transform: "translateX(-50%)",
          filter: "drop-shadow(0px 8px 16px rgba(0,0,0,0.3))"
        }}>
          <img 
            src="https://branzontech.com/wp-content/uploads/2025/05/ChatGPT_Image_2_may_2025__15_50_45-removebg-preview.png" 
            alt="Imagen Footer 3D" 
            style={{ 
              height: "100px",
              transform: "perspective(1000px) rotateX(15deg)",
              transition: "transform 0.3s ease"
            }}
          />
        </div>
        
        {/* Add padding top to ensure content is below the protruding image */}
        <div style={{ paddingTop: "55px" }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            marginBottom: "20px" 
          }}>
            <img 
              src="https://cuidadoseguro.com.co/csc3/wp-content/uploads/2025/04/CULTURA-DIGITAL-CURVAS1.svg" 
              alt="Cultura Digital" 
              style={{ height: "30px" }}
            />
            <span style={{ 
              marginLeft: "10px", 
              fontSize: "14px", 
              color: "#0052A5", 
              fontWeight: "bold" 
            }}>
              Programa de Cultura Digital
            </span>
          </div>
          
          <p style={{ 
            margin: "0", 
            fontSize: "12px", 
            textAlign: "center", 
            color: "#777" 
          }}>
            © 2025 Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplateSix;