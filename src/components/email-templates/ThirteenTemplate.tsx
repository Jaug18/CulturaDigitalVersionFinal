
import React from "react";

interface ThirteenTemplateProps {
  subject: string;
  heading: string;
  subheading: string;
  content: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
  logoBase64?: string;
}

const ThirteenTemplate: React.FC<ThirteenTemplateProps> = ({
  subject,
  heading,
  subheading,
  content,
  buttonText,
  buttonUrl,
  imageUrl,
  logoBase64,
}) => {
  const logoSrc = logoBase64 || "https://cuidadoseguro.com.co/csc3/wp-content/uploads/2025/04/CULTURA-DIGITAL-CURVAS1.svg";

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "'Poppins', sans-serif" }}>
      {/* Encabezado con degradado */}
      <div style={{ 
        background: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)",
        padding: "40px 20px",
        textAlign: "center" as const,
        borderRadius: "8px 8px 0 0"
      }}>
        <img src={logoSrc} alt="Logo" style={{ height: "60px", marginBottom: "20px" }} />
        <h1 style={{ 
          color: "#ffffff",
          margin: "0",
          fontSize: "28px",
          fontWeight: "600"
        }}>{heading}</h1>
        <p style={{ 
          color: "#ffffff",
          fontSize: "18px",
          marginTop: "10px"
        }}>{subheading}</p>
      </div>

      {/* Contenido Principal */}
      <div style={{ 
        backgroundColor: "#ffffff",
        padding: "30px",
        borderRadius: "0 0 8px 8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}>
        <img 
          src={imageUrl} 
          alt="Imagen principal"
          style={{ 
            maxWidth: "100%",
            height: "auto",
            display: "block",
            borderRadius: "4px",
            margin: "0 auto 25px auto"
          }}
        />

        <div style={{ 
          color: "#444",
          fontSize: "16px",
          lineHeight: "1.6",
          whiteSpace: "pre-wrap"
        }}>
          {content}
        </div>

        <div style={{ 
          textAlign: "center" as const,
          marginTop: "30px"
        }}>
          <a
            href={buttonUrl}
            style={{
              backgroundColor: "#2193b0",
              color: "#ffffff",
              padding: "12px 25px",
              borderRadius: "25px",
              textDecoration: "none",
              fontWeight: "500",
              display: "inline-block",
              transition: "background-color 0.3s"
            }}
          >
            {buttonText}
          </a>
        </div>
      </div>

      {/* Pie de página */}
      <div style={{ 
        textAlign: "center" as const,
        padding: "20px",
        color: "#666",
        fontSize: "14px"
      }}>
        <p style={{ margin: "0" }}>
          © 2025 Programa de Cultura Digital - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};

export default ThirteenTemplate;
