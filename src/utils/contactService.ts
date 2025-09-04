import api from '../services/api';

// Helper para obtener la URL base
const getApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    // En producción, usar la URL del backend específicamente
    const hostname = window.location.hostname;
    return `${window.location.protocol}//${hostname}:7002`;
  }
  return ''; // En desarrollo, usar proxy
};

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
    const response = await api.get('/contacts', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener contactos:', error);
    throw error;
  }
};

// Obtener todas las listas
export const getLists = async (): Promise<List[]> => {
  try {
    const response = await api.get('/lists');
    return response.data;
  } catch (error) {
    console.error('Error al obtener listas:', error);
    throw error;
  }
};

// Obtener contactos de una lista específica
export const getListContacts = async (listId: number): Promise<Contact[]> => {
  try {
    const response = await api.get(`/lists/${listId}/contacts`);
    // El backend devuelve { success: true, data: contacts }
    return response.data.data || [];
  } catch (error) {
    console.error('Error al obtener contactos de la lista:', error);
    throw error;
  }
};

// Crear un nuevo contacto
export const createContact = async (contact: { name: string; email: string }): Promise<Contact> => {
  try {
    const response = await api.post('/contacts', contact);
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
    const response = await api.put(`/contacts/${id}`, contact);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar contacto:', error);
    throw error;
  }
};

// Eliminar un contacto
export const deleteContact = async (id: number): Promise<void> => {
  try {
    await api.delete(`/contacts/${id}`);
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
    const response = await api.patch(`/contacts/${contactId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar estado del contacto:', error);
    throw error;
  }
};

// Crear una nueva lista
export const createList = async (name: string, description?: string): Promise<List> => {
  try {
    const response = await api.post('/lists', { name, description });
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
    const response = await api.put(`/lists/${id}`, { name, description });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar lista:', error);
    throw error;
  }
};

// Eliminar una lista
export const deleteList = async (id: number): Promise<void> => {
  try {
    await api.delete(`/lists/${id}`);
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
    
    const response = await api.post(`/lists/${listId}/contacts`, { contactIds });
    
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
    await api.delete(`/lists/${listId}/contacts/${contactId}`);
  } catch (error) {
    console.error(`Error al eliminar contacto ${contactId} de la lista ${listId}:`, error);
    throw error;
  }
};

// Procesar archivo de contactos
export const uploadContactsFile = async (file: File): Promise<{ 
  success: boolean; 
  data?: { contacts: any[]; totalFound: number }; 
  contacts?: any[]; 
  totalFound?: number; 
  error?: string;
}> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/contacts/upload', formData, {
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
    const response = await api.post('/contacts/import', { contacts });
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
  let url = '/contacts/export';
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
  return getApiBaseUrl() + '/api' + url;
};

// Exportar listas a CSV
export const exportLists = (): string => {
  const url = '/lists/export';
  return getApiBaseUrl() + '/api' + url;
};

// Importar listas desde archivo
export const uploadListsFile = async (file: File): Promise<{ lists: any[]; totalFound: number }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/lists/upload', formData, {
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
    const response = await api.post('/lists/import', { lists });
    return {
      success: response.data.success,
      errors: response.data.errors
    };
  } catch (error) {
    console.error('Error al importar listas:', error);
    throw error;
  }
};
