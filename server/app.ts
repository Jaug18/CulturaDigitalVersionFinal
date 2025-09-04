import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@/config/swagger';

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
  'http://localhost:7001',
  'http://localhost:7002'
];

app.use(cors({
  origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Para solicitudes sin origen (como herramientas API)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`Origin ${origin} not allowed by CORS policy. Allowed origins:`, allowedOrigins);
      // En desarrollo, permitir cualquier origen
      if (process.env.NODE_ENV !== 'production') {
        console.log('Development mode: allowing origin', origin);
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

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

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Cultura Digital API Documentation'
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
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
