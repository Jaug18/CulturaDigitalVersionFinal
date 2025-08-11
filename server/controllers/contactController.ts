import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse, CreateContactRequest, UpdateContactRequest } from '@/types';
import * as contactService from '@/services/contactService';

export class ContactController {
  /**
   * Obtener todos los contactos del usuario
   */
  async getContacts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const { search } = req.query;
      
      const result = await contactService.getContacts(req.user.id, search as string);
      
      res.json(result);
    } catch (error) {
      console.error('Error al obtener contactos:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener contactos' 
      });
    }
  }

  /**
   * Crear un nuevo contacto
   */
  async createContact(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const contactData: CreateContactRequest = req.body;
      
      const result = await contactService.createContact(contactData, req.user.id);
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Error al crear contacto:', error);
      res.status(500).json({
        success: false,
        error: 'Error en el servidor',
        message: `Error al crear contacto: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Actualizar un contacto
   */
  async updateContact(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const { id } = req.params;
      const updateData: UpdateContactRequest = req.body;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'ID requerido',
          message: 'El ID del contacto es requerido'
        });
        return;
      }
      
      const result = await contactService.updateContact(parseInt(id), updateData, req.user.id);
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error al actualizar contacto:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al actualizar contacto' 
      });
    }
  }

  /**
   * Eliminar un contacto
   */
  async deleteContact(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'ID requerido',
          message: 'El ID del contacto es requerido'
        });
        return;
      }
      
      const result = await contactService.deleteContact(parseInt(id), req.user.id);
      
      if (!result.success) {
        res.status(404).json(result);
        return;
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error al eliminar contacto:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al eliminar contacto' 
      });
    }
  }

  /**
   * Cambiar estado de un contacto
   */
  async updateContactStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const { id } = req.params;
      const { status } = req.body;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'ID requerido',
          message: 'El ID del contacto es requerido'
        });
        return;
      }
      
      if (!['active', 'inactive'].includes(status)) {
        res.status(400).json({ 
          success: false,
          error: 'Estado no válido' 
        });
        return;
      }
      
      const result = await contactService.updateContactStatus(parseInt(id), status, req.user.id);
      
      if (!result.success) {
        res.status(404).json(result);
        return;
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error al actualizar estado del contacto:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al actualizar estado del contacto' 
      });
    }
  }

  /**
   * Exportar contactos a CSV
   */
  async exportContacts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const { listId, status } = req.query;
      
      const csvContent = await contactService.exportContactsToCSV(
        req.user.id,
        listId as string,
        status as string
      );
      
      res.setHeader('Content-Disposition', 'attachment; filename=contactos.csv');
      res.setHeader('Content-Type', 'text/csv');
      res.send(csvContent);
    } catch (error) {
      console.error('Error al exportar contactos:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al exportar contactos' 
      });
    }
  }

  /**
   * Procesar archivo CSV subido
   */
  async uploadContacts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ 
          success: false,
          error: 'No se ha subido ningún archivo' 
        });
        return;
      }

      const result = await contactService.processContactsFile(req.file.path);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al procesar archivo de contactos:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al procesar el archivo' 
      });
    }
  }

  /**
   * Importar contactos desde el frontend
   */
  async importContacts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const { contacts } = req.body;
      
      if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
        res.status(400).json({ 
          success: false,
          error: 'No hay contactos para importar' 
        });
        return;
      }

      const result = await contactService.importContacts(contacts, req.user.id);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al importar contactos:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al importar contactos' 
      });
    }
  }
}

export default new ContactController();
