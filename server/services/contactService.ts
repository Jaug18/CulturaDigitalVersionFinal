import fs from 'fs';
import csv from 'csv-parser';
import { pool } from '@/config/database';
import { Contact, ApiResponse, CreateContactRequest, UpdateContactRequest } from '@/types';

/**
 * Obtener contactos del usuario
 */
export async function getContacts(userId: number, search?: string): Promise<Contact[]> {
  try {
    let query = 'SELECT * FROM contacts WHERE user_id = $1';
    const values: any[] = [userId];
    
    if (search) {
      query += ' AND (name ILIKE $2 OR email ILIKE $2)';
      values.push(`%${search}%`);
    }
    
    query += ' ORDER BY name ASC';
    
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Error al obtener contactos:', error);
    throw error;
  }
}

/**
 * Crear nuevo contacto
 */
export async function createContact(contactData: CreateContactRequest, userId: number): Promise<ApiResponse> {
  try {
    const { name, email, status } = contactData;
    
    // Verificar si el contacto ya existe para este usuario
    const existingContact = await pool.query(
      `SELECT * FROM contacts WHERE email = $1 AND user_id = $2`,
      [email, userId]
    );
    
    if (existingContact.rows.length > 0) {
      return {
        success: false,
        error: 'Contacto duplicado',
        message: 'Ya existe un contacto con ese email'
      };
    }
    
    // Crear el contacto
    const result = await pool.query(
      `INSERT INTO contacts (name, email, status, user_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, email, status || 'active', userId]
    );
    
    return {
      success: true,
      data: result.rows[0]
    };
  } catch (error) {
    console.error('Error al crear contacto:', error);
    return {
      success: false,
      error: 'Error en el servidor',
      message: `Error al crear contacto: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Actualizar contacto
 */
export async function updateContact(id: number, updateData: UpdateContactRequest, userId: number): Promise<ApiResponse> {
  try {
    const { name, email } = updateData;
    
    if (!name || !email) {
      return {
        success: false,
        error: 'Datos incompletos',
        message: 'Nombre y email son requeridos'
      };
    }
    
    // Verificar si el email ya existe (y no es del mismo contacto)
    const checkEmail = await pool.query(
      'SELECT id FROM contacts WHERE email = $1 AND id != $2 AND user_id = $3', 
      [email, id, userId]
    );
    
    if (checkEmail.rows.length > 0) {
      return {
        success: false,
        error: 'Email duplicado',
        message: 'El email ya está registrado por otro contacto'
      };
    }
    
    const result = await pool.query(
      'UPDATE contacts SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING *',
      [name, email, id, userId]
    );
    
    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'No encontrado',
        message: 'Contacto no encontrado o no tienes permisos para editarlo'
      };
    }
    
    return {
      success: true,
      data: result.rows[0]
    };
  } catch (error) {
    console.error('Error al actualizar contacto:', error);
    return {
      success: false,
      error: 'Error en el servidor',
      message: 'Error al actualizar contacto'
    };
  }
}

/**
 * Eliminar contacto
 */
export async function deleteContact(id: number, userId: number): Promise<ApiResponse> {
  try {
    const result = await pool.query(
      'DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING id', 
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'No encontrado',
        message: 'Contacto no encontrado o no tienes permisos para eliminarlo'
      };
    }
    
    return {
      success: true,
      message: 'Contacto eliminado correctamente'
    };
  } catch (error) {
    console.error('Error al eliminar contacto:', error);
    return {
      success: false,
      error: 'Error en el servidor',
      message: 'Error al eliminar contacto'
    };
  }
}

/**
 * Actualizar estado de contacto
 */
export async function updateContactStatus(id: number, status: string, userId: number): Promise<ApiResponse> {
  try {
    const result = await pool.query(
      'UPDATE contacts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
      [status, id, userId]
    );
    
    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'No encontrado',
        message: 'Contacto no encontrado o no tienes permisos para editarlo'
      };
    }
    
    return {
      success: true,
      data: result.rows[0]
    };
  } catch (error) {
    console.error('Error al actualizar estado del contacto:', error);
    return {
      success: false,
      error: 'Error en el servidor',
      message: 'Error al actualizar estado del contacto'
    };
  }
}

/**
 * Exportar contactos a CSV
 */
export async function exportContactsToCSV(userId: number, listId?: string, status?: string): Promise<string> {
  try {
    let query = 'SELECT id, name, email, status FROM contacts WHERE user_id = $1';
    const params: any[] = [userId];
    let paramCount = 2;
    
    // Si se proporciona un ID de lista, obtener solo los contactos de esa lista
    if (listId) {
      query = `
        SELECT c.id, c.name, c.email, c.status
        FROM contacts c
        JOIN list_contacts lc ON c.id = lc.contact_id
        WHERE lc.list_id = $${paramCount} AND c.user_id = $1
      `;
      params.push(listId);
      paramCount++;
    }
    
    // Si se proporciona un estado, filtrar por él
    if (status && ['active', 'inactive'].includes(status)) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }
    
    query += ' ORDER BY name ASC';
    
    const result = await pool.query(query, params);
    
    // Crear el contenido CSV
    const csvHeader = 'ID,Nombre,Email,Estado\n';
    const csvRows = result.rows.map(contact => {
      return `${contact.id},"${contact.name}","${contact.email}","${contact.status}"`;
    }).join('\n');
    
    return csvHeader + csvRows;
  } catch (error) {
    console.error('Error al exportar contactos:', error);
    throw error;
  }
}

/**
 * Detectar el delimitador del archivo CSV
 */
function detectDelimiter(filePath: string): Promise<string> {
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
        
        console.log('Primera línea para detectar delimitador:', line);
        
        // Contar ocurrencias de posibles delimitadores
        const commaCount = (line.match(/,/g) || []).length;
        const semicolonCount = (line.match(/;/g) || []).length;
        
        console.log('Conteo de delimitadores - comas:', commaCount, 'punto y coma:', semicolonCount);
        
        // Usar el delimitador que más aparezca
        if (semicolonCount > commaCount) {
          console.log('Delimitador detectado: punto y coma (;)');
          resolve(';');
        } else {
          console.log('Delimitador detectado: coma (,)');
          resolve(',');
        }
      }
    });

    stream.on('error', () => {
      console.log('Error al detectar delimitador, usando coma por defecto');
      resolve(',');
    });

    stream.on('end', () => {
      // Si llegamos al final sin suficientes datos, usar coma por defecto
      console.log('Fin de archivo alcanzado, usando coma por defecto');
      resolve(',');
    });
  });
}

/**
 * Procesar archivo CSV de contactos
 */
export async function processContactsFile(filePath: string): Promise<ApiResponse> {
  return new Promise(async (resolve) => {
    const results: any[] = [];
    let headers: string[] = [];

    console.log('=== PROCESANDO ARCHIVO CSV ===');
    console.log('Ruta del archivo:', filePath);

    try {
      // Detectar el delimitador automáticamente
      const delimiter = await detectDelimiter(filePath);
      console.log('Usando delimitador:', delimiter);

      fs.createReadStream(filePath)
        .pipe(csv({ 
          separator: delimiter,
          mapHeaders: ({ header }) => header.trim().toLowerCase() 
        }))
        .on('headers', (csvHeaders: string[]) => {
          headers = csvHeaders.map((h: string) => h.trim().toLowerCase());
          console.log('Headers detectados:', headers);
        })
        .on('data', (data) => {
          console.log('Fila procesada:', data);
          
          // Soportar tanto encabezados en español como en inglés
          const name = data.nombre || data.name;
          const email = data.email;
          const status = (data.estado || data.status || '').toLowerCase();

          console.log('Campos extraídos:', { name, email, status });

          if (name && email) {
            const contact = {
              name: name.trim(),
              email: email.trim(),
              status: status === 'inactive' || status === 'inactivo' ? 'inactive' : 'active'
            };
            console.log('Contacto agregado:', contact);
            results.push(contact);
          } else {
            console.log('Contacto omitido por datos faltantes:', { name, email });
          }
        })
        .on('end', () => {
          console.log('=== PROCESAMIENTO COMPLETADO ===');
          console.log('Total de contactos procesados:', results.length);
          console.log('Contactos:', results);
          
          // Eliminar el archivo temporal
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error al eliminar archivo temporal:', err);
          });

          resolve({
            success: true,
            data: {
              contacts: results,
              totalFound: results.length
            }
          });
        })
        .on('error', (error) => {
          console.error('Error al procesar CSV:', error);
          resolve({
            success: false,
            error: 'Error al procesar el archivo'
          });
        });
    } catch (error) {
      console.error('Error al detectar delimitador:', error);
      resolve({
        success: false,
        error: 'Error al procesar el archivo'
      });
    }
  });
}

/**
 * Importar contactos
 */
export async function importContacts(contacts: CreateContactRequest[], userId: number): Promise<ApiResponse> {
  try {
    await pool.query('BEGIN');

    const insertedContacts: any[] = [];
    const errors: any[] = [];
    
    for (const contact of contacts) {
      try {
        // Validar campos requeridos
        if (!contact.name || !contact.email) {
          errors.push({ contact, error: 'Faltan campos requeridos (nombre o email)' });
          continue;
        }

        // Verificar si el contacto ya existe para este usuario
        const existing = await pool.query(
          'SELECT id FROM contacts WHERE email = $1 AND user_id = $2',
          [contact.email, userId]
        );
        
        if (existing.rows.length > 0) {
          errors.push({ contact, error: 'El email ya existe' });
          continue;
        }

        // Insertar contacto
        const result = await pool.query(
          'INSERT INTO contacts (name, email, status, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
          [contact.name, contact.email, contact.status || 'active', userId]
        );
        
        insertedContacts.push(result.rows[0]);
      } catch (error) {
        errors.push({ contact, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    await pool.query('COMMIT');
    
    return {
      success: true,
      data: {
        success: insertedContacts.length,
        errors: errors.length,
        insertedContacts,
        errorDetails: errors
      }
    };
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error al importar contactos:', error);
    return {
      success: false,
      error: 'Error al importar contactos'
    };
  }
}
