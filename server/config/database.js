const { Pool } = require('pg');
require('dotenv').config();

// Priorizar la URL de conexión de DATABASE_URL si existe
const pool = process.env.DATABASE_URL 
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // Necesario para conexiones a bases de datos en la nube
    })
  : new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'cultura_digital',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    });

// Script para crear tablas si no existen
const initializeDatabase = async () => {
  try {
    // Crear tabla de emails
    await pool.query(`
      CREATE TABLE IF NOT EXISTS emails (
        id SERIAL PRIMARY KEY,
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
        imagenes_base64 INTEGER,
        imagenes_url INTEGER,
        imagenes_total_kb INTEGER,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear tabla de contactos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear tabla de listas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lists (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear tabla de relación muchos a muchos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS list_contacts (
        list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE,
        contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
        added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (list_id, contact_id)
      );
    `);

    // Función para actualización automática de updated_at
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_modified_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Triggers para updated_at
    await pool.query(`
      DROP TRIGGER IF EXISTS update_contacts_modtime ON contacts;
      CREATE TRIGGER update_contacts_modtime
          BEFORE UPDATE ON contacts
          FOR EACH ROW
          EXECUTE FUNCTION update_modified_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_lists_modtime ON lists;
      CREATE TRIGGER update_lists_modtime
          BEFORE UPDATE ON lists
          FOR EACH ROW
          EXECUTE FUNCTION update_modified_column();
    `);

    console.log('Base de datos PostgreSQL inicializada correctamente');
    return true;
  } catch (error) {
    console.error('Error al inicializar PostgreSQL:', error);
    return false;
  }
};

module.exports = { pool, initializeDatabase };