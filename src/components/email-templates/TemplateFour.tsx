
import React from "react";

interface TemplateFourProps {
  subject: string;
  heading: string;
  subheading: string;
  content: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
}

const TemplateFour: React.FC<TemplateFourProps> = ({
  subject,
  heading,
  subheading,
  content,
  buttonText,
  buttonUrl,
  imageUrl,
}) => {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "'Poppins', 'Montserrat', Helvetica, Arial, sans-serif", backgroundColor: "#ffffff" }}>
      {/* Top Bar */}
      <div style={{ backgroundColor: "#0052A5", height: "8px" }}></div>
      
      {/* Header with Image Background */}
      <div style={{ 
        backgroundImage: `linear-gradient(rgba(0, 82, 165, 0.7), rgba(0, 82, 165, 0.7)), url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "60px 20px",
        textAlign: "center",
        color: "white"
      }}>
        <img 
          src="https://res.cloudinary.com/dolpwpgtw/image/upload/v1746807761/ovkwvqgr7giep2fph31x.png" 
          alt="Cultura Digital" 
          style={{ height: "70px", marginBottom: "20px" }}
        />
        <h1 style={{ fontSize: "32px", margin: "10px 0", textShadow: "1px 1px 3px rgba(0,0,0,0.3)", fontWeight: "600" }}>
          {heading || "Taller Digital"}
        </h1>
        <h2 style={{ fontSize: "20px", fontWeight: "normal", margin: "0", opacity: "0.9", textShadow: "1px 1px 2px rgba(0,0,0,0.2)" }}>
          {subheading || "Aprende nuevas habilidades tecnológicas"}
        </h2>
      </div>
      
      {/* Subject line / Date */}
      <div style={{ 
        backgroundColor: "#FFD800", 
        padding: "15px 20px", 
        color: "#0052A5",
        fontSize: "14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <strong>ASUNTO:</strong> {subject || "Invitación a Taller"}
        </div>
        <div>
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      {/* Content */}
      <div style={{ padding: "30px 40px", backgroundColor: "#ffffff" }}>
        {/* Content Box */}
        <div style={{ 
          borderLeft: "3px solid #0052A5",
          padding: "0 0 0 20px",
          marginBottom: "30px"
        }}>
          <div style={{ fontSize: "16px", lineHeight: "1.6", color: "#333" }}>
            {content || `Estimados participantes:

Nos complace invitarlos a nuestro próximo taller digital sobre herramientas de productividad. Durante esta sesión, aprenderán a:

• Optimizar su flujo de trabajo con aplicaciones colaborativas
• Gestionar proyectos de manera eficiente
• Automatizar tareas repetitivas
• Mejorar la comunicación del equipo

El taller está diseñado para todos los niveles de experiencia y proporcionará conocimientos prácticos que podrán aplicar inmediatamente.`}
          </div>
        </div>
        
        {/* Event Details Box */}
        <div style={{ 
          backgroundColor: "#f0f7ff", 
          padding: "20px", 
          borderRadius: "6px",
          marginBottom: "25px"
        }}>
          <h3 style={{ margin: "0 0 15px 0", color: "#0052A5", fontSize: "18px", fontWeight: "600" }}>Detalles del Evento</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "8px 0", fontWeight: "bold", width: "120px", color: "#555" }}>Fecha:</td>
                <td style={{ padding: "8px 0", color: "#333" }}>15 de Mayo, 2025</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", fontWeight: "bold", width: "120px", color: "#555" }}>Hora:</td>
                <td style={{ padding: "8px 0", color: "#333" }}>10:00 AM - 12:00 PM</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", fontWeight: "bold", width: "120px", color: "#555" }}>Lugar:</td>
                <td style={{ padding: "8px 0", color: "#333" }}>Sala de Conferencias Virtual</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", fontWeight: "bold", width: "120px", color: "#555" }}>Instructor:</td>
                <td style={{ padding: "8px 0", color: "#333" }}>María González, Especialista en Productividad</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Button */}
        <div style={{ textAlign: "center", margin: "30px 0" }}>
          <a 
            href={buttonUrl} 
            style={{ 
              backgroundColor: "#0052A5", 
              color: "#FFD800", 
              padding: "15px 30px", 
              textDecoration: "none", 
              borderRadius: "30px", 
              fontWeight: "bold",
              display: "inline-block",
              fontSize: "16px",
              boxShadow: "0 4px 8px rgba(0,82,165,0.2)",
              textTransform: "uppercase",
              letterSpacing: "1px"
            }}
          >
            {buttonText}
          </a>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ 
        backgroundColor: "#f8f8f8", 
        padding: "25px 20px",
        borderTop: "1px solid #e0e0e0",
        color: "#555",
        fontSize: "14px",
        textAlign: "center"
      }}>
        <div style={{ marginBottom: "15px", display: "flex", justifyContent: "center", gap: "20px" }}>
          <span>📞 Ext. 1234</span>
          <span>📧 cultura.digital@ejemplo.com</span>
        </div>
        <p style={{ margin: "0", fontSize: "13px", opacity: "0.7" }}>
          © 2025 Programa de Cultura Digital - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};

export default TemplateFour;
