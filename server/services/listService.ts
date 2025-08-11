import { pool } from '@/config/database';
import { List, Contact, ListContact } from '@/types/models';
import { ApiError } from '@/utils/errors';

export class ListService {
  async getAllLists(userId?: number): Promise<List[]> {
    try {
      const query = userId 
        ? `SELECT l.*, COALESCE(COUNT(lc.contact_id), 0)::integer as contact_count
           FROM lists l
           LEFT JOIN list_contacts lc ON l.id = lc.list_id
           WHERE l.user_id = $1
           GROUP BY l.id
           ORDER BY l.created_at DESC`
        : `SELECT l.*, COALESCE(COUNT(lc.contact_id), 0)::integer as contact_count
           FROM lists l
           LEFT JOIN list_contacts lc ON l.id = lc.list_id
           GROUP BY l.id
           ORDER BY l.created_at DESC`;
      
      const params = userId ? [userId] : [];
      const result = await pool.query(query, params);
      
      return result.rows;
    } catch (error) {
      console.error('Error al obtener listas:', error);
      throw new ApiError('Error al obtener las listas', 500);
    }
  }

  async createList(name: string, description: string, userId: number): Promise<List> {
    try {
      const query = `
        INSERT INTO lists (name, description, user_id, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING *
      `;
      
      const result = await pool.query(query, [name, description, userId]);
      
      if (result.rows.length === 0) {
        throw new ApiError('Error al crear la lista', 500);
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error al crear lista:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Error al crear la lista', 500);
    }
  }

  async updateList(id: number, name: string, description: string): Promise<List> {
    try {
      const query = `
        UPDATE lists 
        SET name = $1, description = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `;
      
      const result = await pool.query(query, [name, description, id]);
      
      if (result.rows.length === 0) {
        throw new ApiError('Lista no encontrada', 404);
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error al actualizar lista:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Error al actualizar la lista', 500);
    }
  }

  async deleteList(id: number): Promise<void> {
    try {
      // Primero eliminar las relaciones en list_contacts
      await pool.query('DELETE FROM list_contacts WHERE list_id = $1', [id]);
      
      // Luego eliminar la lista
      const result = await pool.query('DELETE FROM lists WHERE id = $1', [id]);
      
      if (result.rowCount === 0) {
        throw new ApiError('Lista no encontrada', 404);
      }
    } catch (error) {
      console.error('Error al eliminar lista:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Error al eliminar la lista', 500);
    }
  }

  async addContactToList(listId: number, contactId: number): Promise<void> {
    try {
      // Verificar si la relación ya existe
      const existingQuery = 'SELECT * FROM list_contacts WHERE list_id = $1 AND contact_id = $2';
      const existing = await pool.query(existingQuery, [listId, contactId]);
      
      if (existing.rows.length > 0) {
        throw new ApiError('El contacto ya está en esta lista', 400);
      }
      
      const query = `
        INSERT INTO list_contacts (list_id, contact_id, added_at)
        VALUES ($1, $2, NOW())
      `;
      
      await pool.query(query, [listId, contactId]);
    } catch (error) {
      console.error('Error al agregar contacto a lista:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Error al agregar contacto a la lista', 500);
    }
  }

  async removeContactFromList(listId: number, contactId: number): Promise<void> {
    try {
      const result = await pool.query(
        'DELETE FROM list_contacts WHERE list_id = $1 AND contact_id = $2',
        [listId, contactId]
      );
      
      if (result.rowCount === 0) {
        throw new ApiError('Relación contacto-lista no encontrada', 404);
      }
    } catch (error) {
      console.error('Error al eliminar contacto de lista:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Error al eliminar contacto de la lista', 500);
    }
  }

  async getListContacts(listId: number): Promise<Contact[]> {
    try {
      const query = `
        SELECT c.* FROM contacts c
        INNER JOIN list_contacts lc ON c.id = lc.contact_id
        WHERE lc.list_id = $1
        ORDER BY c.created_at DESC
      `;
      
      const result = await pool.query(query, [listId]);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener contactos de lista:', error);
      throw new ApiError('Error al obtener los contactos de la lista', 500);
    }
  }

  async importListsFromData(listsData: any[], userId: number): Promise<{ success: number; errors: string[] }> {
    let success = 0;
    const errors: string[] = [];
    
    for (const listData of listsData) {
      try {
        if (!listData.name || typeof listData.name !== 'string') {
          errors.push(`Lista sin nombre válido: ${JSON.stringify(listData)}`);
          continue;
        }
        
        await this.createList(
          listData.name,
          listData.description || '',
          userId
        );
        
        success++;
      } catch (error) {
        errors.push(`Error al importar lista "${listData.name}": ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
    
    return { success, errors };
  }

  async exportListsToCSV(): Promise<string> {
    try {
      const query = `
        SELECT l.name, l.description, l.created_at,
               COUNT(lc.contact_id) as contact_count
        FROM lists l
        LEFT JOIN list_contacts lc ON l.id = lc.list_id
        GROUP BY l.id, l.name, l.description, l.created_at
        ORDER BY l.created_at DESC
      `;
      
      const result = await pool.query(query);
      
      if (result.rows.length === 0) {
        return 'nombre,descripcion,fecha_creacion,numero_contactos\n';
      }
      
      const csvHeader = 'nombre,descripcion,fecha_creacion,numero_contactos\n';
      const csvRows = result.rows.map(row => {
        const name = `"${(row.name || '').replace(/"/g, '""')}"`;
        const description = `"${(row.description || '').replace(/"/g, '""')}"`;
        const createdAt = row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '';
        const contactCount = row.contact_count || 0;
        
        return `${name},${description},${createdAt},${contactCount}`;
      }).join('\n');
      
      return csvHeader + csvRows;
    } catch (error) {
      console.error('Error al exportar listas:', error);
      throw new ApiError('Error al exportar las listas', 500);
    }
  }

  async addContactsToList(listId: number, contactIds: number[]): Promise<{ added: number; errors: string[] }> {
    const result = { added: 0, errors: [] as string[] };
    
    if (!contactIds || contactIds.length === 0) {
      return result;
    }

    try {
      // Verificar qué contactos ya existen en la lista
      const existingQuery = `
        SELECT contact_id 
        FROM list_contacts 
        WHERE list_id = $1 AND contact_id = ANY($2)
      `;
      const existingResult = await pool.query(existingQuery, [listId, contactIds]);
      const existingContactIds = existingResult.rows.map(row => row.contact_id);

      // Filtrar contactos que no están en la lista
      const newContactIds = contactIds.filter(id => !existingContactIds.includes(id));

      if (newContactIds.length === 0) {
        result.errors.push('Todos los contactos ya están en esta lista');
        return result;
      }

      // Crear los valores para la inserción masiva
      const values = newContactIds.map((contactId, index) => 
        `($1, $${index + 2}, NOW())`
      ).join(', ');

      const insertQuery = `
        INSERT INTO list_contacts (list_id, contact_id, added_at)
        VALUES ${values}
      `;

      const queryParams = [listId, ...newContactIds];
      await pool.query(insertQuery, queryParams);

      result.added = newContactIds.length;

      // Agregar información sobre contactos que ya existían
      if (existingContactIds.length > 0) {
        result.errors.push(`${existingContactIds.length} contactos ya estaban en la lista`);
      }

    } catch (error) {
      console.error('Error al agregar contactos a lista:', error);
      throw new ApiError('Error al agregar contactos a la lista', 500);
    }

    return result;
  }
}
