import { Router } from 'express';
import { ListController } from '@/controllers/listController';
import { ListService } from '@/services/listService';
import { authenticateToken } from '@/config/auth';

const router = Router();
const listService = new ListService();
const listController = new ListController(listService);

// Rutas para listas
router.get('/', authenticateToken, listController.getAllLists);
router.post('/', authenticateToken, listController.createList);
router.put('/:id', authenticateToken, listController.updateList);
router.delete('/:id', authenticateToken, listController.deleteList);

// Rutas para gestión de contactos en listas
router.post('/:listId/contacts', authenticateToken, listController.addContactToList);
router.delete('/:listId/contacts/:contactId', authenticateToken, listController.removeContactFromList);
router.get('/:listId/contacts', authenticateToken, listController.getListContacts);

// Rutas para importación/exportación
router.get('/export', listController.exportLists);
router.post('/import', authenticateToken, listController.importLists);

export default router;
