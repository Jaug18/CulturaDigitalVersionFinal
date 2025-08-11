import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection string
const connectionString = process.env.DATABASE_URL;
console.log('Connection string disponible:', !!connectionString);

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Configuración para conectar a PostgreSQL usando solo DATABASE_URL
export const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? 
    { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
});

// Función para verificar conexión a la base de datos
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log('Inicializando PostgreSQL...');
    console.log('URL de conexión:', process.env.DATABASE_URL ? 'Configurada (valor ocultado)' : 'No configurada');
    
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
