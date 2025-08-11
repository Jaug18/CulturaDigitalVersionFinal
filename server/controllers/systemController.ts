import { Request, Response } from 'express';
import { FileService } from '@/services/fileService';
import * as contactService from '@/services/contactService';
import { ListService } from '@/services/listService';
import { AuthenticatedRequest } from '@/types/requests';
import { ApiError, handleAsyncError } from '@/utils/errors';
import multer from 'multer';
import path from 'path';

// Configuración de multer para upload de archivos
const fileService = new FileService();
const upload = multer({
  dest: fileService.ensureUploadsDirectory(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB límite
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV') as any, false);
    }
  }
});

export class SystemController {
  private fileService: FileService;
  private listService: ListService;

  constructor(
    fileService: FileService,
    listService: ListService
  ) {
    this.fileService = fileService;
    this.listService = listService;
  }

  getSystemStatus = handleAsyncError(async (req: Request, res: Response) => {
    const status = await this.fileService.getSystemStatus();
    res.json(status);
  });

  // Middleware para upload de archivos CSV
  uploadMiddleware = upload.single('file');

  uploadContactsFile = handleAsyncError(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ApiError('No se ha subido ningún archivo', 400);
    }

    try {
      const csvData = await this.fileService.parseCSVFile(req.file.path);
      
      // Validar estructura del CSV para contactos
      const validation = this.fileService.validateCSVData(csvData, ['email']);
      
      if (!validation.valid) {
        throw new ApiError(`Archivo CSV inválido: ${validation.errors.join(', ')}`, 400);
      }

      res.json({
        success: true,
        message: 'Archivo procesado exitosamente',
        data: csvData,
        preview: csvData.slice(0, 5) // Mostrar solo los primeros 5 registros como preview
      });
    } catch (error) {
      // Limpiar archivo en caso de error
      this.fileService.cleanupTempFile(req.file.path);
      throw error;
    }
  });

  importContacts = handleAsyncError(async (req: AuthenticatedRequest, res: Response) => {
    const { contacts } = req.body;

    if (!Array.isArray(contacts)) {
      throw new ApiError('Se requiere un array de contactos', 400);
    }

    if (!req.user?.id) {
      throw new ApiError('Usuario no autenticado', 401);
    }

    const result = await contactService.importContacts(contacts, req.user.id);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      throw new ApiError(result.message || 'Error al importar contactos', 400);
    }
  });

  uploadListsFile = handleAsyncError(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ApiError('No se ha subido ningún archivo', 400);
    }

    try {
      const csvData = await this.fileService.parseCSVFile(req.file.path);
      
      // Validar estructura del CSV para listas
      const validation = this.fileService.validateCSVData(csvData, ['name']);
      
      if (!validation.valid) {
        throw new ApiError(`Archivo CSV inválido: ${validation.errors.join(', ')}`, 400);
      }

      res.json({
        success: true,
        message: 'Archivo procesado exitosamente',
        data: csvData,
        preview: csvData.slice(0, 5) // Mostrar solo los primeros 5 registros como preview
      });
    } catch (error) {
      // Limpiar archivo en caso de error
      this.fileService.cleanupTempFile(req.file.path);
      throw error;
    }
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
