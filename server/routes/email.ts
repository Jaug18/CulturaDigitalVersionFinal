import { Router } from 'express';
import emailController from '@/controllers/emailController';
import { authenticateToken } from '@/config/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de correo
router.post('/send', emailController.sendEmail.bind(emailController));
router.post('/schedule', emailController.scheduleEmail.bind(emailController));
router.get('/scheduled', emailController.getScheduledEmails.bind(emailController));
router.patch('/scheduled/:id/cancel', emailController.cancelScheduledEmail.bind(emailController));
router.put('/scheduled/:id', emailController.updateScheduledEmail.bind(emailController));
router.get('/history', emailController.getEmailHistory.bind(emailController));
router.get('/status', emailController.getStatus.bind(emailController));

export default router;
