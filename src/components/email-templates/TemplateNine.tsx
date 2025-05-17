
import React from "react";

interface TemplateNineProps {
  subject: string;
  heading: string;
  subheading: string;
  content: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
}

const TemplateNine: React.FC<TemplateNineProps> = ({
  subject,
  heading,
  subheading,
  content,
  buttonText,
  buttonUrl,
  imageUrl,
}) => {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "'Poppins', 'Segoe UI', sans-serif", backgroundColor: "#FFFFFF" }}>
      {/* Modern Diagonal Header */}
      <div style={{ 
        position: "relative", 
        backgroundColor: "#4C1D95", 
        overflow: "hidden", 
        height: "250px" 
      }}>
        {/* Diagonal Overlay */}
        <div style={{ 
          position: "absolute", 
          width: "150%", 
          height: "100%", 
          backgroundColor: "#7C3AED", 
          transform: "rotate(-15deg) translateX(-10%) translateY(-25%)",
          zIndex: "1"
        }}></div>
        
        {/* Content */}
        <div style={{ 
          position: "relative", 
          zIndex: "2", 
          height: "100%", 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center", 
          alignItems: "center", 
          padding: "20px" 
        }}>
          <img 
            src="https://res.cloudinary.com/dolpwpgtw/image/upload/v1746807761/ovkwvqgr7giep2fph31x.png" 
            alt="Cultura Digital" 
            style={{ 
              height: "60px", 
              marginBottom: "20px",
              filter: "brightness(0) invert(1)" // Ensure white logo
            }}
          />
          
          <div style={{ 
            backgroundColor: "rgba(255,255,255,0.15)", 
            padding: "5px 15px", 
            borderRadius: "50px", 
            marginBottom: "15px",
            backdropFilter: "blur(5px)",
            fontSize: "13px",
            color: "white",
            letterSpacing: "1px",
            textTransform: "uppercase"
          }}>
            {subject || "Actualización Tecnológica"}
          </div>
          
          <h1 style={{ 
            color: "#FFFFFF", 
            fontSize: "30px", 
            textAlign: "center", 
            margin: "0 0 10px 0", 
            fontWeight: "700",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            {heading || "Innovación Digital"}
          </h1>
          
          <h2 style={{ 
            color: "#F3F4F6", 
            fontSize: "16px", 
            textAlign: "center", 
            margin: "0", 
            fontWeight: "400",
            maxWidth: "90%",
            lineHeight: "1.5"
          }}>
            {subheading || "Descubre las últimas tendencias en tecnología"}
          </h2>
        </div>
      </div>
      
      {/* Image Section */}
      <div style={{ padding: "0 20px", marginTop: "-40px", position: "relative", zIndex: "10" }}>
        <img 
          src={imageUrl} 
          alt="Featured Image" 
          style={{ 
            width: "100%", 
            borderRadius: "10px", 
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            maxHeight: "250px",
            objectFit: "cover"
          }}
        />
      </div>
      
      {/* Main Content */}
      <div style={{ padding: "30px 25px" }}>
        {/* Feature Boxes */}
        <div style={{ 
          display: "flex", 
          gap: "15px", 
          marginBottom: "25px",
          flexWrap: "wrap"
        }}>
          <div style={{ 
            flex: "1", 
            minWidth: "calc(50% - 15px)", 
            backgroundColor: "#F9FAFB", 
            padding: "15px", 
            borderRadius: "8px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <div style={{ 
              backgroundColor: "#7C3AED", 
              color: "white", 
              width: "40px", 
              height: "40px", 
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: "bold"
            }}>A</div>
            <div>
              <div style={{ fontWeight: "600", color: "#111827" }}>Automatización</div>
              <div style={{ fontSize: "13px", color: "#6B7280" }}>Optimiza procesos</div>
            </div>
          </div>
          
          <div style={{ 
            flex: "1", 
            minWidth: "calc(50% - 15px)", 
            backgroundColor: "#F9FAFB", 
            padding: "15px", 
            borderRadius: "8px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <div style={{ 
              backgroundColor: "#7C3AED", 
              color: "white", 
              width: "40px", 
              height: "40px", 
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: "bold"
            }}>I</div>
            <div>
              <div style={{ fontWeight: "600", color: "#111827" }}>Inteligencia AI</div>
              <div style={{ fontSize: "13px", color: "#6B7280" }}>Decisiones con datos</div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div style={{ 
          fontSize: "16px", 
          lineHeight: "1.7", 
          color: "#374151",
          margin: "0 0 30px 0",
          backgroundColor: "#F3F4F6",
          padding: "25px",
          borderRadius: "10px"
        }}>
          {content || `Estimados innovadores:

En esta edición, exploraremos las últimas tendencias que están revolucionando el panorama digital:

• Inteligencia artificial generativa y sus aplicaciones prácticas
• Edge computing y su impacto en la velocidad de procesamiento
• Tecnologías inmersivas para capacitación y colaboración
• Computación cuántica: avances recientes y casos de uso

Además, presentaremos estudios de caso de empresas que han implementado estas tecnologías exitosamente y cómo han transformado sus operaciones.`}
        </div>
        
        {/* Timeline */}
        <div style={{ margin: "35px 0" }}>
          <h3 style={{ 
            fontSize: "18px", 
            color: "#4C1D95", 
            margin: "0 0 20px 0",
            fontWeight: "600"
          }}>Calendario de Actividades</h3>
          
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "15px" 
          }}>
            {/* Timeline Item 1 */}
            <div style={{ 
              display: "flex", 
              gap: "15px", 
              alignItems: "flex-start" 
            }}>
              <div style={{ 
                backgroundColor: "#7C3AED", 
                color: "white", 
                borderRadius: "50%", 
                width: "32px", 
                height: "32px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: "bold",
                flexShrink: 0
              }}>1</div>
              <div>
                <h4 style={{ margin: "0 0 5px 0", color: "#111827" }}>Webinar: Nuevas Tecnologías</h4>
                <p style={{ margin: "0", fontSize: "14px", color: "#6B7280" }}>15 de Mayo | 10:00 AM</p>
              </div>
            </div>
            
            {/* Timeline Item 2 */}
            <div style={{ 
              display: "flex", 
              gap: "15px", 
              alignItems: "flex-start" 
            }}>
              <div style={{ 
                backgroundColor: "#7C3AED", 
                color: "white", 
                borderRadius: "50%", 
                width: "32px", 
                height: "32px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: "bold",
                flexShrink: 0
              }}>2</div>
              <div>
                <h4 style={{ margin: "0 0 5px 0", color: "#111827" }}>Taller Práctico: IA Aplicada</h4>
                <p style={{ margin: "0", fontSize: "14px", color: "#6B7280" }}>22 de Mayo | 15:00 PM</p>
              </div>
            </div>
            
            {/* Timeline Item 3 */}
            <div style={{ 
              display: "flex", 
              gap: "15px", 
              alignItems: "flex-start" 
            }}>
              <div style={{ 
                backgroundColor: "#7C3AED", 
                color: "white", 
                borderRadius: "50%", 
                width: "32px", 
                height: "32px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: "bold",
                flexShrink: 0
              }}>3</div>
              <div>
                <h4 style={{ margin: "0 0 5px 0", color: "#111827" }}>Panel: El Futuro del Trabajo</h4>
                <p style={{ margin: "0", fontSize: "14px", color: "#6B7280" }}>29 de Mayo | 11:00 AM</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Button */}
        <div style={{ textAlign: "center", margin: "35px 0 20px 0" }}>
          <a 
            href={buttonUrl} 
            style={{ 
              backgroundColor: "#7C3AED", 
              color: "white", 
              padding: "14px 35px", 
              borderRadius: "50px", 
              textDecoration: "none", 
              fontWeight: "600", 
              display: "inline-block",
              boxShadow: "0 10px 15px -3px rgba(124, 58, 237, 0.3)",
              fontSize: "16px"
            }}
          >
            {buttonText}
          </a>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ 
        background: "linear-gradient(to right, #4C1D95, #7C3AED)", 
        padding: "30px 20px", 
        color: "white", 
        textAlign: "center",
        borderRadius: "0 0 10px 10px"
      }}>
        <img 
          src="https://cuidadoseguro.com.co/csc3/wp-content/uploads/2025/04/CULTURA-DIGITAL-CURVAS1.svg" 
          alt="Cultura Digital" 
          style={{ 
            height: "40px", 
            marginBottom: "20px",
            filter: "brightness(0) invert(1)" // Ensure white logo
          }}
        />
        
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: "20px", 
          marginBottom: "20px",
          flexWrap: "wrap"
        }}>
          <a href="#" style={{ color: "#F3F4F6", textDecoration: "none", fontSize: "14px" }}>Sitio Web</a>
          <a href="#" style={{ color: "#F3F4F6", textDecoration: "none", fontSize: "14px" }}>Blog</a>
          <a href="#" style={{ color: "#F3F4F6", textDecoration: "none", fontSize: "14px" }}>Eventos</a>
          <a href="#" style={{ color: "#F3F4F6", textDecoration: "none", fontSize: "14px" }}>Contacto</a>
        </div>
        
        <p style={{ fontSize: "12px", opacity: "0.7", margin: "0" }}>
          © 2025 Programa de Cultura Digital - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};

export default TemplateNine;
