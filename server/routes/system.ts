import { Router } from 'express';
import { SystemController } from '@/controllers/systemController';
import { FileService } from '@/services/fileService';
import { ListService } from '@/services/listService';
import { authenticateToken } from '@/config/auth';

const router = Router();
const fileService = new FileService();
const listService = new ListService();
const systemController = new SystemController(fileService, listService);

/**
 * @swagger
 * /system/status:
 *   get:
 *     tags: [System]
 *     summary: Obtener estado del sistema
 *     responses:
 *       200:
 *         description: Estado del sistema
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SystemStatus'
 */
router.get('/status', systemController.getSystemStatus);

/**
 * @swagger
 * /system/contacts/upload:
 *   post:
 *     tags: [System]
 *     summary: Subir archivo de contactos al sistema
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de contactos (CSV o Excel)
 *     responses:
 *       200:
 *         description: Archivo subido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 fileId:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 */
router.post('/contacts/upload', systemController.uploadMiddleware, systemController.uploadContactsFile);

/**
 * @swagger
 * /system/contacts/import:
 *   post:
 *     tags: [System]
 *     summary: Importar contactos al sistema
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileId:
 *                 type: string
 *                 description: ID del archivo subido
 *               options:
 *                 type: object
 *                 description: Opciones de importación
 *     responses:
 *       200:
 *         description: Contactos importados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 imported:
 *                   type: integer
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/contacts/import', authenticateToken, systemController.importContacts);

/**
 * @swagger
 * /system/lists/upload:
 *   post:
 *     tags: [System]
 *     summary: Subir archivo de listas al sistema
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de listas (CSV o Excel)
 *     responses:
 *       200:
 *         description: Archivo subido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 fileId:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 */
router.post('/lists/upload', systemController.uploadMiddleware, systemController.uploadListsFile);

/**
 * @swagger
 * /system/lists/import:
 *   post:
 *     tags: [System]
 *     summary: Importar listas al sistema
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileId:
 *                 type: string
 *                 description: ID del archivo subido
 *               options:
 *                 type: object
 *                 description: Opciones de importación
 *     responses:
 *       200:
 *         description: Listas importadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 imported:
 *                   type: integer
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/lists/import', authenticateToken, systemController.importLists);

export default router;
