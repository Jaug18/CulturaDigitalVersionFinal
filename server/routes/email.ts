import { Router } from 'express';
import emailController from '@/controllers/emailController';
import { authenticateToken } from '@/config/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @swagger
 * /email/send:
 *   post:
 *     tags: [Email]
 *     summary: Enviar un correo electrónico
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailSendRequest'
 *     responses:
 *       200:
 *         description: Correo enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 emailId:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/send', emailController.sendEmail.bind(emailController));

/**
 * @swagger
 * /email/schedule:
 *   post:
 *     tags: [Email]
 *     summary: Programar el envío de un correo electrónico
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailScheduleRequest'
 *     responses:
 *       201:
 *         description: Correo programado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScheduledEmail'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/schedule', emailController.scheduleEmail.bind(emailController));

/**
 * @swagger
 * /email/scheduled:
 *   get:
 *     tags: [Email]
 *     summary: Obtener correos programados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de correos por página
 *     responses:
 *       200:
 *         description: Lista de correos programados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 emails:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ScheduledEmail'
 *                 total:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/scheduled', emailController.getScheduledEmails.bind(emailController));

/**
 * @swagger
 * /email/scheduled/{id}/cancel:
 *   patch:
 *     tags: [Email]
 *     summary: Cancelar un correo programado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del correo programado
 *     responses:
 *       200:
 *         description: Correo cancelado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/scheduled/:id/cancel', emailController.cancelScheduledEmail.bind(emailController));

/**
 * @swagger
 * /email/scheduled/{id}:
 *   put:
 *     tags: [Email]
 *     summary: Actualizar un correo programado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del correo programado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailScheduleRequest'
 *     responses:
 *       200:
 *         description: Correo programado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScheduledEmail'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/scheduled/:id', emailController.updateScheduledEmail.bind(emailController));

/**
 * @swagger
 * /email/history:
 *   get:
 *     tags: [Email]
 *     summary: Obtener historial de correos enviados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de correos por página
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del filtro
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del filtro
 *     responses:
 *       200:
 *         description: Historial de correos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 emails:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EmailHistory'
 *                 total:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/history', emailController.getEmailHistory.bind(emailController));

/**
 * @swagger
 * /email/status:
 *   get:
 *     tags: [Email]
 *     summary: Obtener estado del servicio de correo
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado del servicio de correo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [active, inactive, error]
 *                 lastCheck:
 *                   type: string
 *                   format: date-time
 *                 configuration:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/status', emailController.getStatus.bind(emailController));

export default router;
