import { Router } from 'express';
import authController from '@/controllers/authController';
import { authenticateToken } from '@/config/auth';

const router = Router();

// Rutas de autenticación (sin middleware)
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/forgot-password', authController.forgotPassword.bind(authController));
router.get('/verify-reset-token/:token', authController.verifyResetToken.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));

// Rutas que requieren autenticación
router.get('/me', authenticateToken, authController.me.bind(authController));
router.post('/logout', authenticateToken, authController.logout.bind(authController));

export default router;
