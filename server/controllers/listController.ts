import { Request, Response } from 'express';
import { ListService } from '@/services/listService';
import { AuthenticatedRequest } from '@/types/requests';
import { ApiError, handleAsyncError } from '@/utils/errors';

export class ListController {
  private listService: ListService;

  constructor(listService: ListService) {
    this.listService = listService;
  }

  getAllLists = handleAsyncError(async (req: AuthenticatedRequest, res: Response) => {
    const lists = await this.listService.getAllLists(req.user?.id);
    res.json(lists);
  });

  createList = handleAsyncError(async (req: AuthenticatedRequest, res: Response) => {
    const { name, description } = req.body;

    if (!name || typeof name !== 'string') {
      throw new ApiError('El nombre de la lista es requerido', 400);
    }

    if (!req.user?.id) {
      throw new ApiError('Usuario no autenticado', 401);
    }

    const newList = await this.listService.createList(
      name.trim(),
      description?.trim() || '',
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: 'Lista creada exitosamente',
      data: newList
    });
  });

  updateList = handleAsyncError(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || typeof name !== 'string') {
      throw new ApiError('El nombre de la lista es requerido', 400);
    }

    if (!id) {
      throw new ApiError('ID de lista requerido', 400);
    }

    const listId = parseInt(id);
    if (isNaN(listId)) {
      throw new ApiError('ID de lista inválido', 400);
    }

    const updatedList = await this.listService.updateList(
      listId,
      name.trim(),
      description?.trim() || ''
    );

    res.json({
      success: true,
      message: 'Lista actualizada exitosamente',
      data: updatedList
    });
  });

  deleteList = handleAsyncError(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!id) {
      throw new ApiError('ID de lista requerido', 400);
    }

    const listId = parseInt(id);
    if (isNaN(listId)) {
      throw new ApiError('ID de lista inválido', 400);
    }

    await this.listService.deleteList(listId);

    res.json({
      success: true,
      message: 'Lista eliminada exitosamente'
    });
  });

  addContactToList = handleAsyncError(async (req: AuthenticatedRequest, res: Response) => {
    const { listId } = req.params;
    const { contactId, contactIds } = req.body;

    if (!listId) {
      throw new ApiError('ID de lista requerido', 400);
    }

    const listIdNum = parseInt(listId);
    if (isNaN(listIdNum)) {
      throw new ApiError('ID de lista inválido', 400);
    }

    // Si se envía un array de contactIds, procesarlos en lote
    if (contactIds && Array.isArray(contactIds)) {
      const validContactIds = contactIds.filter(id => !isNaN(parseInt(id))).map(id => parseInt(id));
      
      if (validContactIds.length === 0) {
        throw new ApiError('No se encontraron IDs de contacto válidos', 400);
      }

      const result = await this.listService.addContactsToList(listIdNum, validContactIds);

      res.json({
        success: true,
        message: `${result.added} contactos agregados exitosamente a la lista`,
        data: {
          added: result.added,
          errors: result.errors
        }
      });
    } else if (contactId) {
      // Funcionalidad original para un solo contacto
      const contactIdNum = parseInt(contactId);
      if (isNaN(contactIdNum)) {
        throw new ApiError('ID de contacto inválido', 400);
      }

      await this.listService.addContactToList(listIdNum, contactIdNum);

      res.json({
        success: true,
        message: 'Contacto agregado a la lista exitosamente'
      });
    } else {
      throw new ApiError('Se requiere contactId o contactIds', 400);
    }
  });

  removeContactFromList = handleAsyncError(async (req: AuthenticatedRequest, res: Response) => {
    const { listId, contactId } = req.params;

    if (!listId || !contactId) {
      throw new ApiError('IDs de lista y contacto requeridos', 400);
    }

    const listIdNum = parseInt(listId);
    const contactIdNum = parseInt(contactId);

    if (isNaN(listIdNum) || isNaN(contactIdNum)) {
      throw new ApiError('IDs inválidos', 400);
    }

    await this.listService.removeContactFromList(listIdNum, contactIdNum);

    res.json({
      success: true,
      message: 'Contacto eliminado de la lista exitosamente'
    });
  });

  getListContacts = handleAsyncError(async (req: AuthenticatedRequest, res: Response) => {
    const { listId } = req.params;

    if (!listId) {
      throw new ApiError('ID de lista requerido', 400);
    }

    const listIdNum = parseInt(listId);
    if (isNaN(listIdNum)) {
      throw new ApiError('ID de lista inválido', 400);
    }

    const contacts = await this.listService.getListContacts(listIdNum);

    res.json({
      success: true,
      data: contacts
    });
  });

  exportLists = handleAsyncError(async (req: Request, res: Response) => {
    const csvData = await this.listService.exportListsToCSV();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=listas.csv');
    res.send(csvData);
  });

  importLists = handleAsyncError(async (req: AuthenticatedRequest, res: Response) => {
    const { lists } = req.body;

    if (!Array.isArray(lists)) {
      throw new ApiError('Se requiere un array de listas', 400);
    }

    if (!req.user?.id) {
      throw new ApiError('Usuario no autenticado', 401);
    }

    const result = await this.listService.importListsFromData(lists, req.user.id);

    res.json({
      success: true,
      message: `Importación completada. ${result.success} listas importadas.`,
      data: {
        imported: result.success,
        errors: result.errors
      }
    });
  });
}
