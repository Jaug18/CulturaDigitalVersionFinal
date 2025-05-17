
import React from "react";

interface TemplateFiveProps {
  subject: string;
  heading: string;
  subheading: string;
  content: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
}

const TemplateFive: React.FC<TemplateFiveProps> = ({
  subject,
  heading,
  subheading,
  content,
  buttonText,
  buttonUrl,
  imageUrl,
}) => {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "'Poppins', 'Roboto', 'Segoe UI', Arial, sans-serif", backgroundColor: "#ffffff" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#ffffff", padding: "25px 30px", textAlign: "center" }}>
        <img 
          src="https://res.cloudinary.com/dolpwpgtw/image/upload/v1746459857/uxt4iqleuilxpqofn5s9.png" 
          alt="Cultura Digital" 
          style={{ height: "60px" }}
        />
      </div>
      
      {/* Subject Banner */}
      <div style={{ 
        backgroundColor: "#0052A5", 
        textAlign: "center",
        padding: "12px 20px",
        color: "white"
      }}>
        <p style={{ margin: "0", fontWeight: "500", fontSize: "15px" }}>
          {subject || "Boletín de Nuevas Tecnologías"}
        </p>
      </div>
      
      {/* Hero Section */}
      <div style={{ padding: "40px 30px", backgroundColor: "#f0f7ff", textAlign: "center" }}>
        <h1 style={{ 
          color: "#0052A5", 
          fontSize: "28px", 
          margin: "0 0 15px 0",
          letterSpacing: "0.5px",
          fontWeight: "600"
        }}>
          {heading || "Conozca Las Nuevas Tendencias Tecnológicas"}
        </h1>
        
        <p style={{ 
          color: "#555", 
          fontSize: "17px", 
          lineHeight: "1.5",
          maxWidth: "480px",
          margin: "0 auto 30px auto"
        }}>
          {subheading || "Mantente al día con las últimas innovaciones que están transformando el entorno laboral"}
        </p>
        
        <div style={{ width: "50px", height: "3px", backgroundColor: "#FFD800", margin: "0 auto 30px auto" }}></div>
      </div>
      
      {/* Image Section */}
      <div style={{ backgroundColor: "#ffffff" }}>
        <img 
          src={imageUrl} 
          alt="Tendencias Tecnológicas" 
          style={{ 
            width: "100%", 
            height: "auto", 
            display: "block",
            maxHeight: "300px",
            objectFit: "cover"
          }}
        />
      </div>
      
      {/* Content Section */}
      <div style={{ padding: "40px 30px", backgroundColor: "#ffffff" }}>
        <div style={{ 
          fontSize: "16px", 
          lineHeight: "1.6", 
          color: "#333",
          maxWidth: "540px",
          margin: "0 auto"
        }}>
          {content || `Estimado equipo:

El panorama tecnológico evoluciona constantemente, trayendo nuevas herramientas y metodologías que pueden mejorar significativamente nuestra productividad y eficiencia. En este boletín, destacamos las tendencias más relevantes para nuestro sector:

1. **Inteligencia artificial aplicada**: Nuevas formas de automatizar y mejorar procesos empresariales
2. **Tecnologías colaborativas**: Plataformas que potencian el trabajo en equipo a distancia
3. **Seguridad adaptativa**: Sistemas de protección que evolucionan frente a nuevas amenazas
4. **Computación en la nube avanzada**: Servicios más potentes y eficientes

Le invitamos a explorar estas tendencias y considerar cómo podrían beneficiar a su área de trabajo.`}
        </div>
        
        {/* Quote Section */}
        <div style={{ 
          margin: "40px auto", 
          padding: "25px 30px", 
          backgroundColor: "#f9f9f9",
          borderLeft: "4px solid #FFD800",
          maxWidth: "480px"
        }}>
          <p style={{ 
            fontStyle: "italic", 
            color: "#555", 
            margin: "0 0 10px 0",
            fontSize: "16px",
            lineHeight: "1.6"
          }}>
            "La tecnología por sí sola no es suficiente. Es la tecnología combinada con las artes liberales y las humanidades lo que nos da el resultado que hace cantar a nuestro corazón."
          </p>
          <p style={{ 
            margin: "0", 
            textAlign: "right", 
            color: "#777", 
            fontSize: "14px" 
          }}>
            — Steve Jobs
          </p>
        </div>
        
        {/* Button */}
        <div style={{ textAlign: "center", margin: "30px 0" }}>
          <a 
            href={buttonUrl} 
            style={{ 
              backgroundColor: "#FFD800", 
              color: "#0052A5", 
              padding: "14px 28px", 
              textDecoration: "none", 
              borderRadius: "4px", 
              fontWeight: "bold",
              display: "inline-block",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            {buttonText}
          </a>
        </div>
      </div>
      
      {/* Social Media Section */}
      <div style={{ 
        borderTop: "1px solid #e0e0e0",
        padding: "30px",
        backgroundColor: "#f8f8f8",
        textAlign: "center"
      }}>
        <p style={{ margin: "0 0 15px 0", color: "#555", fontSize: "14px" }}>Síguenos en nuestras redes sociales</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginBottom: "20px" }}>
          {/* Social media icons represented as colored circles */}
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#0052A5", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "18px" }}>f</div>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#0052A5", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "18px" }}>in</div>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#0052A5", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "18px" }}>tw</div>
        </div>
      </div>
      
      {/* Footer with 3D Image */}
      <div style={{ 
        backgroundColor: "#0052A5", 
        padding: "25px", 
        color: "white", 
        textAlign: "center",
        fontSize: "13px",
        position: "relative",
        overflow: "visible"
      }}>
        {/* 3D Image that stands out from the footer */}
        <div style={{ 
          position: "absolute", 
          top: "-45px", 
          left: "50%", 
          transform: "translateX(-50%)",
          filter: "drop-shadow(0px 6px 12px rgba(0,0,0,0.25))"
        }}>
          <img 
            src="https://res.cloudinary.com/dolpwpgtw/image/upload/v1746473299/kclfqt1quht8vesndgkc.png" 
            alt="Imagen Footer 3D" 
            style={{ 
              height: "85px",
              transform: "perspective(800px) rotateX(10deg)",
              transition: "transform 0.3s ease"
            }}
          />
        </div>
        
        {/* Add padding top to ensure text is below the protruding image */}
        <div style={{ paddingTop: "50px" }}>
          <p style={{ margin: "0 0 10px 0", opacity: "0.9" }}>
            Programa de Cultura Digital | cultura.digital@ejemplo.com
          </p>
          <p style={{ margin: "0", opacity: "0.7" }}>
            © 2025 Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplateFive;