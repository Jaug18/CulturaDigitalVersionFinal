
import React from "react";

interface TemplateTwoProps {
  subject: string;
  heading: string;
  subheading: string;
  content: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
}

const TemplateTwo: React.FC<TemplateTwoProps> = ({
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
      {/* Header */}
      <div style={{ backgroundColor: "#FFD800", textAlign: "center", padding: "20px 0px" }}>
        <img 
          src="https://res.cloudinary.com/dolpwpgtw/image/upload/v1746807761/ovkwvqgr7giep2fph31x.png" 
          alt="Cultura Digital" 
          style={{ height: "70px" }}
        />
        <h1 style={{ color: "#0052A5", fontSize: "28px", margin: "0px 0 5px 0", fontWeight: "600" }}>
          {heading || "Alerta de Ciber Seguridad"}
        </h1>
        <h2 style={{ color: "#0052A5", fontSize: "18px", fontWeight: "normal", margin: "0" }}>
          {subheading || "Proteja su información con estas recomendaciones"}
        </h2>
      </div>
      
      {/* Subject line */}
      <div style={{ backgroundColor: "#0052A5", padding: "12px 20px", color: "white" }}>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "normal" }}>
          {subject || "Boletín de Ciber Seguridad - Información Importante"}
        </h3>
      </div>
      
      {/* Main Content */}
      <div style={{ backgroundColor: "#ffffff", padding: "30px 20px" }}>
        {/* Security Icon */}
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <img 
            src={imageUrl} 
            alt="Ciber Seguridad" 
            style={{ 
              maxWidth: "100%", 
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              maxHeight: "250px"
            }}
          />
        </div>
        
        {/* Content */}
        <div style={{ 
          color: "#333333", 
          fontSize: "16px", 
          lineHeight: "1.6", 
          marginBottom: "25px",
          padding: "20px",
          backgroundColor: "#f8f8f8",
          borderLeft: "4px solid #FFD800",
          borderRadius: "0 4px 4px 0"
        }}>
          {content || `Estimados colaboradores:

Hemos detectado una nueva campaña de phishing dirigida a nuestra organización. Por favor, tenga en cuenta las siguientes medidas de seguridad:

1. No abra correos de remitentes desconocidos
2. Verifique siempre la URL antes de ingresar credenciales
3. No comparta información sensible por correo electrónico
4. Reporte cualquier actividad sospechosa al equipo de TI

Recuerde que su vigilancia es nuestra primera línea de defensa contra los ciberataques.`}
        </div>
        
        {/* Info Box */}
        <div style={{ 
          padding: "15px", 
          backgroundColor: "#e6f3ff", 
          borderRadius: "4px",
          marginBottom: "25px",
          borderLeft: "4px solid #0052A5"
        }}>
          <p style={{ margin: "0", fontSize: "14px", color: "#0052A5" }}>
            <strong>IMPORTANTE:</strong> Si tiene dudas sobre la legitimidad de un correo o ha detectado alguna actividad sospechosa, comuníquese inmediatamente con el equipo de TI.
          </p>
        </div>
        
        {/* Button */}
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <a 
            href={buttonUrl} 
            style={{ 
              backgroundColor: "#0052A5", 
              color: "white", 
              padding: "14px 28px", 
              textDecoration: "none", 
              borderRadius: "4px", 
              fontWeight: "bold",
              display: "inline-block"
            }}
          >
            {buttonText}
          </a>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ padding: "20px", backgroundColor: "#0052A5", color: "white", textAlign: "center", position: "relative" }}>
        <div style={{ 
          position: "relative",
          height: "90px",
          marginBottom: "15px"
        }}>
          <img 
            src="https://res.cloudinary.com/dolpwpgtw/image/upload/v1746458788/qqrl0hsrj9wsqqepe0rp.png" 
            alt="Avatar" 
            style={{ 
              height: "120px",
              margin: "0px 0 0 0",
              position: "absolute",
              top: "-50px",
              left: "50%",
              transform: "translateX(-50%) perspective(400px) rotateX(10deg)",
              filter: "drop-shadow(0 15px 15px rgba(0,0,0,0.4))",
              transformOrigin: "bottom center"
            }} 
          />
        </div>
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: "15px", marginBottom: "15px" }}>
          <p style={{ margin: "0", fontSize: "14px" }}>
            <strong>Departamento de Seguridad Informática</strong>
          </p>
          <p style={{ margin: "5px 0 0 0", fontSize: "13px" }}>
            seguridadinformatica@ejemplo.com | Ext. 1234
          </p>
        </div>
        <p style={{ margin: "0", fontSize: "12px" }}>
          © 2025 Cultura Digital - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};

export default TemplateTwo;