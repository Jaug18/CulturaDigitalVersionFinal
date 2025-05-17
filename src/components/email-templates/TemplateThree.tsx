
import React from "react";

interface TemplateThreeProps {
  subject: string;
  heading: string;
  subheading: string;
  content: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
}

const TemplateThree: React.FC<TemplateThreeProps> = ({
  subject,
  heading,
  subheading,
  content,
  buttonText,
  buttonUrl,
  imageUrl,
}) => {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif" }}>
      {/* Top Bar */}
      <div style={{ height: "10px", backgroundColor: "#0052A5" }}></div>
      
      {/* Header */}
      <div style={{ 
        backgroundColor: "#ffffff", 
        textAlign: "center", 
        padding: "1px 20px 1px 20px",
        borderBottom: "3px dashed #FFD800"
      }}>
        <img 
          src="https://res.cloudinary.com/dolpwpgtw/image/upload/v1746459857/uxt4iqleuilxpqofn5s9.png" 
          alt="Cultura Digital" 
          style={{ height: "150px", align: "center", display: "block", margin: "0 auto" }}
        />
      </div>
      
      {/* Announcement Banner */}
      <div style={{ 
        backgroundColor: "#FFD800", 
        padding: "15px 20px", 
        textAlign: "center"
      }}>
        <h1 style={{ 
          margin: 0, 
          color: "#0052A5", 
          fontSize: "26px", 
          letterSpacing: "1px" 
        }}>
          {subject || "ANUNCIO IMPORTANTE"}
        </h1>
      </div>
      
      {/* Main Content */}
      <div style={{ backgroundColor: "#ffffff", padding: "30px 20px" }}>
        {/* Title */}
        <h2 style={{ 
          color: "#0052A5", 
          fontSize: "24px", 
          textAlign: "center", 
          margin: "0 0 10px 0",
          fontWeight: "600"
        }}>
          {heading || "Nueva Plataforma de Aprendizaje Digital"}
        </h2>
        
        {/* Subtitle */}
        <p style={{ 
          color: "#555555", 
          fontSize: "17px", 
          textAlign: "center", 
          margin: "0 0 25px 0",
          fontStyle: "italic"
        }}>
          {subheading || "Mejore sus habilidades con nuestra nueva herramienta"}
        </p>
        
        {/* Divider */}
        <div style={{ 
          width: "80px", 
          height: "3px", 
          backgroundColor: "#FFD800", 
          margin: "0 auto 30px auto" 
        }}></div>
        
        {/* Image */}
        <div style={{ marginBottom: "25px", textAlign: "center" }}>
          <img 
            src={imageUrl} 
            alt="Anuncio" 
            style={{ 
              maxWidth: "100%", 
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
          />
        </div>
        
        {/* Content */}
        <div style={{ 
          color: "#333333", 
          fontSize: "16px", 
          lineHeight: "1.6", 
          marginBottom: "25px",
          padding: "0 10px"
        }}>
          {content || `Estimados compañeros:

Nos complace anunciar el lanzamiento de nuestra nueva plataforma de aprendizaje digital que estará disponible para todos los empleados a partir del próximo lunes.

Características principales:
• Más de 500 cursos de tecnología y desarrollo profesional
• Acceso desde cualquier dispositivo
• Certificaciones reconocidas internacionalmente
• Seguimiento personalizado de su progreso

Les invitamos a participar en las sesiones de inducción que se realizarán durante esta semana según el calendario anexo.`}
        </div>
        
        {/* Date Box */}
        <div style={{ 
          backgroundColor: "#f0f7ff", 
          border: "1px solid #d0e3ff", 
          borderRadius: "6px", 
          padding: "15px 20px",
          marginBottom: "30px",
          textAlign: "center"
        }}>
          <p style={{ margin: "0", color: "#0052A5", fontWeight: "bold" }}>
            Fecha de lanzamiento: 15 de Mayo, 2025
          </p>
        </div>
        
        {/* Button */}
        <div style={{ textAlign: "center" }}>
          <a 
            href={buttonUrl} 
            style={{ 
              backgroundColor: "#0052A5", 
              color: "white", 
              padding: "14px 30px", 
              textDecoration: "none", 
              borderRadius: "50px", 
              fontWeight: "bold",
              display: "inline-block",
              boxShadow: "0 4px 12px rgba(0,82,165,0.2)"
            }}
          >
            {buttonText}
          </a>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ 
        backgroundColor: "#0052A5", 
        color: "white", 
        textAlign: "center",
        padding: "25px 20px",
        borderTop: "5px solid #FFD800",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ 
          position: "relative",
          height: "100px",
          marginBottom: "20px"
        }}>
          <img 
            src="https://res.cloudinary.com/dolpwpgtw/image/upload/v1746458788/qqrl0hsrj9wsqqepe0rp.png" 
            alt="Avatar" 
            style={{ 
              height: "140px",
              position: "absolute",
              top: "-20px",
              left: "50%",
              transform: "translateX(-50%) perspective(800px) rotateY(-5deg)",
              filter: "drop-shadow(5px 15px 10px rgba(0,0,0,0.6))",
              transformStyle: "preserve-3d",
              animation: "float 3s ease-in-out infinite"
            }} 
          />
        </div>
        <p style={{ margin: "0 0 15px 0", fontSize: "16px", fontWeight: "bold" }}>
          Departamento de Tecnología de la Información
        </p>
        <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
          ¿Preguntas? Contacte a: ti@ejemplo.com
        </p>
        <p style={{ margin: "0", fontSize: "12px", opacity: "0.7" }}>
          © 2025 Cultura Digital - Todos los derechos reservados
        </p>
        
        <style>
          {`
            @keyframes float {
              0% { transform: translateX(-50%) perspective(800px) rotateY(-5deg) translateY(0px); }
              50% { transform: translateX(-50%) perspective(800px) rotateY(-5deg) translateY(-10px); }
              100% { transform: translateX(-50%) perspective(800px) rotateY(-5deg) translateY(0px); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default TemplateThree;