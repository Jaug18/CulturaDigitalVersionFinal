import { Router } from 'express';
import { ListController } from '@/controllers/listController';
import { ListService } from '@/services/listService';
import { authenticateToken } from '@/config/auth';

const router = Router();
const listService = new ListService();
const listController = new ListController(listService);

/**
 * @swagger
 * /lists:
 *   get:
 *     tags: [Lists]
 *     summary: Obtener todas las listas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las listas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/List'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', authenticateToken, listController.getAllLists);

/**
 * @swagger
 * /lists:
 *   post:
 *     tags: [Lists]
 *     summary: Crear una nueva lista
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ListInput'
 *     responses:
 *       201:
 *         description: Lista creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/List'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', authenticateToken, listController.createList);

/**
 * @swagger
 * /lists/{id}:
 *   put:
 *     tags: [Lists]
 *     summary: Actualizar una lista
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la lista
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ListInput'
 *     responses:
 *       200:
 *         description: Lista actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/List'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', authenticateToken, listController.updateList);

/**
 * @swagger
 * /lists/{id}:
 *   delete:
 *     tags: [Lists]
 *     summary: Eliminar una lista
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la lista
 *     responses:
 *       204:
 *         description: Lista eliminada exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', authenticateToken, listController.deleteList);

/**
 * @swagger
 * /lists/{listId}/contacts:
 *   post:
 *     tags: [Lists]
 *     summary: Agregar contacto a una lista
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la lista
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contactId:
 *                 type: integer
 *                 description: ID del contacto a agregar
 *     responses:
 *       200:
 *         description: Contacto agregado a la lista exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:listId/contacts', authenticateToken, listController.addContactToList);

/**
 * @swagger
 * /lists/{listId}/contacts/{contactId}:
 *   delete:
 *     tags: [Lists]
 *     summary: Remover contacto de una lista
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la lista
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del contacto
 *     responses:
 *       204:
 *         description: Contacto removido de la lista exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:listId/contacts/:contactId', authenticateToken, listController.removeContactFromList);

/**
 * @swagger
 * /lists/{listId}/contacts:
 *   get:
 *     tags: [Lists]
 *     summary: Obtener contactos de una lista
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la lista
 *     responses:
 *       200:
 *         description: Lista de contactos en la lista
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contact'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:listId/contacts', authenticateToken, listController.getListContacts);

/**
 * @swagger
 * /lists/export:
 *   get:
 *     tags: [Lists]
 *     summary: Exportar listas
 *     responses:
 *       200:
 *         description: Archivo con las listas exportadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/export', listController.exportLists);

/**
 * @swagger
 * /lists/import:
 *   post:
 *     tags: [Lists]
 *     summary: Importar listas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lists:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/ListInput'
 *     responses:
 *       201:
 *         description: Listas importadas exitosamente
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/import', authenticateToken, listController.importLists);

export default router;
