import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';

// Rutas
import authRoutes from '@/routes/auth';
import emailRoutes from '@/routes/email';
import contactRoutes from '@/routes/contacts';
import listRoutes from '@/routes/lists';
import adminRoutes from '@/routes/admin';
import systemRoutes from '@/routes/system';

// Servicios
import { initializeDatabase } from '@/config/database';
import { initializeEmailServices } from '@/services/emailService';

// Middleware de autenticación
import { authenticateToken } from '@/config/auth';

const app = express();

// Middleware básico
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const allowedOrigins = [
  // URLs de producción
  'https://culturadigitalversionfinal-production.up.railway.app',
  // URLs de desarrollo
  'http://localhost:8080',
  'http://localhost:8081', 
  'http://localhost:5173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function(origin, callback) {
    // Para solicitudes sin origen (como las herramientas API) o en desarrollo
    if (!origin || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`Origin ${origin} not allowed by CORS policy. Adding to allowed list temporarily.`);
      allowedOrigins.push(origin); // Añadir dinámicamente al whitelist
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));

// Middleware adicional para CORS
app.use((req, res, next) => {
  if (!res.getHeader('Access-Control-Allow-Origin')) {
    const origin = req.headers.origin;
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      res.header('Access-Control-Allow-Origin', origin || '*');
    }
  }
  
  if (!res.getHeader('Access-Control-Allow-Methods')) {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
  }
  
  if (!res.getHeader('Access-Control-Allow-Headers')) {
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept');
  }
  
  if (!res.getHeader('Access-Control-Allow-Credentials')) {
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  return next();
});

// Configurar archivos estáticos del frontend
const frontendBuildPath = path.join(__dirname, '../dist');
if (fs.existsSync(frontendBuildPath)) {
  console.log('Sirviendo archivos estáticos desde:', frontendBuildPath);
  app.use(express.static(frontendBuildPath));
}

// Ruta básica
app.get('/', (req, res) => {
  res.status(200).send('Servidor de correo electrónico funcionando correctamente (Nodemailer)');
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', systemRoutes);

// Middleware de logging para debugging
function logAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  console.log(`[AUTH] ${req.method} ${req.originalUrl}`);
  
  if (!authHeader) {
    console.warn(`[AUTH] ❌ No se encontró header Authorization en ${req.method} ${req.originalUrl}`);
  } else {
    console.log(`[AUTH] ✅ Header Authorization recibido en ${req.method} ${req.originalUrl}: ${authHeader.substring(0, 50)}...`);
  }
  next();
}

// Aplicar logging a rutas protegidas
app.use('/api/email', logAuth);
app.use('/api/contacts', logAuth);
app.use('/api/lists', logAuth);
app.use('/api/admin', logAuth);

// Ruta wildcard para manejar rutas del frontend
app.get('*', (req, res) => {
  // Solo para rutas que no empiezan con /api
  if (!req.path.startsWith('/api')) {
    if (fs.existsSync(path.join(frontendBuildPath, 'index.html'))) {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    } else {
      res.status(404).send('Frontend not built');
    }
  } else {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
});

// Función para inicializar servicios
export async function initializeServices(): Promise<{ success: boolean; error?: any }> {
  try {
    console.log('Inicializando servicios del servidor...');
    
    // Inicializar base de datos
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.warn('PostgreSQL no está disponible - el historial de emails no funcionará');
    }
    
    // Inicializar servicio de correo
    await initializeEmailServices();
    
    console.log('Inicialización de servicios completada');
    return { success: true };
  } catch (error) {
    console.error('Error general en la inicialización de servicios:', error);
    return { success: false, error };
  }
}

export default app;
