
import React from "react";

interface TemplateTwelveProps {
  subject: string;
  heading: string;
  subheading: string;
  content: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
  mainColor?: string;
  accentColor?: string;
  textColor?: string;
}

const TemplateTwelve: React.FC<TemplateTwelveProps> = ({
  subject,
  heading,
  subheading,
  content,
  buttonText,
  buttonUrl,
  imageUrl,
  mainColor = "#6E59A5",
  accentColor = "#FEC6A1",
  textColor = "#333333"
}) => {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "'Poppins', 'Segoe UI', sans-serif", backgroundColor: "#FFFFFF" }}>
      {/* Wavy Top Header */}
      <div style={{ 
        position: "relative",
        height: "12px",
        backgroundColor: mainColor,
        overflow: "hidden"
      }}>
        <div style={{ 
          position: "absolute",
          bottom: "-10px",
          left: 0,
          width: "100%",
          height: "15px",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,7.5 C150,15 350,0 500,7.5 L500,0 L0,0 Z' fill='%23${mainColor.replace('#', '')}' /%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%"
        }}></div>
      </div>
      
      {/* Header with Logo */}
      <div style={{ 
        padding: "30px 20px 20px 20px",
        textAlign: "center"
      }}>
        <img 
          src="https://cuidadoseguro.com.co/csc3/wp-content/uploads/2025/04/CULTURA-DIGITAL-CURVAS1.svg" 
          alt="Cultura Digital" 
          style={{ height: "60px" }}
        />
        
        <div style={{ 
          margin: "25px auto 0 auto",
          maxWidth: "400px"
        }}>
          <h1 style={{ 
            color: mainColor,
            fontSize: "28px",
            margin: "0 0 10px 0",
            fontWeight: "700"
          }}>
            {heading || "Desarrollo Profesional"}
          </h1>
          
          <p style={{ 
            color: textColor,
            fontSize: "16px",
            margin: "0",
            lineHeight: "1.5"
          }}>
            {subheading || "Potencia tu carrera con nuestros recursos"}
          </p>
        </div>
      </div>
      
      {/* Image Section with Ribbon */}
      <div style={{ position: "relative", marginBottom: "50px" }}>
        <img 
          src={imageUrl} 
          alt="Featured Image" 
          style={{ 
            width: "100%",
            display: "block",
            maxHeight: "250px",
            objectFit: "cover"
          }}
        />
        
        {/* Subject Ribbon */}
        <div style={{ 
          position: "absolute",
          bottom: "-25px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: accentColor,
          padding: "12px 30px",
          color: mainColor,
          fontWeight: "600",
          fontSize: "15px",
          borderRadius: "5px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          whiteSpace: "nowrap"
        }}>
          {subject || "Programa de Actualización"}
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{ padding: "10px 30px 40px 30px" }}>
        {/* Content Block */}
        <div style={{ 
          fontSize: "16px",
          lineHeight: "1.6",
          color: textColor,
          marginBottom: "30px",
          padding: "25px",
          backgroundColor: "#F9F9F9",
          borderRadius: "8px",
          borderLeft: `4px solid ${mainColor}`
        }}>
          {content || `Estimados participantes:

Nos complace presentarles nuestro nuevo programa de desarrollo profesional enfocado en habilidades digitales esenciales para el entorno laboral actual:

• Análisis de datos y visualización
• Colaboración efectiva en entornos virtuales
• Gestión ágil de proyectos
• Comunicación digital estratégica

Cada módulo incluye certificación y materiales prácticos que podrán aplicar inmediatamente en sus funciones diarias.`}
        </div>
        
        {/* Highlights Section */}
        <div style={{ marginBottom: "35px" }}>
          <h2 style={{ 
            textAlign: "center",
            color: mainColor,
            fontSize: "20px",
            margin: "0 0 20px 0",
            fontWeight: "600"
          }}>
            Beneficios del Programa
          </h2>
          
          <div style={{ 
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            justifyContent: "center"
          }}>
            {/* Highlight Card 1 */}
            <div style={{ 
              flex: "1",
              minWidth: "150px",
              backgroundColor: "#FFFFFF",
              padding: "20px 15px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              textAlign: "center",
              border: `1px solid ${accentColor}`
            }}>
              <div style={{ 
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: mainColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 10px auto",
                fontSize: "20px",
                fontWeight: "bold",
                color: "#FFFFFF"
              }}>1</div>
              <h3 style={{ 
                color: mainColor,
                fontSize: "16px",
                margin: "0 0 5px 0",
                fontWeight: "600"
              }}>Flexibilidad</h3>
              <p style={{ 
                margin: "0",
                fontSize: "13px",
                color: textColor
              }}>
                Aprende a tu propio ritmo
              </p>
            </div>
            
            {/* Highlight Card 2 */}
            <div style={{ 
              flex: "1",
              minWidth: "150px",
              backgroundColor: "#FFFFFF",
              padding: "20px 15px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              textAlign: "center",
              border: `1px solid ${accentColor}`
            }}>
              <div style={{ 
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: mainColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 10px auto",
                fontSize: "20px",
                fontWeight: "bold",
                color: "#FFFFFF"
              }}>2</div>
              <h3 style={{ 
                color: mainColor,
                fontSize: "16px",
                margin: "0 0 5px 0",
                fontWeight: "600"
              }}>Práctica</h3>
              <p style={{ 
                margin: "0",
                fontSize: "13px",
                color: textColor
              }}>
                Proyectos del mundo real
              </p>
            </div>
            
            {/* Highlight Card 3 */}
            <div style={{ 
              flex: "1",
              minWidth: "150px",
              backgroundColor: "#FFFFFF",
              padding: "20px 15px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              textAlign: "center",
              border: `1px solid ${accentColor}`
            }}>
              <div style={{ 
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: mainColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 10px auto",
                fontSize: "20px",
                fontWeight: "bold",
                color: "#FFFFFF"
              }}>3</div>
              <h3 style={{ 
                color: mainColor,
                fontSize: "16px",
                margin: "0 0 5px 0",
                fontWeight: "600"
              }}>Certificación</h3>
              <p style={{ 
                margin: "0",
                fontSize: "13px",
                color: textColor
              }}>
                Reconocimiento oficial
              </p>
            </div>
          </div>
        </div>
        
        {/* Next Steps Section */}
        <div style={{ 
          backgroundColor: "#F3F0FB",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
          textAlign: "center"
        }}>
          <h3 style={{ 
            color: mainColor,
            fontSize: "18px",
            margin: "0 0 15px 0"
          }}>
            Próximas Fechas
          </h3>
          
          <p style={{ 
            margin: "0 0 5px 0",
            fontSize: "15px",
            color: textColor
          }}>
            <strong>Inicio de inscripciones:</strong> 1 de junio, 2025
          </p>
          
          <p style={{ 
            margin: "0",
            fontSize: "15px",
            color: textColor
          }}>
            <strong>Inicio del programa:</strong> 15 de junio, 2025
          </p>
        </div>
        
        {/* Call to Action */}
        <div style={{ textAlign: "center" }}>
          <a 
            href={buttonUrl} 
            style={{ 
              backgroundColor: mainColor,
              color: "#FFFFFF",
              padding: "14px 30px",
              borderRadius: "30px",
              textDecoration: "none",
              fontWeight: "600",
              display: "inline-block",
              fontSize: "16px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
            }}
          >
            {buttonText}
          </a>
        </div>
      </div>
      
      {/* Footer with Wavy Top Border */}
      <div style={{ 
        position: "relative",
        backgroundColor: mainColor,
        padding: "40px 20px 30px 20px",
        color: "#FFFFFF",
        textAlign: "center"
      }}>
        {/* Wavy Border */}
        <div style={{ 
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "15px",
          transform: "translateY(-99%)",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,10 C150,0 350,20 500,10 L500,15 L0,15 Z' fill='%23${mainColor.replace('#', '')}' /%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%"
        }}></div>
        
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
          ¿Preguntas? Contacta a culturadigital@ipscsc.com.cojemplo.com
        </p>
        
        <div style={{ 
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          margin: "20px 0"
        }}>
          {/* Social Media Icons */}
          <div style={{ 
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            backgroundColor: accentColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: mainColor,
            fontSize: "14px",
            fontWeight: "bold"
          }}>f</div>
          <div style={{ 
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            backgroundColor: accentColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: mainColor,
            fontSize: "14px",
            fontWeight: "bold"
          }}>in</div>
          <div style={{ 
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            backgroundColor: accentColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: mainColor,
            fontSize: "14px",
            fontWeight: "bold"
          }}>t</div>
        </div>
        
        <p style={{ 
          margin: "0",
          fontSize: "12px",
          opacity: "0.7"
        }}>
          © 2025 Programa de Cultura Digital - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};

export default TemplateTwelve;
