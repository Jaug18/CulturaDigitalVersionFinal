
import React from "react";

interface TemplateOneProps {
  subject: string;
  heading: string;
  subheading: string;
  content: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
  logoBase64?: string;
  footerCompany?: string;
  footerEmail?: string;
  footerPhone?: string;
}

const TemplateOne: React.FC<TemplateOneProps> = ({
  subject,
  heading,
  subheading,
  content,
  buttonText,
  buttonUrl,
  imageUrl,
  logoBase64,
  footerCompany,
  footerEmail,
  footerPhone,
}) => {
  const logoSrc = logoBase64 || "https://res.cloudinary.com/dolpwpgtw/image/upload/v1746807761/ovkwvqgr7giep2fph31x.png";
  //0052A5
  return (
    <table cellPadding={0} cellSpacing={0} border={0} width="100%" style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif" }}>
     <tbody>
      <tr>
        <td align="center" style={{ backgroundColor: "#0052A5", padding: "20px 0" }}>
        <img 
        src={logoSrc}
        alt="Cultura Digital" 
        style={{ 
          height: "90px", // Aumenta el tamaño
          display: "block", 
          margin: "0 auto",
          // background: "#fff", // Fondo blanco
          borderRadius: "12px", // Bordes redondeados
          boxShadow: "0 2px 8px rgba(0,0,0,0.10)", // Sombra suave
          padding: "10px", // Espacio interno
          alignSelf: "center", // Centrado
        }}
      />
        </td>
      </tr>
      
      <tr>
        <td style={{ backgroundColor: "#f0f0f0", padding: "15px", borderBottom: "3px solid #FFD800" }}>
          <h2 style={{ margin: 0, color: "#0052A5", fontSize: "18px" }}>
            {subject || "Consejos y Tips de Tecnología - Cultura Digital"}
          </h2>
        </td>
      </tr>
      
      <tr>
        <td style={{ backgroundColor: "#ffffff", padding: "30px 20px" }}>
          <h1 style={{ color: "#0052A5", fontSize: "24px", marginTop: 0, fontWeight: "600" }}>
            {heading || "Tips de Tecnología de la Semana"}
          </h1>
          
          <h3 style={{ color: "#555555", fontSize: "18px", marginBottom: "20px", fontWeight: "500" }}>
            {subheading || "Mejora tu productividad con estos consejos"}
          </h3>
          
          <div style={{ marginBottom: "25px" }}>
            <img 
              src={imageUrl} 
              alt="Imagen destacada" 
              style={{ maxWidth: "100%", height: "auto", display: "block", borderRadius: "4px", margin: "0 auto" }}
            />
          </div>
          
          <div 
            style={{ color: "#333333", fontSize: "16px", lineHeight: "1.6", marginBottom: "25px" }}
            dangerouslySetInnerHTML={{ __html: content || `Estimado equipo:<br><br>Compartimos con ustedes los tips tecnológicos de esta semana que ayudarán a mejorar la seguridad y eficiencia en nuestras operaciones diarias.<br><br>• Mantenga sus aplicaciones siempre actualizadas<br>• Utilice contraseñas fuertes y diferentes para cada servicio<br>• Active la autenticación de dos factores cuando sea posible<br>• Realice copias de seguridad periódicamente` }}
          />
          
          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <a 
              href={buttonUrl} 
              style={{ 
                backgroundColor: "#FFD800", 
                color: "#0052A5 !important", 
                padding: "12px 25px", 
                textDecoration: "none !important", 
                borderRadius: "4px", 
                fontWeight: "bold",
                display: "inline-block",
                border: "2px solid #FFD800"
              }}
            >
              <span style={{ color: "#0052A5 !important", textDecoration: "none !important" }}>
                {buttonText}
              </span>
            </a>
          </div>
        </td>
      </tr>
        
      {/* <tr>
        <td align="center" style={{ background: "#ffffff", padding: "0" }}>
          <img
            src="https://res.cloudinary.com/dolpwpgtw/image/upload/v1746479801/je0wi0o4gnd3fqu18ore.png"
            alt="Avatar"
            style={{
              height: "50px", // Mitad superior del avatar
              width: "100px",
              display: "block",
              margin: "0 auto",
              objectFit: "cover",
              objectPosition: "top"
            }}
          />
        </td>
      </tr> */}
      
      {/* Fila 2: Contiene la mitad inferior del avatar sobre el fondo azul */}
      <tr>
        <td align="center" style={{ 
          backgroundColor: "#0052A5", 
          padding: "0"
        }}>
          <img
            src="https://res.cloudinary.com/dolpwpgtw/image/upload/v1746458788/qqrl0hsrj9wsqqepe0rp.png"
            alt="Avatar"
            style={{
              height: "50px", // Mitad inferior del avatar
              width: "100px",
              display: "block",
              margin: "0 auto",
              objectFit: "cover",
              objectPosition: "bottom"
            }}
          />
        </td>
      </tr>
      
      {/* Fila 3: Contiene el texto del footer */}
      <tr>
        <td style={{
          backgroundColor: "#0052A5",
          padding: "0 20px 20px 20px", // Sin padding superior
          color: "white",
          textAlign: "center"
        }}>
          <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
            © 2025 {footerCompany || "Cultura Digital"} - Todos los derechos reservados
          </p>
          
          {/* Sección de contacto - siempre se muestra con valores o placeholders */}
          <p style={{ margin: "0 0 10px 0", fontSize: "12px", lineHeight: "1.4" }}>
            📧 {footerEmail || "cultura.digital@ejemplo.com"} | 📞 {footerPhone || "+1 234 567 8900"}
          </p>
          
          {/* Texto por defecto que siempre se muestra */}
          <p style={{ margin: "0", fontSize: "12px" }}>
            Este correo fue enviado como parte del programa de Cultura Digital.
          </p>
        </td>
      </tr>
      </tbody>
    </table>
  );
};

export default TemplateOne;