
import React from "react";

interface TemplateFourProps {
  subject: string;
  heading: string;
  subheading: string;
  content: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  instructorName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

const TemplateFour: React.FC<TemplateFourProps> = ({
  subject,
  heading,
  subheading,
  content,
  buttonText,
  buttonUrl,
  imageUrl,
  eventDate,
  eventTime,
  eventLocation,
  instructorName,
  contactPhone,
  contactEmail,
}) => {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "'Poppins', 'Montserrat', Helvetica, Arial, sans-serif", backgroundColor: "#ffffff" }}>
      {/* Top Bar */}
      <div style={{ backgroundColor: "#0052A5", height: "8px" }}></div>
      
      {/* Header */}
      <div style={{ 
        backgroundColor: "#0052A5",
        padding: "0px 20px",
        textAlign: "center",
        color: "white"
      }}>
        <img 
          src="https://res.cloudinary.com/dolpwpgtw/image/upload/v1746807761/ovkwvqgr7giep2fph31x.png" 
          alt="Cultura Digital" 
          style={{ height: "50px", marginBottom: "15px" }}
        />
        <h1 style={{ fontSize: "32px", margin: "10px 0", fontWeight: "600" }}>
          {heading || "Taller Digital"}
        </h1>
        <h2 style={{ fontSize: "20px", fontWeight: "normal", margin: "0", opacity: "0.9" }}>
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
      
      {/* Featured Image */}
      <div style={{ textAlign: "center", backgroundColor: "#ffffff", paddingTop: "15px" }}>
        <img 
          src={imageUrl} 
          alt="Imagen del taller" 
          style={{ 
            maxWidth: "100%", 
            height: "auto", 
            display: "block", 
            margin: "0 auto"
          }}
        />
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
                <td style={{ padding: "8px 0", color: "#333" }}>{eventDate || "15 de Mayo, 2025"}</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", fontWeight: "bold", width: "120px", color: "#555" }}>Hora:</td>
                <td style={{ padding: "8px 0", color: "#333" }}>{eventTime || "10:00 AM - 12:00 PM"}</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", fontWeight: "bold", width: "120px", color: "#555" }}>Lugar:</td>
                <td style={{ padding: "8px 0", color: "#333" }}>{eventLocation || "Sala de Conferencias Virtual"}</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", fontWeight: "bold", width: "120px", color: "#555" }}>Instructor:</td>
                <td style={{ padding: "8px 0", color: "#333" }}>{instructorName || "María González, Especialista en Productividad"}</td>
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
              color: "#ffffff !important", 
              padding: "15px 30px", 
              textDecoration: "none !important", 
              borderRadius: "30px", 
              fontWeight: "bold",
              display: "inline-block",
              fontSize: "16px",
              boxShadow: "0 4px 8px rgba(0,82,165,0.2)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              border: "2px solid #0052A5"
            }}
          >
            <span style={{ color: "#ffffff !important", textDecoration: "none !important" }}>
              {buttonText}
            </span>
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
          <span>📞 {contactPhone || "Ext. 1234"}</span>
          <span>📧 {contactEmail || "cultura.digital@ejemplo.com"}</span>
        </div>
        <p style={{ margin: "0", fontSize: "13px", opacity: "0.7" }}>
          © 2025 Programa de Cultura Digital - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};

export default TemplateFour;
