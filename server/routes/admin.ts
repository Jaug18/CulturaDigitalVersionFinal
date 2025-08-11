import { Router } from 'express';
import { AdminController } from '@/controllers/adminController';
import { AdminService } from '@/services/adminService';
import { authenticateToken, authorizeRoles } from '@/config/auth';

const router = Router();
const adminService = new AdminService();
const adminController = new AdminController(adminService);

// Middleware para todas las rutas de admin
router.use(authenticateToken, authorizeRoles(['admin']));

// Rutas de administración de usuarios
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.patch('/users/:id', adminController.patchUser);
router.delete('/users/:id', adminController.deleteUser);

// Ruta para estadísticas del sistema
router.get('/stats', adminController.getStats);

export default router;
