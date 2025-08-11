import { pool } from '@/config/database';
import { ApiError } from '@/utils/errors';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

export interface FileUploadResult {
  success: boolean;
  data?: any[];
  error?: string;
}

export interface SystemStatus {
  status: string;
  database: string;
  timestamp: string;
  uptime: string;
}

export class FileService {
  async parseCSVFile(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      
      if (!fs.existsSync(filePath)) {
        reject(new ApiError('Archivo no encontrado', 404));
        return;
      }

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          // Limpiar el archivo temporal
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error al eliminar archivo temporal:', err);
          });
          resolve(results);
        })
        .on('error', (error) => {
          // Limpiar el archivo temporal en caso de error
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error al eliminar archivo temporal:', err);
          });
          reject(new ApiError('Error al procesar el archivo CSV', 400));
        });
    });
  }

  validateCSVData(data: any[], requiredFields: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!Array.isArray(data) || data.length === 0) {
      errors.push('El archivo está vacío o no contiene datos válidos');
      return { valid: false, errors };
    }

    // Verificar que las columnas requeridas estén presentes
    const firstRow = data[0];
    const availableFields = Object.keys(firstRow);
    
    for (const field of requiredFields) {
      if (!availableFields.includes(field)) {
        errors.push(`Columna requerida faltante: ${field}`);
      }
    }

    // Validar que cada fila tenga los campos requeridos
    data.forEach((row, index) => {
      for (const field of requiredFields) {
        if (!row[field] || typeof row[field] !== 'string' || row[field].trim() === '') {
          errors.push(`Fila ${index + 1}: Campo "${field}" está vacío o es inválido`);
        }
      }
    });

    return { valid: errors.length === 0, errors };
  }

  async getSystemStatus(): Promise<SystemStatus> {
    try {
      // Verificar conexión a la base de datos
      let databaseStatus = 'disconnected';
      try {
        await pool.query('SELECT 1');
        databaseStatus = 'connected';
      } catch (error) {
        console.error('Error de conexión a la base de datos:', error);
      }

      // Calcular tiempo de actividad del proceso
      const uptimeSeconds = process.uptime();
      const hours = Math.floor(uptimeSeconds / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);
      const seconds = Math.floor(uptimeSeconds % 60);
      const uptime = `${hours}h ${minutes}m ${seconds}s`;

      return {
        status: databaseStatus === 'connected' ? 'healthy' : 'unhealthy',
        database: databaseStatus,
        timestamp: new Date().toISOString(),
        uptime
      };
    } catch (error) {
      console.error('Error al obtener estado del sistema:', error);
      throw new ApiError('Error al obtener el estado del sistema', 500);
    }
  }

  ensureUploadsDirectory(): string {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    return uploadsDir;
  }

  cleanupTempFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error al limpiar archivo temporal:', error);
    }
  }
}
