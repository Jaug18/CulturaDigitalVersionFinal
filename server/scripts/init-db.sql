-- Script para creación completa de base de datos
-- Sistema de Cultura Digital: Gestión de correos, contactos y listas por usuario
--node -e "require('bcrypt').hash('Admin123', 10).then(hash => console.log(hash))"
BEGIN;

-- 1. TABLAS DE USUARIOS Y AUTENTICACIÓN

-- Tabla de usuarios
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  reset_password_token VARCHAR(255),
  reset_password_expires TIMESTAMP,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tokens de refresco
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de intentos de inicio de sesión
CREATE TABLE login_attempts (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  user_agent TEXT
);

-- 2. TABLAS DE CONTACTOS Y LISTAS

-- Tabla de contactos (por usuario)
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, email)
);

-- Tabla de listas (por usuario)
CREATE TABLE lists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación muchos a muchos entre listas y contactos
CREATE TABLE list_contacts (
  list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
  added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (list_id, contact_id)
);

-- 3. TABLAS DE EMAILS Y PROGRAMACIÓN

-- Tabla de emails enviados
CREATE TABLE emails (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_email TEXT[] NOT NULL,
  subject TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  status TEXT NOT NULL,
  message TEXT,
  email_id TEXT,
  content_preview TEXT,
  titulo_principal TEXT,
  subtitulo TEXT,
  contenido TEXT,
  template_id TEXT,
  imagenes_base64 INTEGER,
  imagenes_url INTEGER,
  imagenes_total_kb INTEGER,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
SHOW timezone;

-- Tabla de emails programados
CREATE TABLE scheduled_emails (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_email TEXT[] NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  scheduled_for TIMESTAMP NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  titulo_principal TEXT,
  subtitulo TEXT,
  contenido TEXT,
  template_id TEXT,
  image_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  error_message TEXT
);

-- 4. ÍNDICES PARA OPTIMIZACIÓN

-- Índices para búsqueda de contactos
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_user_status ON contacts(user_id, status);
CREATE INDEX idx_contacts_name_search ON contacts USING gin(to_tsvector('spanish', name));

-- Índices para búsqueda de listas
CREATE INDEX idx_lists_user_id ON lists(user_id);
CREATE INDEX idx_lists_name_search ON lists USING gin(to_tsvector('spanish', name));

-- Índices para list_contacts
CREATE INDEX idx_list_contacts_contact_id ON list_contacts(contact_id);

-- Índices para emails
CREATE INDEX idx_emails_user_id ON emails(user_id);
CREATE INDEX idx_emails_status ON emails(status);
CREATE INDEX idx_emails_timestamp ON emails(timestamp);
CREATE INDEX idx_emails_user_status ON emails(user_id, status);

-- Índices para emails programados
CREATE INDEX idx_scheduled_emails_user_id ON scheduled_emails(user_id);
CREATE INDEX idx_scheduled_emails_status ON scheduled_emails(status);
CREATE INDEX idx_scheduled_emails_pending ON scheduled_emails(status, scheduled_for)
WHERE status = 'pending';

-- 5. FUNCIONES Y TRIGGERS

-- Función para actualización automática de updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_contacts_modtime
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_lists_modtime
    BEFORE UPDATE ON lists
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_scheduled_emails_modtime
    BEFORE UPDATE ON scheduled_emails
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Función para verificar que los contactos de una lista pertenezcan al mismo usuario
CREATE OR REPLACE FUNCTION check_list_contact_ownership()
RETURNS TRIGGER AS $$
DECLARE
    list_user_id INTEGER;
    contact_user_id INTEGER;
BEGIN
    -- Obtener user_id de la lista
    SELECT user_id INTO list_user_id FROM lists WHERE id = NEW.list_id;
    
    -- Obtener user_id del contacto
    SELECT user_id INTO contact_user_id FROM contacts WHERE id = NEW.contact_id;
    
    -- Verificar que ambos pertenezcan al mismo usuario
    IF list_user_id != contact_user_id THEN
        RAISE EXCEPTION 'No se puede agregar un contacto de otro usuario a esta lista';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_list_contact_ownership_trigger
    BEFORE INSERT OR UPDATE ON list_contacts
    FOR EACH ROW
    EXECUTE FUNCTION check_list_contact_ownership();

-- 6. VISTAS PARA REPORTES

-- Vista para mostrar conteos de contactos por lista
CREATE OR REPLACE VIEW v_list_contact_counts AS
SELECT 
    l.id, 
    l.name, 
    l.user_id,
    COUNT(lc.contact_id) AS contact_count
FROM 
    lists l
LEFT JOIN 
    list_contacts lc ON l.id = lc.list_id
GROUP BY 
    l.id, l.name, l.user_id;

-- Vista para estadísticas de emails por usuario
CREATE OR REPLACE VIEW v_email_stats_by_user AS
SELECT
    user_id,
    COUNT(*) AS total_emails,
    COUNT(*) FILTER (WHERE status = 'sent') AS sent_emails,
    COUNT(*) FILTER (WHERE status = 'failed') AS failed_emails,
    COUNT(*) FILTER (WHERE timestamp > CURRENT_DATE - INTERVAL '30 days') AS emails_last_30_days
FROM
    emails
GROUP BY 
    user_id;

COMMIT;
