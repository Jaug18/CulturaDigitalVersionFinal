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
  /**
   * Detectar el delimitador del archivo CSV
   */
  private detectDelimiter(filePath: string): Promise<string> {
    return new Promise((resolve) => {
      const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
      let firstLine = '';
      let bytesRead = 0;
      const maxBytes = 1024; // Leer solo los primeros 1KB para detectar el delimitador

      stream.on('data', (chunk: string | Buffer) => {
        const chunkStr = chunk.toString();
        bytesRead += chunkStr.length;
        firstLine += chunkStr;
        
        // Si hemos leído suficiente o encontramos un salto de línea
        if (bytesRead >= maxBytes || firstLine.includes('\n')) {
          stream.destroy();
          
          // Tomar solo la primera línea
          const lines = firstLine.split('\n');
          const line = lines[0];
          
          if (!line) {
            console.log('No se pudo leer la primera línea, usando coma por defecto');
            resolve(',');
            return;
          }
          
          console.log('Primera línea para detectar delimitador (listas):', line);
          
          // Contar ocurrencias de posibles delimitadores
          const commaCount = (line.match(/,/g) || []).length;
          const semicolonCount = (line.match(/;/g) || []).length;
          
          console.log('Conteo de delimitadores (listas) - comas:', commaCount, 'punto y coma:', semicolonCount);
          
          // Usar el delimitador que más aparezca
          if (semicolonCount > commaCount) {
            console.log('Delimitador detectado (listas): punto y coma (;)');
            resolve(';');
          } else {
            console.log('Delimitador detectado (listas): coma (,)');
            resolve(',');
          }
        }
      });

      stream.on('error', () => {
        console.log('Error al detectar delimitador (listas), usando coma por defecto');
        resolve(',');
      });

      stream.on('end', () => {
        // Si llegamos al final sin suficientes datos, usar coma por defecto
        console.log('Fin de archivo alcanzado (listas), usando coma por defecto');
        resolve(',');
      });
    });
  }

  async parseCSVFile(filePath: string): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      const results: any[] = [];
      
      if (!fs.existsSync(filePath)) {
        reject(new ApiError('Archivo no encontrado', 404));
        return;
      }

      try {
        // Detectar el delimitador automáticamente
        const delimiter = await this.detectDelimiter(filePath);
        console.log('Usando delimitador para listas:', delimiter);

        fs.createReadStream(filePath)
          .pipe(csv({ separator: delimiter }))
          .on('data', (data) => {
            console.log('Fila de lista procesada:', data);
            results.push(data);
          })
          .on('end', () => {
            console.log('Total de listas procesadas:', results.length);
            
            // Limpiar el archivo temporal
            fs.unlink(filePath, (err) => {
              if (err) console.error('Error al eliminar archivo temporal:', err);
            });
            resolve(results);
          })
          .on('error', (error) => {
            console.error('Error al procesar CSV de listas:', error);
            
            // Limpiar el archivo temporal en caso de error
            fs.unlink(filePath, (err) => {
              if (err) console.error('Error al eliminar archivo temporal:', err);
            });
            reject(new ApiError('Error al procesar el archivo CSV', 400));
          });
      } catch (error) {
        console.error('Error al detectar delimitador (listas):', error);
        reject(new ApiError('Error al procesar el archivo CSV', 400));
      }
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
