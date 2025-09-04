
import React from "react";

interface TemplateTenProps {
  subject: string;
  heading: string;
  subheading: string;
  content: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
  accentColor?: string;
  secondaryColor?: string;
}

const TemplateTen: React.FC<TemplateTenProps> = ({
  subject,
  heading,
  subheading,
  content,
  buttonText,
  buttonUrl,
  imageUrl,
  accentColor = "#9b87f5",
  secondaryColor = "#F2FCE2",
}) => {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "'Poppins', 'Arial', sans-serif", backgroundColor: "#ffffff" }}>
      {/* Top Accent Bar */}
      <div style={{ height: "8px", backgroundColor: accentColor }}></div>
      
      {/* Header with Logo and Subject */}
      <div style={{ padding: "25px 20px", textAlign: "center" }}>
        <img 
          src="https://res.cloudinary.com/dolpwpgtw/image/upload/v1746807761/ovkwvqgr7giep2fph31x.png" 
          alt="Cultura Digital" 
          style={{ height: "60px", marginBottom: "15px" }}
        />
        
        {/* Subject displayed prominently */}
        <div style={{ 
          backgroundColor: accentColor, 
          color: "#FFFFFF",
          padding: "10px 20px",
          borderRadius: "30px",
          fontSize: "14px",
          fontWeight: "600",
          display: "inline-block",
          boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
          textTransform: "uppercase",
          letterSpacing: "1px",
          marginTop: "10px"
        }}>
          {subject || "📧 Boletín de Cultura Digital - Edición Especial"}
        </div>
      </div>
      
      {/* Hero Section */}
      <div style={{ position: "relative" }}>
        <img 
          src={imageUrl || "https://res.cloudinary.com/dolpwpgtw/image/upload/v1746799863/zfxxotknyfjvqz9s4piq.jpg"} 
          alt="Hero Image" 
          style={{ 
            width: "100%", 
            maxHeight: "250px", 
            objectFit: "cover",
            display: "block"
          }}
        />
        
        {/* Overlay Text */}
        <div style={{ 
          position: "absolute", 
          bottom: 0, 
          left: 0, 
          right: 0, 
          backgroundColor: "rgba(0,0,0,0.6)", 
          padding: "20px", 
          color: "white",
          textAlign: "center"
        }}>
          <h1 style={{ 
            margin: "0 0 5px 0", 
            fontSize: "24px", 
            fontWeight: "700",
            textShadow: "0 1px 2px rgba(0,0,0,0.3)"
          }}>
            {heading || "🚀 Innovación Tecnológica 2025"}
          </h1>
          <p style={{ 
            margin: "0", 
            fontSize: "16px", 
            opacity: "0.9",
            fontWeight: "300"
          }}>
            {subheading || "Construyendo el futuro digital juntos - Nuevas herramientas y tendencias"}
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{ padding: "30px 25px", backgroundColor: "#ffffff" }}>
        {/* Card Section */}
        <div style={{ 
          backgroundColor: secondaryColor, 
          borderRadius: "8px", 
          padding: "25px", 
          marginBottom: "30px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
        }}>
          <div style={{ 
            fontSize: "16px", 
            lineHeight: "1.6", 
            color: "#333333"
          }}>
            {content || `Estimados colaboradores:

🌟 Nos complace presentarles las últimas novedades tecnológicas que estamos implementando en nuestra organización para impulsar la transformación digital:

• 🤝 Plataforma de colaboración unificada para equipos remotos
• ⚡ Nuevas herramientas de automatización de procesos
• 🔒 Actualización de sistemas de seguridad cibernética
• 📚 Programa de capacitación digital personalizado
• 🤖 Integración de inteligencia artificial en workflows

Estas innovaciones nos permitirán mejorar significativamente nuestra eficiencia operativa y mantenernos a la vanguardia tecnológica en nuestro sector.

¡Esperamos que estas herramientas potencien su productividad diaria!`}
          </div>
        </div>
        
        {/* Feature Boxes */}
        <div style={{ 
          display: "flex", 
          gap: "15px",
          marginBottom: "30px",
          flexWrap: "wrap"
        }}>
          <div style={{ 
            flex: "1", 
            minWidth: "40%", 
            backgroundColor: "#F8F9FA", 
            padding: "20px", 
            borderRadius: "8px",
            borderLeft: `4px solid ${accentColor}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ 
              margin: "0 0 10px 0", 
              color: accentColor, 
              fontSize: "18px" 
            }}>Innovación</h3>
            <p style={{ 
              margin: "0", 
              fontSize: "14px", 
              color: "#666666" 
            }}>
              Transformando ideas en soluciones tecnológicas
            </p>
          </div>
          
          <div style={{ 
            flex: "1", 
            minWidth: "40%", 
            backgroundColor: "#F8F9FA", 
            padding: "20px", 
            borderRadius: "8px",
            borderLeft: `4px solid ${accentColor}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ 
              margin: "0 0 10px 0", 
              color: accentColor, 
              fontSize: "18px" 
            }}>Colaboración</h3>
            <p style={{ 
              margin: "0", 
              fontSize: "14px", 
              color: "#666666" 
            }}>
              Trabajando juntos hacia el éxito digital
            </p>
          </div>
        </div>
        
        {/* Button */}
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <a 
            href={buttonUrl || "#"} 
            style={{ 
              backgroundColor: accentColor, 
              color: "white", 
              padding: "12px 30px", 
              borderRadius: "30px", 
              textDecoration: "none", 
              fontWeight: "600", 
              display: "inline-block",
              fontSize: "16px",
              boxShadow: `0 4px 8px rgba(0,0,0,0.15)`
            }}
          >
            {buttonText || "📖 Leer Más"}
          </a>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ 
        backgroundColor: accentColor, 
        color: "white",
        padding: "25px 20px",
        textAlign: "center"
      }}>
        <img 
          src="https://cuidadoseguro.com.co/csc3/wp-content/uploads/2025/04/CULTURA-DIGITAL-CURVAS1.svg" 
          alt="Cultura Digital" 
          style={{ 
            height: "40px", 
            marginBottom: "15px",
            filter: "brightness(0) invert(1)" // Ensure white logo
          }}
        />
        
        <p style={{ 
          margin: "0 0 10px 0", 
          fontSize: "14px" 
        }}>
          © 2025 Programa de Cultura Digital - Todos los derechos reservados
        </p>
        
        <p style={{ 
          margin: "0", 
          fontSize: "12px", 
          opacity: "0.8" 
        }}>
          culturadigital@ipscsc.com.cojemplo.com | +57 300 123 4567
        </p>
      </div>
    </div>
  );
};

export default TemplateTen;
