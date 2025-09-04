
import React from "react";

interface TemplateEightProps {
  subject: string;
  heading: string;
  subheading: string;
  content: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
}

const TemplateEight: React.FC<TemplateEightProps> = ({
  subject,
  heading,
  subheading,
  content,
  buttonText,
  buttonUrl,
  imageUrl,
}) => {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "'Poppins', 'Helvetica', sans-serif", backgroundColor: "#FFFFFF" }}>
      {/* Top Header Bar */}
      <div style={{ 
        backgroundColor: "#6C63FF", 
        padding: "10px 20px",
        textAlign: "center",
        color: "white",
        fontSize: "14px",
        fontWeight: "500"
      }}>
        {subject || "Boletín Informativo - Edición Especial"}
      </div>
      
      {/* Logo Banner with Dark Background */}
      <div style={{ 
        backgroundColor: "#2D3748", 
        padding: "0px 20px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        backgroundImage: `linear-gradient(rgba(45, 55, 72, 0.92), rgba(45, 55, 72, 0.92)), url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>
        {/* Overlay Pattern - Dots */}
        <div style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundImage: "radial-gradient(#FFFFFF33 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          zIndex: "1"
        }}></div>
        
        <div style={{ position: "relative", zIndex: "2" }}>
          <img 
            src="https://res.cloudinary.com/dolpwpgtw/image/upload/v1746807761/ovkwvqgr7giep2fph31x.png" 
            alt="Cultura Digital" 
            style={{ 
              height: "45px", 
              margin: "0 auto 15px auto",
              filter: "brightness(0) invert(1)" // Ensure white logo
            }}
          />
          
          <h1 style={{ 
            color: "#FFFFFF", 
            fontSize: "28px", 
            fontWeight: "800", 
            margin: "0 0 10px 0",
            letterSpacing: "1px",
            textShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}>
            {heading || "Eventos Virtuales"}
          </h1>
          
          <h2 style={{ 
            color: "#E2E8F0", 
            fontSize: "16px", 
            fontWeight: "400", 
            // Fixed: removed duplicate margin property
            marginTop: "0",
            marginBottom: "0",
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: "450px",
            lineHeight: "1.5"
          }}>
            {subheading || "Aprende desde cualquier lugar con nuestros eventos digitales"}
          </h2>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div style={{ padding: "40px 30px", backgroundColor: "#FFFFFF" }}>
        {/* Content Columns */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column",
          gap: "30px"
        }}>
          {/* Left Column */}
          <div>
            <div style={{ 
              border: "1px solid #E2E8F0",
              borderLeft: "4px solid #6C63FF",
              borderRadius: "5px",
              padding: "20px 25px",
              fontSize: "16px",
              lineHeight: "1.6",
              color: "#4A5568",
              backgroundColor: "#F7FAFC"
            }}>
              {content || `Estimados miembros de la comunidad:

Estamos emocionados de presentar nuestra nueva serie de eventos virtuales diseñados para mejorar sus habilidades tecnológicas sin salir de casa.

En los próximos meses, ofreceremos:

• Webinars semanales con expertos de la industria
• Talleres prácticos de desarrollo profesional
• Sesiones de networking con líderes tecnológicos
• Certificaciones reconocidas internacionalmente

Los eventos están abiertos para todos los niveles, desde principiantes hasta profesionales avanzados.`}
            </div>
          </div>
          
          {/* Right Column / Feature Section */}
          <div style={{ 
            backgroundColor: "#F7FAFC",
            borderRadius: "8px",
            padding: "25px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}>
            <h3 style={{ 
              color: "#2D3748", 
              fontSize: "20px", 
              margin: "0 0 15px 0",
              fontWeight: "600",
              borderBottom: "2px solid #6C63FF",
              paddingBottom: "10px"
            }}>
              Próximos Eventos Destacados
            </h3>
            
            {/* Event Cards */}
            <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
              {/* Event 1 */}
              <div style={{ 
                display: "flex", 
                gap: "15px",
                backgroundColor: "#FFFFFF",
                padding: "15px",
                borderRadius: "5px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <div style={{ 
                  minWidth: "50px", 
                  backgroundColor: "#6C63FF", 
                  color: "white", 
                  borderRadius: "5px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px 0"
                }}>
                  <div style={{ fontWeight: "bold", fontSize: "18px" }}>15</div>
                  <div style={{ fontSize: "12px" }}>MAY</div>
                </div>
                <div>
                  <h4 style={{ margin: "0 0 5px 0", color: "#2D3748" }}>Introducción a la IA</h4>
                  <p style={{ margin: "0", fontSize: "14px", color: "#718096" }}>10:00 AM - Dr. Ana Martínez</p>
                </div>
              </div>
              
              {/* Event 2 */}
              <div style={{ 
                display: "flex", 
                gap: "15px",
                backgroundColor: "#FFFFFF",
                padding: "15px",
                borderRadius: "5px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <div style={{ 
                  minWidth: "50px", 
                  backgroundColor: "#6C63FF", 
                  color: "white", 
                  borderRadius: "5px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px 0"
                }}>
                  <div style={{ fontWeight: "bold", fontSize: "18px" }}>22</div>
                  <div style={{ fontSize: "12px" }}>MAY</div>
                </div>
                <div>
                  <h4 style={{ margin: "0 0 5px 0", color: "#2D3748" }}>Ciberseguridad Avanzada</h4>
                  <p style={{ margin: "0", fontSize: "14px", color: "#718096" }}>14:00 PM - Ing. Carlos Ruiz</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Button */}
        <div style={{ textAlign: "center", marginTop: "35px" }}>
          <a 
            href={buttonUrl} 
            style={{ 
              backgroundColor: "#6C63FF", 
              color: "white", 
              padding: "14px 32px", 
              borderRadius: "5px", 
              textDecoration: "none", 
              fontWeight: "600", 
              display: "inline-block",
              boxShadow: "0 4px 6px rgba(108, 99, 255, 0.2)",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              fontSize: "15px"
            }}
          >
            {buttonText}
          </a>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ 
        backgroundColor: "#2D3748", 
        padding: "35px 30px", 
        color: "#FFFFFF",
        textAlign: "center"
      }}>
        <img 
          src="https://cuidadoseguro.com.co/csc3/wp-content/uploads/2025/04/CULTURA-DIGITAL-CURVAS1.svg" 
          alt="Cultura Digital" 
          style={{ 
            height: "45px", 
            margin: "0 auto 20px auto",
            filter: "brightness(0) invert(1)" // Ensure white logo
          }}
        />
        
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: "15px", 
          marginBottom: "20px" 
        }}>
          <div style={{ 
            width: "36px", 
            height: "36px", 
            borderRadius: "50%",

            backgroundColor: "rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            color: "#FFFFFF"
          }}>f</div>
          <div style={{ 
            width: "36px", 
            height: "36px", 
            borderRadius: "50%", 
            backgroundColor: "rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            color: "#FFFFFF"
          }}>t</div>
          <div style={{ 
            width: "36px", 
            height: "36px", 
            borderRadius: "50%", 
            backgroundColor: "rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            color: "#FFFFFF"
          }}>in</div>
        </div>
        
        <p style={{ margin: "0 0 5px 0", color: "#E2E8F0", fontSize: "14px" }}>
          culturadigital@ipscsc.com.cojemplo.com | +57 300 123 4567
        </p>
        <p style={{ margin: "0", color: "#A0AEC0", fontSize: "13px" }}>
          © 2025 Programa de Cultura Digital - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};

export default TemplateEight;
