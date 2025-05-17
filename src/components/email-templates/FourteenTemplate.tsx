
import React from "react";

interface FourteenTemplateProps {
  subject: string;
  heading: string;
  subheading: string;
  content: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
  logoBase64?: string;
}

const FourteenTemplate: React.FC<FourteenTemplateProps> = ({
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
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "'Poppins', sans-serif", backgroundColor: "#f8f9fa" }}>
      {/* Header con diseño moderno */}
      <div style={{
        backgroundColor: "#1a237e",
        padding: "30px 20px",
        textAlign: "center" as const,
      }}>
        <img src={logoSrc} alt="Logo" style={{ height: "50px", marginBottom: "15px" }} />
      </div>

      {/* Sección de título */}
      <div style={{
        backgroundColor: "#ffffff",
        margin: "20px",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{
          color: "#1a237e",
          fontSize: "26px",
          margin: "0 0 10px 0",
          textAlign: "center" as const
        }}>{heading}</h1>
        <p style={{
          color: "#666",
          fontSize: "16px",
          textAlign: "center" as const,
          margin: "0"
        }}>{subheading}</p>
      </div>

      {/* Contenido Principal */}
      <div style={{
        backgroundColor: "#ffffff",
        margin: "20px",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <img 
          src={imageUrl} 
          alt="Imagen destacada"
          style={{
            width: "100%",
            height: "auto",
            borderRadius: "8px",
            marginBottom: "25px"
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
              backgroundColor: "#1a237e",
              color: "#ffffff",
              padding: "14px 28px",
              borderRadius: "5px",
              textDecoration: "none",
              fontWeight: "500",
              display: "inline-block",
              textTransform: "uppercase" as const,
              fontSize: "14px",
              letterSpacing: "1px"
            }}
          >
            {buttonText}
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: "#1a237e",
        color: "#ffffff",
        padding: "20px",
        textAlign: "center" as const,
        fontSize: "14px"
      }}>
        <p style={{ margin: "0" }}>
          © 2025 Programa de Cultura Digital
        </p>
        <p style={{ margin: "5px 0 0 0", fontSize: "12px", opacity: "0.8" }}>
          Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};

export default FourteenTemplate;
