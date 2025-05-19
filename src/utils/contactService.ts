import axios from 'axios';
import api from '../services/api';

// Usar axios configurado desde el servicio centralizado
const axiosInstance = api.axios || axios;

// --- NUEVO: Evitar múltiples registros del interceptor ---
let interceptorRegistered = false;

if (!interceptorRegistered) {
  axiosInstance.interceptors.request.use(
    (config) => {
      // Siempre obtener el token más reciente
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  interceptorRegistered = true;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  status: string;
}

export interface List {
  id: number;
  name: string;
  description?: string;
  contact_count?: number;
}

// Obtener todos los contactos
export const getContacts = async (search?: string): Promise<Contact[]> => {
  try {
    const params = search ? { search } : {};
    const response = await axiosInstance.get('/api/contacts', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener contactos:', error);
    throw error;
  }
};

// Obtener todas las listas
export const getLists = async (): Promise<List[]> => {
  try {
    const response = await axiosInstance.get('/api/lists');
    return response.data;
  } catch (error) {
    console.error('Error al obtener listas:', error);
    throw error;
  }
};

// Obtener contactos de una lista específica
export const getListContacts = async (listId: number): Promise<Contact[]> => {
  try {
    const response = await axiosInstance.get(`/api/lists/${listId}/contacts`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener contactos de la lista:', error);
    throw error;
  }
};

// Crear un nuevo contacto
export const createContact = async (contact: { name: string; email: string }): Promise<Contact> => {
  try {
    const response = await axiosInstance.post('/api/contacts', contact);
    // El backend responde con { success, contact }
    return response.data.contact;
  } catch (error) {
    console.error('Error al crear contacto:', error);
    throw error;
  }
};

// Actualizar un contacto
export const updateContact = async (id: number, contact: { name: string; email: string }): Promise<Contact> => {
  try {
    const response = await axiosInstance.put(`/api/contacts/${id}`, contact);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar contacto:', error);
    throw error;
  }
};

// Eliminar un contacto
export const deleteContact = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/contacts/${id}`);
  } catch (error) {
    console.error('Error al eliminar contacto:', error);
    throw error;
  }
};

export const updateContactStatus = async (contactId: number | undefined, status: string): Promise<Contact> => {
  if (!contactId) {
    throw new Error('ID de contacto no válido');
  }
  
  try {
    const response = await axiosInstance.patch(`/api/contacts/${contactId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar estado del contacto:', error);
    throw error;
  }
};

// Crear una nueva lista
export const createList = async (name: string, description?: string): Promise<List> => {
  try {
    const response = await axiosInstance.post('/api/lists', { name, description });
    // El backend responde con { success, list }
    return response.data.list;
  } catch (error) {
    console.error('Error al crear lista:', error);
    throw error;
  }
};

// Actualizar nombre de una lista
export const updateList = async (id: number, name: string, description?: string): Promise<List> => {
  try {
    const response = await axiosInstance.put(`/api/lists/${id}`, { name, description });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar lista:', error);
    throw error;
  }
};

// Eliminar una lista
export const deleteList = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/lists/${id}`);
  } catch (error) {
    console.error('Error al eliminar lista:', error);
    throw error;
  }
};

// Agregar contactos a una lista
export const addContactsToList = async (listId: number, contactIds: number[]): Promise<void> => {
  try {
    if (!contactIds.length) return;
    
    console.log(`Agregando ${contactIds.length} contactos a la lista ${listId}:`, contactIds);
    
    const response = await axiosInstance.post(`/api/lists/${listId}/contacts`, { contactIds });
    
    // Verificar si la respuesta es exitosa
    if (response.status !== 200) {
      throw new Error('Error en la respuesta del servidor');
    }
  } catch (error) {
    console.error('Error al agregar contactos a la lista:', error);
    throw error;
  }
};

// Eliminar un contacto de una lista
export const removeContactFromList = async (listId: number, contactId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/lists/${listId}/contacts/${contactId}`);
  } catch (error) {
    console.error(`Error al eliminar contacto ${contactId} de la lista ${listId}:`, error);
    throw error;
  }
};

// Procesar archivo de contactos
export const uploadContactsFile = async (file: File): Promise<{ contacts: any[]; totalFound: number }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post('/api/contacts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error al procesar archivo de contactos:', error);
    throw error;
  }
};

// Importar contactos procesados
export const importContacts = async (contacts: any[]): Promise<{ success: number; errors: number }> => {
  try {
    const response = await axiosInstance.post('/api/contacts/import', { contacts });
    return {
      success: response.data.success,
      errors: response.data.errors
    };
  } catch (error) {
    console.error('Error al importar contactos:', error);
    throw error;
  }
};

// Exportar contactos a CSV
export const exportContacts = (listId?: number, status?: string): string => {
  let url = '/api/contacts/export';
  const params = [];
  
  if (listId) {
    params.push(`listId=${listId}`);
  }
  
  if (status) {
    params.push(`status=${status}`);
  }
  
  if (params.length > 0) {
    url += '?' + params.join('&');
  }
  
  // Retornar la URL completa para descargar el archivo
  return axiosInstance.defaults.baseURL + url;
};

// Exportar listas a CSV
export const exportLists = (): string => {
  const url = '/api/lists/export';
  return axiosInstance.defaults.baseURL + url;
};

// Importar listas desde archivo
export const uploadListsFile = async (file: File): Promise<{ lists: any[]; totalFound: number }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post('/api/lists/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error al procesar archivo de listas:', error);
    throw error;
  }
};

// Importar listas procesadas
export const importLists = async (lists: any[]): Promise<{ success: number; errors: number }> => {
  try {
    const response = await axiosInstance.post('/api/lists/import', { lists });
    return {
      success: response.data.success,
      errors: response.data.errors
    };
  } catch (error) {
    console.error('Error al importar listas:', error);
    throw error;
  }
};
