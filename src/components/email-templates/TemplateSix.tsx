
import React from "react";

interface TemplateSixProps {
  subject: string;
  heading: string;
  subheading: string;
  content: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
  implementationDate?: string;
  footerEmail?: string;
  footerPhone?: string;
  // Timeline steps and labels
  step1Number?: string;
  step1Label?: string;
  step2Number?: string;
  step2Label?: string;
  step3Number?: string;
  step3Label?: string;
}

const TemplateSix: React.FC<TemplateSixProps> = ({
  subject,
  heading,
  subheading,
  content,
  buttonText,
  buttonUrl,
  imageUrl,
  implementationDate,
  footerEmail,
  footerPhone,
  step1Number,
  step1Label,
  step2Number,
  step2Label,
  step3Number,
  step3Label,
}) => {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "'Poppins', 'Inter', 'Trebuchet MS', Arial, sans-serif", backgroundColor: "#ffffff" }}>
      {/* Curved Header - More Compact */}
      <div style={{ 
        backgroundColor: "#0052A5", 
        borderRadius: "0 0 50% 50% / 0 0 15px 15px",
        padding: "25px 20px 40px 20px",
        textAlign: "center",
        position: "relative"
      }}>
        <img 
          src="https://res.cloudinary.com/dolpwpgtw/image/upload/v1746807761/ovkwvqgr7giep2fph31x.png" 
          alt="Cultura Digital" 
          style={{ height: "50px", marginBottom: "15px" }}
        />
        
        <div style={{ 
          backgroundColor: "#FFD800",
          padding: "8px 20px",
          borderRadius: "50px",
          display: "inline-block",
          color: "#0052A5",
          fontWeight: "bold",
          fontSize: "13px",
          textTransform: "uppercase",
          letterSpacing: "1px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          {subject || "Recordatorio Importante"}
        </div>
        
        {/* Avatar Circle - Improved centering for Gmail */}
        <div style={{ 
          position: "absolute",
          bottom: "-45px",
          left: "0",
          right: "0",
          textAlign: "center",
          width: "100%"
        }}>
          <div style={{ 
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            border: "4px solid #FFD800",
            overflow: "hidden",
            boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
            display: "inline-block",
            margin: "0 auto"
          }}>
            <img 
              src={imageUrl || "https://res.cloudinary.com/dolpwpgtw/image/upload/v1746799863/zfxxotknyfjvqz9s4piq.jpg"} 
              alt="Imagen destacada" 
              style={{ 
                width: "100%", 
                height: "100%", 
                objectFit: "cover",
                borderRadius: "50%",
                display: "block"
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{ backgroundColor: "#ffffff", padding: "60px 30px 40px 30px", textAlign: "center" }}>
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
        
        {/* Content with styled bullet points - Centered */}
        <div style={{ 
          textAlign: "center", 
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
        
        {/* Timeline - Editable steps */}
        <div style={{ 
          margin: "40px auto",
          maxWidth: "400px",
          textAlign: "center"
        }}>
          <table style={{ 
            width: "100%", 
            borderCollapse: "collapse",
            margin: "0 auto"
          }}>
            <tr>
              <td style={{ width: "33.33%", textAlign: "center", padding: "0 10px", position: "relative" }}>
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
                  fontSize: "16px",
                  lineHeight: "1"
                }}>{step1Number || "1"}</div>
                <p style={{ margin: "0", fontSize: "12px", color: "#555" }}>{step1Label || "Anuncio"}</p>
                {/* Connecting line */}
                <div style={{ 
                  position: "absolute", 
                  top: "15px", 
                  right: "-20px", 
                  width: "40px", 
                  height: "3px", 
                  backgroundColor: "#e0e0e0" 
                }}></div>
              </td>
              <td style={{ width: "33.33%", textAlign: "center", padding: "0 10px", position: "relative" }}>
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
                  fontSize: "16px",
                  lineHeight: "1"
                }}>{step2Number || "2"}</div>
                <p style={{ margin: "0", fontSize: "12px", color: "#555" }}>{step2Label || "Preparación"}</p>
                {/* Connecting line */}
                <div style={{ 
                  position: "absolute", 
                  top: "15px", 
                  right: "-20px", 
                  width: "40px", 
                  height: "3px", 
                  backgroundColor: "#e0e0e0" 
                }}></div>
              </td>
              <td style={{ width: "33.33%", textAlign: "center", padding: "0 10px" }}>
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
                  fontSize: "16px",
                  lineHeight: "1"
                }}>{step3Number || "3"}</div>
                <p style={{ margin: "0", fontSize: "12px", color: "#555" }}>{step3Label || "Implementación"}</p>
              </td>
            </tr>
          </table>
          
          <p style={{ 
            marginTop: "25px", 
            backgroundColor: "#f0f7ff", 
            padding: "10px", 
            borderRadius: "4px", 
            fontSize: "14px", 
            color: "#0052A5" 
          }}>
            <strong>Fecha de implementación:</strong> {implementationDate || "1 de junio, 2025"}
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
      
      {/* Footer with TemplateOne logo */}
      <div style={{ 
        padding: "20px", 
        backgroundColor: "#0052A5",
        textAlign: "center",
        color: "white"
      }}>
        {/* Logo del footer igual al de TemplateOne */}
        <img 
          src="https://res.cloudinary.com/dolpwpgtw/image/upload/v1746458788/qqrl0hsrj9wsqqepe0rp.png" 
          alt="Avatar" 
          style={{ 
            height: "40px",
            width: "80px",
            display: "block",
            margin: "0 auto 15px auto",
            objectFit: "cover",
            objectPosition: "bottom"
          }}
        />
        
        <p style={{ 
          margin: "0 0 10px 0", 
          fontSize: "14px" 
        }}>
          © 2025 Programa de Cultura Digital - Todos los derechos reservados
        </p>
        
        {/* Información de contacto editable */}
        <p style={{ 
          margin: "0", 
          fontSize: "12px", 
          lineHeight: "1.4",
          opacity: "0.9"
        }}>
          📧 {footerEmail || "culturadigital@ipscsc.com.cojemplo.com"} | 📞 {footerPhone || "+57 300 123 4567"}
        </p>
      </div>
    </div>
  );
};

export default TemplateSix;