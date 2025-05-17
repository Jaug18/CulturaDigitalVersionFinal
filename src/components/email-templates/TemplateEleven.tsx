
import React from "react";

interface TemplateElevenProps {
  subject: string;
  heading: string;
  subheading: string;
  content: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

const TemplateEleven: React.FC<TemplateElevenProps> = ({
  subject,
  heading,
  subheading,
  content,
  buttonText,
  buttonUrl,
  imageUrl,
  primaryColor = "#403E43",
  secondaryColor = "#F1F0FB",
  accentColor = "#D946EF"
}) => {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "'Poppins', 'Helvetica', sans-serif", backgroundColor: "#FFFFFF" }}>
      {/* Header with Diagonal Split */}
      <div style={{ 
        position: "relative", 
        height: "220px", 
        overflow: "hidden" 
      }}>
        {/* Background Image with Overlay */}
        <div style={{ 
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 1
        }}></div>
        
        {/* Diagonal Split */}
        <div style={{ 
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "80px",
          background: "#FFFFFF",
          clipPath: "polygon(0 100%, 100% 100%, 100% 0%)",
          zIndex: 2
        }}></div>
        
        {/* Content Overlay */}
        <div style={{ 
          position: "relative",
          zIndex: 3,
          padding: "30px 20px",
          textAlign: "center",
          color: "#FFFFFF"
        }}>
          {/* Subject Badge */}
          <div style={{ 
            backgroundColor: accentColor,
            color: "#FFFFFF",
            padding: "6px 15px",
            borderRadius: "20px",
            display: "inline-block",
            fontSize: "12px",
            fontWeight: "600",
            marginBottom: "15px",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}>
            {subject || "Tecnología & Innovación"}
          </div>
          
          <h1 style={{ 
            margin: "0 0 10px 0",
            fontSize: "28px",
            fontWeight: "700",
            textShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}>
            {heading || "Transformación Digital"}
          </h1>
          
          <p style={{ 
            margin: "0 auto",
            fontSize: "16px",
            maxWidth: "400px",
            lineHeight: "1.4",
            opacity: "0.9"
          }}>
            {subheading || "Estrategias para el mundo digital"}
          </p>
        </div>
      </div>
      
      {/* Logo Bar */}
      <div style={{ 
        backgroundColor: primaryColor,
        padding: "15px 20px",
        textAlign: "center"
      }}>
        <img 
          src="https://res.cloudinary.com/dolpwpgtw/image/upload/v1746807761/ovkwvqgr7giep2fph31x.png" 
          alt="Cultura Digital" 
          style={{ 
            height: "35px",
            filter: "brightness(0) invert(1)" // Ensure white logo
          }}
        />
      </div>
      
      {/* Main Content Area */}
      <div style={{ padding: "35px 25px" }}>
        {/* Content Card */}
        <div style={{ 
          backgroundColor: secondaryColor,
          borderRadius: "10px",
          padding: "30px 25px",
          marginBottom: "30px",
          fontSize: "16px",
          lineHeight: "1.6",
          color: primaryColor
        }}>
          {content || `Estimados miembros:

Nos complace compartir con ustedes nuestra visión de transformación digital para los próximos meses:

• Implementación de metodologías ágiles en todos los departamentos
• Integración de herramientas colaborativas de última generación
• Formación continua en competencias digitales clave
• Adopción de tecnologías emergentes para mejorar la experiencia del cliente

Este plan nos permitirá consolidar nuestra posición como líderes en innovación y responder ágilmente a los cambios del mercado.`}
        </div>
        
        {/* Timeline Section */}
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ 
            color: primaryColor,
            fontSize: "20px",
            margin: "0 0 20px 0",
            textAlign: "center",
            fontWeight: "600"
          }}>
            Línea de Tiempo del Proyecto
          </h2>
          
          <div style={{ 
            display: "flex",
            flexDirection: "column",
            gap: "15px"
          }}>
            {/* Timeline Item 1 */}
            <div style={{ 
              display: "flex",
              alignItems: "flex-start",
              gap: "15px"
            }}>
              <div style={{ 
                backgroundColor: primaryColor,
                color: "#FFFFFF",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                flexShrink: 0
              }}>1</div>
              <div>
                <h3 style={{ 
                  color: primaryColor,
                  fontSize: "16px",
                  margin: "0 0 5px 0",
                  fontWeight: "600"
                }}>Fase de Diagnóstico</h3>
                <p style={{ 
                  margin: "0",
                  fontSize: "14px",
                  color: "#666666"
                }}>Mayo 2025 - Evaluación de sistemas actuales</p>
              </div>
            </div>
            
            {/* Timeline Item 2 */}
            <div style={{ 
              display: "flex",
              alignItems: "flex-start",
              gap: "15px"
            }}>
              <div style={{ 
                backgroundColor: accentColor,
                color: "#FFFFFF",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                flexShrink: 0
              }}>2</div>
              <div>
                <h3 style={{ 
                  color: primaryColor,
                  fontSize: "16px",
                  margin: "0 0 5px 0",
                  fontWeight: "600"
                }}>Implementación</h3>
                <p style={{ 
                  margin: "0",
                  fontSize: "14px",
                  color: "#666666"
                }}>Junio-Agosto 2025 - Despliegue de nuevas soluciones</p>
              </div>
            </div>
            
            {/* Timeline Item 3 */}
            <div style={{ 
              display: "flex",
              alignItems: "flex-start",
              gap: "15px"
            }}>
              <div style={{ 
                backgroundColor: "#8E9196",
                color: "#FFFFFF",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                flexShrink: 0
              }}>3</div>
              <div>
                <h3 style={{ 
                  color: primaryColor,
                  fontSize: "16px",
                  margin: "0 0 5px 0",
                  fontWeight: "600"
                }}>Evaluación y Mejora</h3>
                <p style={{ 
                  margin: "0",
                  fontSize: "14px",
                  color: "#666666"
                }}>Septiembre 2025 - Análisis de resultados</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div style={{ 
          textAlign: "center",
          marginTop: "35px"
        }}>
          <a 
            href={buttonUrl} 
            style={{ 
              backgroundColor: accentColor,
              color: "#FFFFFF",
              padding: "14px 28px",
              borderRadius: "5px",
              textDecoration: "none",
              fontWeight: "600",
              display: "inline-block",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              textTransform: "uppercase",
              fontSize: "14px",
              letterSpacing: "1px"
            }}
          >
            {buttonText}
          </a>
          
          <p style={{ 
            margin: "15px 0 0 0",
            fontSize: "13px",
            color: "#8E9196"
          }}>
            Para más información, visite nuestro portal interno
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ 
        backgroundColor: primaryColor,
        padding: "30px 20px",
        color: "#FFFFFF",
        textAlign: "center"
      }}>
        <p style={{ 
          margin: "0 0 8px 0",
          fontSize: "14px"
        }}>
          Programa de Cultura Digital
        </p>
        
        <div style={{ 
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "20px"
        }}>
          <a href="#" style={{ color: "#FFFFFF", fontSize: "13px", textDecoration: "none" }}>Portal Web</a>
          <a href="#" style={{ color: "#FFFFFF", fontSize: "13px", textDecoration: "none" }}>Contacto</a>
          <a href="#" style={{ color: "#FFFFFF", fontSize: "13px", textDecoration: "none" }}>Ayuda</a>
        </div>
        
        <p style={{ 
          margin: "0",
          fontSize: "12px",
          opacity: "0.7"
        }}>
          © 2025 Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};

export default TemplateEleven;
