const { Pool } = require('pg');
require('dotenv').config();

// Configuración para conectar a PostgreSQL
const pool = new Pool({
  // Cuando se ejecuta en Railway, usar las variables de entorno proporcionadas por Railway
  // En lugar de intentar conectar a localhost
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'cultura_digital',
  port: process.env.PGPORT || 5432,
  // Añadir un tiempo de espera para intentos de conexión
  connectionTimeoutMillis: 10000,
  // Importante: establecer SSL según el entorno
  ssl: process.env.NODE_ENV === 'production' ? 
    { rejectUnauthorized: false } : false
});

// Función para verificar conexión a la base de datos
const initializeDatabase = async () => {
  try {
    console.log('Inicializando PostgreSQL...');
    console.log('Usando host:', process.env.PGHOST || 'localhost');
    console.log('Puerto:', process.env.PGPORT || 5432);
    console.log('Usuario:', process.env.PGUSER || 'postgres');
    console.log('Base de datos:', process.env.PGDATABASE || 'cultura_digital');
    
    // Probar la conexión
    const client = await pool.connect();
    console.log('Conexión a PostgreSQL establecida correctamente.');
    client.release();
    return true;
  } catch (error) {
    console.error('Error al inicializar PostgreSQL:', error);
    return false;
  }
};

module.exports = { pool, initializeDatabase };