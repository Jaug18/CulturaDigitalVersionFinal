import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cultura Digital API',
      version: '1.0.0',
      description: 'API para el sistema de correo electrónico y gestión de contactos de Cultura Digital',
      contact: {
        name: 'Cultura Digital Team',
        email: 'cultura.digital@ejemplo.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
      {
        url: 'https://your-backend-name.onrender.com',
        description: 'Servidor de producción',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'usuario123' },
            email: { type: 'string', example: 'usuario@ejemplo.com' },
            fullName: { type: 'string', example: 'Juan Pérez' },
            role: { type: 'string', example: 'user' },
            emailVerified: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Contact: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'María García' },
            email: { type: 'string', example: 'maria@ejemplo.com' },
            phone: { type: 'string', example: '+57 300 123 4567' },
            company: { type: 'string', example: 'Empresa ABC' },
            position: { type: 'string', example: 'Gerente' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        List: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Lista de Marketing' },
            description: { type: 'string', example: 'Contactos para campañas de marketing' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            contactCount: { type: 'integer', example: 150 },
          },
        },
        Email: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            subject: { type: 'string', example: 'Bienvenido a Cultura Digital' },
            content: { type: 'string', example: 'Contenido del correo...' },
            template: { type: 'string', example: 'template1' },
            status: { type: 'string', enum: ['sent', 'pending', 'failed'], example: 'sent' },
            sentAt: { type: 'string', format: 'date-time' },
            recipients: { type: 'array', items: { type: 'string' } },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            errors: { type: 'array', items: { type: 'string' } },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully' },
          },
        },
        // Esquemas de entrada (Input)
        UserRegisterRequest: {
          type: 'object',
          required: ['username', 'email', 'password', 'fullName'],
          properties: {
            username: { type: 'string', example: 'usuario123' },
            email: { type: 'string', format: 'email', example: 'usuario@ejemplo.com' },
            password: { type: 'string', minLength: 6, example: 'password123' },
            fullName: { type: 'string', example: 'Juan Pérez' },
          },
        },
        UserLoginRequest: {
          type: 'object',
          required: ['login', 'password'],
          properties: {
            login: { type: 'string', example: 'usuario123', description: 'Username o email' },
            password: { type: 'string', example: 'password123' },
          },
        },
        UserCreateRequest: {
          type: 'object',
          required: ['username', 'email', 'password', 'fullName', 'role'],
          properties: {
            username: { type: 'string', example: 'nuevo_usuario' },
            email: { type: 'string', format: 'email', example: 'nuevo@ejemplo.com' },
            password: { type: 'string', minLength: 6, example: 'password123' },
            fullName: { type: 'string', example: 'Nuevo Usuario' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          },
        },
        UserUpdateRequest: {
          type: 'object',
          required: ['username', 'email', 'fullName'],
          properties: {
            username: { type: 'string', example: 'usuario_actualizado' },
            email: { type: 'string', format: 'email', example: 'actualizado@ejemplo.com' },
            fullName: { type: 'string', example: 'Usuario Actualizado' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          },
        },
        UserPatchRequest: {
          type: 'object',
          properties: {
            username: { type: 'string', example: 'usuario_parcial' },
            email: { type: 'string', format: 'email', example: 'parcial@ejemplo.com' },
            fullName: { type: 'string', example: 'Usuario Parcial' },
            role: { type: 'string', enum: ['user', 'admin'] },
            emailVerified: { type: 'boolean' },
          },
        },
        ContactInput: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { type: 'string', example: 'María García' },
            email: { type: 'string', format: 'email', example: 'maria@ejemplo.com' },
            phone: { type: 'string', example: '+57 300 123 4567' },
            company: { type: 'string', example: 'Empresa ABC' },
            position: { type: 'string', example: 'Gerente' },
            isActive: { type: 'boolean', example: true },
          },
        },
        ListInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Lista de Marketing' },
            description: { type: 'string', example: 'Contactos para campañas de marketing' },
            isActive: { type: 'boolean', example: true },
          },
        },
        EmailSendRequest: {
          type: 'object',
          required: ['subject', 'content', 'recipients'],
          properties: {
            subject: { type: 'string', example: 'Bienvenido a Cultura Digital' },
            content: { type: 'string', example: 'Contenido del correo electrónico...' },
            template: { type: 'string', example: 'template1' },
            recipients: { 
              type: 'array', 
              items: { type: 'string', format: 'email' },
              example: ['destinatario1@ejemplo.com', 'destinatario2@ejemplo.com']
            },
            listIds: {
              type: 'array',
              items: { type: 'integer' },
              example: [1, 2, 3]
            },
          },
        },
        EmailScheduleRequest: {
          type: 'object',
          required: ['subject', 'content', 'recipients', 'scheduledDate'],
          properties: {
            subject: { type: 'string', example: 'Correo programado' },
            content: { type: 'string', example: 'Contenido del correo programado...' },
            template: { type: 'string', example: 'template1' },
            recipients: { 
              type: 'array', 
              items: { type: 'string', format: 'email' },
              example: ['destinatario@ejemplo.com']
            },
            listIds: {
              type: 'array',
              items: { type: 'integer' },
              example: [1, 2]
            },
            scheduledDate: { 
              type: 'string', 
              format: 'date-time',
              example: '2024-12-25T10:00:00Z'
            },
          },
        },
        ScheduledEmail: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            subject: { type: 'string', example: 'Correo programado' },
            content: { type: 'string', example: 'Contenido...' },
            template: { type: 'string', example: 'template1' },
            recipients: { type: 'array', items: { type: 'string' } },
            scheduledDate: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['pending', 'sent', 'cancelled'], example: 'pending' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        EmailHistory: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            subject: { type: 'string', example: 'Correo enviado' },
            recipients: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', enum: ['sent', 'failed'], example: 'sent' },
            sentAt: { type: 'string', format: 'date-time' },
            template: { type: 'string', example: 'template1' },
          },
        },
        SystemStats: {
          type: 'object',
          properties: {
            totalUsers: { type: 'integer', example: 50 },
            totalContacts: { type: 'integer', example: 1250 },
            totalLists: { type: 'integer', example: 25 },
            emailsSentToday: { type: 'integer', example: 45 },
            emailsSentThisMonth: { type: 'integer', example: 1200 },
            systemUptime: { type: 'string', example: '5 days, 3 hours' },
          },
        },
        SystemStatus: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['healthy', 'warning', 'error'], example: 'healthy' },
            timestamp: { type: 'string', format: 'date-time' },
            version: { type: 'string', example: '1.0.0' },
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['connected', 'disconnected'] },
                connectionTime: { type: 'number', example: 25.5 }
              }
            },
            email: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['active', 'inactive', 'error'] },
                lastCheck: { type: 'string', format: 'date-time' }
              }
            },
          },
        },
        ContactsResponse: {
          type: 'object',
          properties: {
            contacts: {
              type: 'array',
              items: { $ref: '#/components/schemas/Contact' }
            },
            total: { type: 'integer', example: 100 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
          },
        },
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email', example: 'usuario@ejemplo.com' },
          },
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['code', 'newPassword'],
          properties: {
            code: { type: 'string', example: '123456' },
            newPassword: { type: 'string', minLength: 6, example: 'nuevaPassword123' },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acceso faltante o inválido',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Token no válido o no proporcionado' },
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Acceso denegado - permisos insuficientes',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Acceso denegado' },
                },
              },
            },
          },
        },
        BadRequestError: {
          description: 'Solicitud incorrecta',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
            },
          },
        },
        NotFoundError: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Recurso no encontrado' },
                },
              },
            },
          },
        },
        InternalServerError: {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Error interno del servidor' },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints para autenticación y manejo de usuarios',
      },
      {
        name: 'Contacts',
        description: 'Gestión de contactos',
      },
      {
        name: 'Lists',
        description: 'Gestión de listas de contactos',
      },
      {
        name: 'Email',
        description: 'Envío y gestión de correos electrónicos',
      },
      {
        name: 'Admin',
        description: 'Funciones administrativas',
      },
      {
        name: 'System',
        description: 'Información del sistema y salud del servidor',
      },
    ],
  },
  apis: [
    './routes/*.ts',
    './controllers/*.ts',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
