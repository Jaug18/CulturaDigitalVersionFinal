import { pool } from '@/config/database';
import { hashPassword } from '@/config/auth';
import { User } from '@/types/models';
import { ApiError } from '@/utils/errors';

export class AdminService {
  async getAllUsers(): Promise<User[]> {
    try {
      const query = `
        SELECT id, username, email, role, full_name, is_active, avatar_url, email_verified, created_at, updated_at
        FROM users 
        ORDER BY created_at DESC
      `;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw new ApiError('Error al obtener los usuarios', 500);
    }
  }

  async updateUser(
    id: number, 
    username?: string, 
    email?: string, 
    role?: string, 
    password?: string,
    fullName?: string,
    isActive?: boolean,
    avatarUrl?: string,
    emailVerified?: boolean
  ): Promise<User> {
    try {
      // Verificar que el usuario existe
      const userExists = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
      if (userExists.rows.length === 0) {
        throw new ApiError('Usuario no encontrado', 404);
      }

      // Construir la consulta dinámicamente
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (username) {
        updates.push(`username = $${paramIndex++}`);
        values.push(username);
      }

      if (email) {
        updates.push(`email = $${paramIndex++}`);
        values.push(email);
      }

      if (role) {
        updates.push(`role = $${paramIndex++}`);
        values.push(role);
      }

      if (password) {
        const hashedPassword = await hashPassword(password);
        updates.push(`password = $${paramIndex++}`);
        values.push(hashedPassword);
      }

      if (fullName !== undefined) {
        updates.push(`full_name = $${paramIndex++}`);
        values.push(fullName);
      }

      if (isActive !== undefined) {
        updates.push(`is_active = $${paramIndex++}`);
        values.push(isActive);
      }

      if (avatarUrl !== undefined) {
        updates.push(`avatar_url = $${paramIndex++}`);
        values.push(avatarUrl);
      }

      if (emailVerified !== undefined) {
        updates.push(`email_verified = $${paramIndex++}`);
        values.push(emailVerified);
      }

      if (updates.length === 0) {
        throw new ApiError('No se proporcionaron campos para actualizar', 400);
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE users 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, username, email, role, full_name, is_active, avatar_url, email_verified, created_at, updated_at
      `;

      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new ApiError('Error al actualizar el usuario', 500);
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Error al actualizar el usuario', 500);
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      // Verificar que el usuario existe
      const userExists = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
      if (userExists.rows.length === 0) {
        throw new ApiError('Usuario no encontrado', 404);
      }

      // Comenzar transacción para eliminar el usuario y sus datos relacionados
      await pool.query('BEGIN');

      try {
        // Eliminar tokens de refresh del usuario
        await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [id]);
        
        // Eliminar emails programados del usuario
        await pool.query('DELETE FROM scheduled_emails WHERE user_id = $1', [id]);
        
        // Eliminar emails del usuario
        await pool.query('DELETE FROM emails WHERE user_id = $1', [id]);
        
        // Eliminar listas del usuario (y sus relaciones con contactos)
        const userLists = await pool.query('SELECT id FROM lists WHERE user_id = $1', [id]);
        for (const list of userLists.rows) {
          await pool.query('DELETE FROM list_contacts WHERE list_id = $1', [list.id]);
        }
        await pool.query('DELETE FROM lists WHERE user_id = $1', [id]);
        
        // Eliminar contactos del usuario
        await pool.query('DELETE FROM contacts WHERE user_id = $1', [id]);
        
        // Finalmente eliminar el usuario
        const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
        
        if (result.rowCount === 0) {
          throw new ApiError('Usuario no encontrado', 404);
        }

        await pool.query('COMMIT');
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Error al eliminar el usuario', 500);
    }
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    totalContacts: number;
    totalLists: number;
    totalEmails: number;
  }> {
    try {
      const [usersResult, contactsResult, listsResult, emailsResult] = await Promise.all([
        pool.query('SELECT COUNT(*) as count FROM users'),
        pool.query('SELECT COUNT(*) as count FROM contacts'),
        pool.query('SELECT COUNT(*) as count FROM lists'),
        pool.query('SELECT COUNT(*) as count FROM emails')
      ]);

      return {
        totalUsers: parseInt(usersResult.rows[0].count),
        totalContacts: parseInt(contactsResult.rows[0].count),
        totalLists: parseInt(listsResult.rows[0].count),
        totalEmails: parseInt(emailsResult.rows[0].count)
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw new ApiError('Error al obtener las estadísticas', 500);
    }
  }

  async createUser(
    username: string,
    email: string,
    password: string,
    fullName?: string,
    role: string = 'user',
    isActive: boolean = true
  ): Promise<User> {
    try {
      // Verificar si el email ya existe
      const emailExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (emailExists.rows.length > 0) {
        throw new ApiError('El email ya está registrado', 400);
      }

      // Verificar si el username ya existe
      const usernameExists = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
      if (usernameExists.rows.length > 0) {
        throw new ApiError('El nombre de usuario ya está registrado', 400);
      }

      // Hashear la contraseña
      const hashedPassword = await hashPassword(password);

      // Insertar el nuevo usuario
      const query = `
        INSERT INTO users (username, email, password, full_name, role, is_active, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, username, email, role, full_name, is_active, avatar_url, email_verified, created_at, updated_at
      `;

      const result = await pool.query(query, [
        username,
        email,
        hashedPassword,
        fullName,
        role,
        isActive,
        true // email_verified - por defecto true para usuarios creados por admin
      ]);

      return result.rows[0];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error al crear usuario:', error);
      throw new ApiError('Error al crear el usuario', 500);
    }
  }
}
