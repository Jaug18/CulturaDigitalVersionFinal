import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse, EmailSendRequest, EmailScheduleRequest } from '@/types';
import * as emailService from '@/services/emailService';

export class EmailController {
  /**
   * Envío inmediato de correo
   */
  async sendEmail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const emailData: EmailSendRequest = req.body;
      
      const result = await emailService.sendEmail(emailData, req.user.id);
      
      res.header('Access-Control-Allow-Origin', '*');
      
      if (!result.success) {
        res.status(500).json(result);
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al enviar correo:', error);
      res.header('Access-Control-Allow-Origin', '*');
      res.status(500).json({
        success: false,
        message: `Error al enviar el correo: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  /**
   * Programar correo para envío futuro
   */
  async scheduleEmail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const emailData: EmailScheduleRequest = req.body;
      
      const result = await emailService.scheduleEmail(emailData, req.user.id);
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Error al programar correo:', error);
      res.status(500).json({
        success: false,
        message: `Error al programar el correo: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  /**
   * Obtener correos programados
   */
  async getScheduledEmails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const { status, page = '1', limit = '20' } = req.query;
      
      const result = await emailService.getScheduledEmails(
        req.user.id,
        {
          status: status as string,
          page: page as string,
          limit: limit as string
        }
      );
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al obtener correos programados:', error);
      res.status(500).json({
        success: false,
        error: 'Error en el servidor',
        message: `Error al obtener correos programados: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Cancelar correo programado
   */
  async cancelScheduledEmail(req: AuthenticatedRequest, res: Response): Promise<void> {
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
          message: 'El ID del correo programado es requerido'
        });
        return;
      }
      
      const result = await emailService.cancelScheduledEmail(parseInt(id), req.user.id);
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al cancelar correo programado:', error);
      res.status(500).json({
        success: false,
        error: 'Error en el servidor',
        message: `Error al cancelar correo programado: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Editar correo programado
   */
  async updateScheduledEmail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const { id } = req.params;
      const updateData = req.body;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'ID requerido',
          message: 'El ID del correo programado es requerido'
        });
        return;
      }
      
      const result = await emailService.updateScheduledEmail(parseInt(id), updateData, req.user.id);
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al editar correo programado:', error);
      res.status(500).json({
        success: false,
        error: 'Error en el servidor',
        message: `Error al editar correo programado: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Obtener historial de correos enviados
   */
  async getEmailHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const { page = '1', limit = '20' } = req.query;
      
      const result = await emailService.getEmailHistory(
        req.user.id,
        {
          page: page as string,
          limit: limit as string
        }
      );
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al obtener historial de emails:', error);
      res.status(500).json({
        success: false,
        message: `Error al obtener historial de emails: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'database_error'
      });
    }
  }

  /**
   * Obtener estado de los servicios
   */
  async getStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await emailService.getServicesStatus();
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al obtener estado de servicios:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estado de servicios'
      });
    }
  }
}

export default new EmailController();
