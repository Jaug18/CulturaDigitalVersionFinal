import { Router } from 'express';
import { SystemController } from '@/controllers/systemController';
import { FileService } from '@/services/fileService';
import { ListService } from '@/services/listService';
import { authenticateToken } from '@/config/auth';

const router = Router();
const fileService = new FileService();
const listService = new ListService();
const systemController = new SystemController(fileService, listService);

// Ruta de estado del sistema
router.get('/status', systemController.getSystemStatus);

// Rutas para upload e importación de contactos
router.post('/contacts/upload', systemController.uploadMiddleware, systemController.uploadContactsFile);
router.post('/contacts/import', authenticateToken, systemController.importContacts);

// Rutas para upload e importación de listas
router.post('/lists/upload', systemController.uploadMiddleware, systemController.uploadListsFile);
router.post('/lists/import', authenticateToken, systemController.importLists);

export default router;
