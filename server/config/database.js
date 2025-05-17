const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection string para Railway
const connectionString = process.env.DATABASE_URL;
console.log('Connection string disponible:', !!connectionString);

// Configuración para conectar a PostgreSQL
const pool = new Pool(
  connectionString 
    ? { connectionString, ssl: { rejectUnauthorized: false } }
    : {
        // Fallback a variables individuales
        host: process.env.PGHOST || 'localhost',
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'cultura_digital',
        port: process.env.PGPORT || 5432,
        connectionTimeoutMillis: 10000,
        ssl: process.env.NODE_ENV === 'production' ? 
          { rejectUnauthorized: false } : false
      }
);

// Función para verificar conexión a la base de datos
const initializeDatabase = async () => {
  try {
    console.log('Inicializando PostgreSQL...');
    console.log('URL de conexión:', process.env.DATABASE_URL ? 'Configurada (valor ocultado)' : 'No configurada');
    console.log('Variables individuales:');
    console.log('- Host:', process.env.PGHOST || '(no configurado)');
    console.log('- Puerto:', process.env.PGPORT || '(no configurado)');
    console.log('- Usuario:', process.env.PGUSER || '(no configurado)');
    console.log('- Base de datos:', process.env.PGDATABASE || '(no configurado)');
    
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