
import React from "react";

interface TemplateSevenProps {
  subject: string;
  heading: string;
  subheading: string;
  content: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
}

const TemplateSeven: React.FC<TemplateSevenProps> = ({
  subject,
  heading,
  subheading,
  content,
  buttonText,
  buttonUrl,
  imageUrl,
}) => {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "'Poppins', 'Arial', sans-serif", backgroundColor: "#151B26" }}>
      {/* Header with Gradient */}
      <div style={{ 
        background: "linear-gradient(135deg, #00416A 0%, #E4E5E6 100%)", 
        padding: "40px 20px", 
        textAlign: "center",
        borderRadius: "0 0 70% 70% / 0 0 30px 30px"
      }}>
        <img 
          src="https://res.cloudinary.com/dolpwpgtw/image/upload/v1746807761/ovkwvqgr7giep2fph31x.png" 
          alt="Cultura Digital" 
          style={{ 
            height: "65px", 
            filter: "brightness(0) invert(1)", // Ensure white logo
            margin: "0 auto 15px auto" 
          }}
        />
        <h1 style={{ 
          color: "#FFFFFF", 
          fontSize: "28px", 
          fontWeight: "700", 
          margin: "15px 0 8px 0",
          textShadow: "0px 2px 4px rgba(0,0,0,0.2)"
        }}>
          {heading || "Transformación Digital"}
        </h1>
        <h2 style={{ 
          color: "#FFFFFF", 
          fontSize: "18px", 
          fontWeight: "400", 
          margin: "0 0 15px 0",
          textShadow: "0px 1px 2px rgba(0,0,0,0.2)",
          // Fixed: removed duplicate margin property
          marginLeft: "auto",
          marginRight: "auto",
          maxWidth: "400px"
        }}>
          {subheading || "Impulsa tu carrera con las nuevas tecnologías"}
        </h2>
      </div>
      
      {/* Notification Badge */}
      <div style={{ 
        backgroundColor: "#FF4E50", 
        color: "white",
        fontWeight: "bold",
        padding: "10px 25px",
        fontSize: "14px",
        letterSpacing: "1px",
        display: "block",
        margin: "-15px auto 25px auto",
        width: "fit-content",
        borderRadius: "50px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
        textTransform: "uppercase",
        position: "relative",
        zIndex: "1"
      }}>
        {subject || "Boletín Especial"}
      </div>
      
      {/* Main Content */}
      <div style={{ 
        backgroundColor: "#FFFFFF", 
        margin: "0 15px", 
        padding: "30px", 
        borderRadius: "8px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
      }}>
        {/* Feature Image */}
        <div style={{ marginBottom: "25px" }}>
          <img 
            src={imageUrl} 
            alt="Featured Image" 
            style={{ 
              width: "100%", 
              borderRadius: "6px", 
              boxShadow: "0 3px 10px rgba(0,0,0,0.1)"
            }}
          />
        </div>
        
        {/* Content */}
        <div style={{ 
          color: "#333", 
          fontSize: "16px", 
          lineHeight: "1.6"
        }}>
          {content || `Estimado participante:

Nos complace invitarle a nuestro próximo evento de transformación digital donde exploraremos los últimos avances en:

• Inteligencia artificial aplicada al entorno laboral
• Automatización de procesos empresariales
• Análisis de datos para la toma de decisiones
• Seguridad informática en la era digital

El evento contará con ponentes internacionales que compartirán casos de éxito y mejores prácticas para implementar estas tecnologías en su organización.`}
        </div>
        
        {/* Stats Cards */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          gap: "15px", 
          margin: "30px 0" 
        }}>
          <div style={{ 
            flex: "1", 
            backgroundColor: "#F8FAFC", 
            padding: "15px", 
            borderRadius: "8px", 
            textAlign: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
          }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#00416A" }}>25+</div>
            <div style={{ fontSize: "14px", color: "#666" }}>Expositores</div>
          </div>
          <div style={{ 
            flex: "1", 
            backgroundColor: "#F8FAFC", 
            padding: "15px", 
            borderRadius: "8px", 
            textAlign: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
          }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#00416A" }}>8</div>
            <div style={{ fontSize: "14px", color: "#666" }}>Talleres</div>
          </div>
          <div style={{ 
            flex: "1", 
            backgroundColor: "#F8FAFC", 
            padding: "15px", 
            borderRadius: "8px", 
            textAlign: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
          }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#00416A" }}>500+</div>
            <div style={{ fontSize: "14px", color: "#666" }}>Asistentes</div>
          </div>
        </div>
        
        {/* Button */}
        <div style={{ textAlign: "center", margin: "35px 0 10px 0" }}>
          <a 
            href={buttonUrl} 
            style={{ 
              backgroundColor: "#00416A", 
              color: "white", 
              padding: "14px 28px", 
              borderRadius: "50px", 
              textDecoration: "none", 
              fontWeight: "bold", 
              display: "inline-block",
              boxShadow: "0 4px 10px rgba(0,65,106,0.2)",
              transition: "all 0.3s ease"
            }}
          >
            {buttonText}
          </a>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ 
        textAlign: "center", 
        padding: "30px 20px", 
        backgroundColor: "#151B26", 
        borderRadius: "0 0 8px 8px",
        color: "#FFFFFF"
      }}>
        <img 
          src="https://cuidadoseguro.com.co/csc3/wp-content/uploads/2025/04/CULTURA-DIGITAL-CURVAS1.svg" 
          alt="Cultura Digital" 
          style={{ 
            height: "40px", 
            margin: "0 auto 15px auto",
            filter: "brightness(0) invert(1)" // Ensure white logo
          }}
        />
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: "20px", 
          margin: "15px 0" 
        }}>
          <a href="#" style={{ color: "#FFFFFF", textDecoration: "none", fontSize: "14px" }}>Sitio Web</a>
          <a href="#" style={{ color: "#FFFFFF", textDecoration: "none", fontSize: "14px" }}>Contacto</a>
          <a href="#" style={{ color: "#FFFFFF", textDecoration: "none", fontSize: "14px" }}>Privacidad</a>
        </div>
        <p style={{ fontSize: "12px", color: "#AAAAAA", margin: "15px 0 0 0" }}>
          © 2025 Programa de Cultura Digital - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};

export default TemplateSeven;
