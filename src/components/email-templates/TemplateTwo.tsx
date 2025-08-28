
import React from "react";

interface TemplateTwoProps {
  subject: string;
  heading: string;
  subheading: string;
  content: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
  departmentName?: string;
  contactEmail?: string;
  contactPhone?: string;
  footerCompany?: string;
}

const TemplateTwo: React.FC<TemplateTwoProps> = ({
  subject,
  heading,
  subheading,
  content,
  buttonText,
  buttonUrl,
  imageUrl,
  departmentName,
  contactEmail,
  contactPhone,
  footerCompany,
}) => {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#FFD800", textAlign: "center", padding: "15px 0px" }}>
        <img 
          src="https://res.cloudinary.com/dolpwpgtw/image/upload/v1746807761/ovkwvqgr7giep2fph31x.png" 
          alt="Cultura Digital" 
          style={{ height: "50px" }}
        />
        <h1 style={{ color: "#003366", fontSize: "24px", margin: "8px 0 5px 0", fontWeight: "700", textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
          {heading || "Alerta de Ciber Seguridad"}
        </h1>
        <h2 style={{ color: "#004080", fontSize: "16px", fontWeight: "500", margin: "0" }}>
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
      <div style={{ backgroundColor: "#f8f9fa", padding: "30px 20px" }}>
        {/* Security Icon */}
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <img 
            src={imageUrl} 
            alt="Ciber Seguridad" 
            style={{ 
              maxWidth: "100%", 
              height: "auto", 
              display: "block", 
              borderRadius: "4px", 
              margin: "0 auto"
            }}
          />
        </div>
        
        {/* Content */}
        <div style={{ 
          color: "#1a1a1a", 
          fontSize: "16px", 
          lineHeight: "1.7", 
          marginBottom: "25px",
          padding: "25px",
          backgroundColor: "#ffffff",
          border: "2px solid #FFD800",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
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
          padding: "20px", 
          backgroundColor: "#003d82", 
          borderRadius: "8px",
          marginBottom: "25px",
          border: "1px solid #0052A5"
        }}>
          <p style={{ margin: "0", fontSize: "15px", color: "#ffffff", fontWeight: "500" }}>
            <strong>⚠️ IMPORTANTE:</strong> Si tiene dudas sobre la legitimidad de un correo o ha detectado alguna actividad sospechosa, comuníquese inmediatamente con el equipo de TI.
          </p>
        </div>
        
        {/* Button */}
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <a 
            href={buttonUrl} 
            style={{ 
              backgroundColor: "#0052A5", 
              color: "#ffffff !important", 
              padding: "16px 32px", 
              textDecoration: "none", 
              borderRadius: "6px", 
              fontWeight: "bold",
              display: "inline-block",
              fontSize: "16px",
              boxShadow: "0 3px 6px rgba(0,82,165,0.3)",
              border: "2px solid #0052A5"
            }}
          >
            <span style={{ color: "#ffffff !important", textDecoration: "none" }}>
              {buttonText}
            </span>
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
            <strong>{departmentName || "Departamento de Seguridad Informática"}</strong>
          </p>
          <p style={{ margin: "5px 0 0 0", fontSize: "13px" }}>
            {contactEmail || "seguridadinformatica@ejemplo.com"} | {contactPhone || "Ext. 1234"}
          </p>
        </div>
        <p style={{ margin: "0", fontSize: "12px" }}>
          © 2025 {footerCompany || "Cultura Digital"} - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};

export default TemplateTwo;