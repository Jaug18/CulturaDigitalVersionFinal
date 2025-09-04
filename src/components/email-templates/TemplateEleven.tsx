import React from 'react';

interface TemplateElevenProps {
  subject?: string;
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

const TemplateEleven: React.FC<TemplateElevenProps> = ({
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
  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      fontFamily: "'Segoe UI', Arial, sans-serif",
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: '#0052A5',
        padding: '20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ 
          margin: '0 0 8px',
          fontSize: '22px',
          fontWeight: 700,
          lineHeight: '1.2'
        }}>
          {heading}
        </h1>
        <h2 style={{ 
          margin: '0',
          fontSize: '14px',
          fontWeight: 400,
          opacity: 0.9,
          lineHeight: '1.3'
        }}>
          {subheading}
        </h2>
      </div>
      
      {/* Content */}
      <div style={{ padding: '20px 25px' }}>
        {imageUrl && (
          <div style={{ marginBottom: '25px' }}>
            <img 
              src={imageUrl} 
              alt="Imagen destacada" 
              style={{ 
                width: '100%', 
                display: 'block',
                height: 'auto',
                border: 'none'
              }} 
            />
          </div>
        )}
        
        <div style={{ 
          color: '#333',
          lineHeight: '1.6',
          fontSize: '16px',
          marginBottom: '25px'
        }} dangerouslySetInnerHTML={{ __html: content }}>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <a 
            href={buttonUrl} 
            style={{
              display: 'inline-block',
              backgroundColor: '#0052A5',
              color: 'white',
              padding: '12px 25px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '16px'
            }}
            target="_blank" 
            rel="noopener noreferrer"
          >
            {buttonText}
          </a>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ 
        backgroundColor: '#0052A5', 
        padding: '20px', 
        color: 'white', 
        textAlign: 'center',
        fontSize: '13px'
      }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
          © 2025 {footerCompany || "Cultura Digital"} - Todos los derechos reservados
        </p>
        <p style={{ margin: '0 0 10px 0', fontSize: '12px', lineHeight: '1.4' }}>
          📧 {footerEmail || "contacto@culturadigital.com"} | 📞 {footerPhone || "+57 300 123 4567"}
        </p>
      </div>
    </div>
  );
};

export default TemplateEleven;
