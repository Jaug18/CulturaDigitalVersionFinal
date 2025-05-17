
import React from "react";

interface FifteenTemplateProps {
  subject: string;
  heading: string;
  subheading: string;
  content: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
  logoBase64?: string;
}

const FifteenTemplate: React.FC<FifteenTemplateProps> = ({
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
    <div style={{ 
      maxWidth: "600px", 
      margin: "0 auto", 
      fontFamily: "'Poppins', sans-serif",
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      overflow: "hidden"
    }}>
      {/* Header Minimalista */}
      <div style={{
        backgroundColor: "#f8f9fa",
        padding: "30px 20px",
        textAlign: "center" as const,
        borderBottom: "2px solid #e9ecef"
      }}>
        <img 
          src={logoSrc} 
          alt="Logo" 
          style={{ height: "45px" }}
        />
      </div>

      {/* Imagen Principal */}
      <div style={{
        position: "relative" as const,
        height: "200px",
        overflow: "hidden",
        backgroundColor: "#e9ecef"
      }}>
        <img 
          src={imageUrl} 
          alt="Imagen principal"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover" as const
          }}
        />
      </div>

      {/* Contenido */}
      <div style={{
        padding: "40px 30px"
      }}>
        <h1 style={{
          color: "#212529",
          fontSize: "28px",
          margin: "0 0 15px 0",
          lineHeight: "1.3"
        }}>{heading}</h1>

        <h2 style={{
          color: "#6c757d",
          fontSize: "18px",
          margin: "0 0 30px 0",
          fontWeight: "normal"
        }}>{subheading}</h2>

        <div style={{
          color: "#495057",
          fontSize: "16px",
          lineHeight: "1.7",
          marginBottom: "35px",
          whiteSpace: "pre-wrap"
        }}>
          {content}
        </div>

        <div style={{
          textAlign: "center" as const
        }}>
          <a
            href={buttonUrl}
            style={{
              backgroundColor: "#212529",
              color: "#ffffff",
              padding: "16px 32px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "500",
              display: "inline-block",
              fontSize: "16px",
              transition: "all 0.3s ease"
            }}
          >
            {buttonText}
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: "#f8f9fa",
        padding: "25px 20px",
        textAlign: "center" as const,
        borderTop: "2px solid #e9ecef"
      }}>
        <p style={{
          margin: "0",
          color: "#6c757d",
          fontSize: "14px"
        }}>
          © 2025 Programa de Cultura Digital - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};

export default FifteenTemplate;
