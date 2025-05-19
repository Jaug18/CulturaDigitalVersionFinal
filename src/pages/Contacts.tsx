import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, X, Upload, Search, UserPlus, PenLine, Loader2, ChevronDown, Download, FileDown } from 'lucide-react';
import Navbar from "@/components/Navbar";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Contact, 
  List, 
  getContacts, 
  getLists, 
  getListContacts,
  createContact,
  updateContactStatus,
  updateContact,
  deleteContact,
  createList,
  updateList,
  deleteList,
  addContactsToList,
  uploadContactsFile,
  importContacts,
  exportContacts,
  uploadListsFile,
  importLists,
  exportLists,
  removeContactFromList
} from "@/utils/contactService";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

// Agregar esta constante fuera del componente para almacenar el ID del contacto cuyo estado ha cambiado
let lastToggledContactId: number | null = null;

const Contacts = () => {
  // Estados para formularios
  const [showNewContactForm, setShowNewContactForm] = useState(false);
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  
  // Estados para datos
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingLists, setIsLoadingLists] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Estados para diálogos
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showAddToListDialog, setShowAddToListDialog] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [selectedList, setSelectedList] = useState<number | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedContacts, setParsedContacts] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  
  // Estados para edición de listas
  const [editingListId, setEditingListId] = useState<number | null>(null);
  const [editedListName, setEditedListName] = useState('');
  const [editedListDescription, setEditedListDescription] = useState('');
  
  // Estados para edición de contactos
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editContactName, setEditContactName] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [showEditContactDialog, setShowEditContactDialog] = useState(false);

  // Estado para diálogo de eliminación
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState<string>("contacts");

  // Estado para el modo de vista de contactos
  const [viewMode, setViewMode] = useState<'all' | 'list'>('all');
  const [currentViewListId, setCurrentViewListId] = useState<number | null>(null);

  // Agregar nuevos estados para el dialog de visualización de contactos de lista
  const [showListViewDialog, setShowListViewDialog] = useState(false);
  const [viewingList, setViewingList] = useState<List | null>(null);
  const [listViewContacts, setListViewContacts] = useState<Contact[]>([]);
  const [isLoadingListViewContacts, setIsLoadingListViewContacts] = useState(false);

  // Estados para importación de listas
  const [showImportListDialog, setShowImportListDialog] = useState(false);
  const [importListFile, setImportListFile] = useState<File | null>(null);
  const [parsedLists, setParsedLists] = useState<any[]>([]);
  const [isImportingList, setIsImportingList] = useState(false);

  // PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const [contactsPerPage] = useState(5);

  // ORDENAMIENTO
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // FILTRO AVANZADO POR DOMINIO DE EMAIL
  const [emailDomainFilter, setEmailDomainFilter] = useState('');

  // SUGERENCIAS DE BÚSQUEDA
  const [searchSuggestions, setSearchSuggestions] = useState<Contact[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Estados para la sección de listas
  const [listSearch, setListSearch] = useState('');
  const [filteredLists, setFilteredLists] = useState<List[]>([]);
  const [listCurrentPage, setListCurrentPage] = useState(1);
  const [listsPerPage] = useState(5);
  const [listSortBy, setListSortBy] = useState<'name' | 'contact_count' | 'created_at'>('name');
  const [listSortOrder, setListSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedLists, setSelectedLists] = useState<number[]>([]);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [mergeTargetListId, setMergeTargetListId] = useState<number | null>(null);
  const [showInactiveContacts, setShowInactiveContacts] = useState(false);

  // Agregar una función para generar páginas fijas similar a la de Notifications
  const getFixedPageNumbers = (current: number, total: number) => {
    const fixedVisiblePages = 5;
    
    if (total <= fixedVisiblePages) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    const halfVisible = Math.floor(fixedVisiblePages / 2);
    let startPage = Math.max(1, current - halfVisible);
    let endPage = Math.min(total, startPage + fixedVisiblePages - 1);
    
    if (endPage === total) {
      startPage = Math.max(1, endPage - fixedVisiblePages + 1);
    }
    
    const pageNumbers = [];
    pageNumbers.push(1);
    
    if (startPage > 2) {
      pageNumbers.push(-1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== total) {
        pageNumbers.push(i);
      }
    }
    
    if (endPage < total - 1) {
      pageNumbers.push(-2);
    }
    
    if (total > 1) {
      pageNumbers.push(total);
    }
    
    return pageNumbers;
  };

  // Agregar estilos CSS para la paginación fija
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .pagination-fixed-container {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-top: 1rem;
      }
      .pagination-fixed-content {
        min-width: 320px;
        display: flex;
        justify-content: space-between;
      }
      .pagination-fixed-item {
        min-width: 40px;
        text-align: center;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Agregar estas funciones para la navegación de contactos
  const handleFirstPage = () => setCurrentPage(1);
  const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handleLastPage = () => setCurrentPage(totalPages);
  const handlePageClick = (pageNum: number) => setCurrentPage(pageNum);

  // Agregar estas funciones para la navegación de listas
  const handleListFirstPage = () => setListCurrentPage(1);
  const handleListPreviousPage = () => setListCurrentPage(prev => Math.max(prev - 1, 1));
  const handleListNextPage = () => setListCurrentPage(prev => Math.min(prev + 1, listTotalPages));
  const handleListLastPage = () => setListCurrentPage(listTotalPages);
  const handleListPageClick = (pageNum: number) => setListCurrentPage(pageNum);

  // Validación para nombre de lista
  const validateListName = (name: string): string | null => {
    if (!name || !name.trim()) return "El nombre de la lista es obligatorio.";
    if (name.length < 3) return "El nombre de la lista es demasiado corto.";
    if (name.length > 100) return "El nombre de la lista es demasiado largo.";
    if (/[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ ._-]/.test(name)) return "El nombre contiene caracteres no permitidos.";
    return null;
  };

  // Validación para descripción de lista
  const validateListDescription = (desc: string): string | null => {
    if (desc && desc.length > 300) return "La descripción es demasiado larga (máx 300 caracteres).";
    return null;
  };

  // Cargar datos iniciales con manejo de errores mejorado
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingContacts(true);
        setIsLoadingLists(true);
        
        const contactsPromise = getContacts();
        const listsPromise = getLists();
        
        const [contactsData, listsData] = await Promise.all([contactsPromise, listsPromise]);
        
        setContacts(contactsData);
        setAllContacts(contactsData);
        setFilteredContacts(contactsData);
        setLists(listsData);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        toast({
          title: "Error de conexión",
          description: "No se pudieron cargar los datos. Por favor, verifica tu conexión e inicia sesión nuevamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingContacts(false);
        setIsLoadingLists(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Actualizar contactos filtrados y ordenados
  useEffect(() => {
    if (activeTab === "contacts") {
      if (viewMode === 'list' && currentViewListId) {
        return;
      }
      let filtered = allContacts;

      // Filtro búsqueda global
      if (searchTerm) {
        filtered = filtered.filter(
          contact =>
            contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filtro avanzado por dominio de email
      if (emailDomainFilter) {
        filtered = filtered.filter(contact =>
          contact.email.toLowerCase().endsWith(`@${emailDomainFilter.toLowerCase()}`)
        );
      }

      // Filtro de estado
      if (statusFilter !== 'all') {
        filtered = filtered.filter(contact => contact.status === statusFilter);
      }

      // Ordenar
      filtered = [...filtered].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      setFilteredContacts(filtered);

      // Sugerencias de búsqueda (máx 5)
      if (searchTerm) {
        setSearchSuggestions(filtered.slice(0, 5));
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }

      // Solo reiniciar página si cambia el filtro, no cuando se cambia el estado de un contacto
      const shouldResetPage = 
        lastToggledContactId === null && 
        (searchTerm || statusFilter !== 'all' || emailDomainFilter || sortBy || sortOrder);
      
      if (shouldResetPage) {
        setCurrentPage(1);
      }
    }
  }, [searchTerm, allContacts, activeTab, viewMode, currentViewListId, statusFilter, sortBy, sortOrder, emailDomainFilter]);

  // Actualizar listas filtradas y ordenadas
  useEffect(() => {
    let filtered = lists;
    if (listSearch) {
      filtered = filtered.filter(list =>
        list.name.toLowerCase().includes(listSearch.toLowerCase()) ||
        (list.description || '').toLowerCase().includes(listSearch.toLowerCase())
      );
    }
    filtered = [...filtered].sort((a, b) => {
      let aValue = a[listSortBy] || '';
      let bValue = b[listSortBy] || '';
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      if (aValue < bValue) return listSortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return listSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredLists(filtered);
    setListCurrentPage(1);
  }, [lists, listSearch, listSortBy, listSortOrder]);

  // PAGINACIÓN: calcular contactos a mostrar
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);
  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);

  // Paginación de listas
  const listIndexOfLast = listCurrentPage * listsPerPage;
  const listIndexOfFirst = listIndexOfLast - listsPerPage;
  const currentLists = filteredLists.slice(listIndexOfFirst, listIndexOfLast);
  const listTotalPages = Math.ceil(filteredLists.length / listsPerPage);

  // Cambiar ordenamiento al hacer clic en el encabezado
  const handleSort = (column: 'name' | 'email' | 'status') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Obtener dominios únicos para el filtro avanzado
  const emailDomains = Array.from(new Set(allContacts.map(c => c.email.split('@')[1] || '')))
    .filter(Boolean)
    .sort();

  const handleRemoveFromList = async (contactId: number) => {
    try {
      // Confirmar antes de eliminar
      if (!confirm("¿Está seguro que desea eliminar este contacto de la lista?")) {
        return;
      }
      
      setIsLoadingListViewContacts(true);
      
      // Asegurarse de que viewingList?.id existe
      if (!viewingList || !viewingList.id) {
        throw new Error('No se ha seleccionado ninguna lista');
      }
      
      // Usar la función del servicio para eliminar el contacto de la lista
      await removeContactFromList(viewingList.id, contactId);
      
      // Actualizar la lista de contactos filtrando el que se eliminó
      setListViewContacts(listViewContacts.filter(contact => contact.id !== contactId));
      
      toast({
        title: "Contacto eliminado",
        description: "El contacto ha sido eliminado de la lista exitosamente",
        variant: "default",
      });
    } catch (error) {
      console.error('Error al eliminar contacto de la lista:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el contacto de la lista",
        variant: "destructive",
      });
    } finally {
      setIsLoadingListViewContacts(false);
    }
  };

  // Función para cargar contactos del backend
  const loadContacts = async () => {
    try {
      setIsLoadingContacts(true);
      const data = await getContacts();
      setContacts(data);
      setAllContacts(data);
      setFilteredContacts(data);
    } catch (error) {
      console.error('Error al cargar contactos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los contactos. Verifica tu conexión.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingContacts(false);
    }
  };
  
  // Función para cargar listas del backend
  const loadLists = async () => {
    try {
      setIsLoadingLists(true);
      const data = await getLists();
      setLists(data);
    } catch (error) {
      console.error('Error al cargar listas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las listas. Verifica tu conexión.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLists(false);
    }
  };

  // Función para buscar contactos
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Función para validar email
  const validateEmail = (email: string): string | null => {
    if (!email) return "El correo es obligatorio.";
    if (email.length < 5) return "El correo es demasiado corto.";
    if (email.length > 254) return "El correo es demasiado largo.";
    if (/\s/.test(email)) return "El correo no debe contener espacios.";
    // Regex robusto para emails válidos
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!emailRegex.test(email)) return "El formato del correo no es válido.";
    // Dominio debe tener al menos un punto y 2 caracteres después del último punto
    const domain = email.split('@')[1];
    if (!domain || domain.indexOf('.') === -1) return "El dominio del correo no es válido.";
    if (domain.split('.').pop()?.length! < 2) return "El dominio del correo no es válido.";
    return null;
  };

  // Función para crear un nuevo contacto
  const handleCreateContact = async () => {
    if (!newContactName.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa el nombre del contacto.",
        variant: "destructive",
      });
      return;
    }

    const emailError = validateEmail(newContactEmail.trim());
    if (emailError) {
      toast({
        title: "Correo inválido",
        description: emailError,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await createContact({
        name: newContactName.trim(),
        email: newContactEmail.trim()
      });
      await loadContacts();
      toast({
        title: "Contacto creado",
        description: `${newContactName} ha sido añadido a tus contactos.`,
      });
      setNewContactName('');
      setNewContactEmail('');
      setShowNewContactForm(false);
    } catch (error: any) {
      console.error('Error al crear contacto:', error);
      let msg = error.response?.data?.error || "No se pudo crear el contacto";
      if (error.response?.data?.message) msg = error.response.data.message;
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para crear una nueva lista - actualizada con validaciones
  const handleCreateList = async () => {
    const nameError = validateListName(newListName);
    const descError = validateListDescription(newListDescription);
    if (nameError) {
      toast({
        title: "Nombre inválido",
        description: nameError,
        variant: "destructive",
      });
      return;
    }
    if (descError) {
      toast({
        title: "Descripción inválida",
        description: descError,
        variant: "destructive",
      });
      return;
    }
    try {
      setIsSubmitting(true);
      await createList(newListName.trim(), newListDescription.trim());
      await loadLists();
      toast({
        title: "Lista creada",
        description: `La lista ${newListName} ha sido creada.`,
      });
      setNewListName('');
      setNewListDescription('');
      setShowNewListForm(false);
    } catch (error: any) {
      console.error('Error al crear lista:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "No se pudo crear la lista",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleContactStatus = async (contactId: number | undefined, currentStatus: string) => {
    if (!contactId) {
      toast({
        title: "Error",
        description: "ID de contacto no válido",
        variant: "destructive",
      });
      return;
    }
    
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      // Guardar el ID del contacto que está cambiando para evitar resetear la página
      lastToggledContactId = contactId;
      
      await updateContactStatus(contactId, newStatus);
      
      // Actualizar estado local
      setContacts(contacts.map(contact => 
        contact.id === contactId ? {...contact, status: newStatus} : contact
      ));
      setAllContacts(allContacts.map(contact => 
        contact.id === contactId ? {...contact, status: newStatus} : contact
      ));
      
      toast({
        title: "Estado actualizado",
        description: `El contacto ahora está ${newStatus === 'active' ? 'activo' : 'inactivo'}.`,
      });
      
      // Limpiar el ID después de un tiempo
      setTimeout(() => {
        lastToggledContactId = null;
      }, 500);
    } catch (error) {
      lastToggledContactId = null;
      console.error('Error al actualizar estado:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del contacto",
        variant: "destructive",
      });
    }
  };
  
  // Función para seleccionar/deseleccionar un contacto
  const handleContactSelection = (contactId: number) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };
  
  // Función para agregar contactos a una lista
  const handleAddToList = async () => {
    if (!selectedList || selectedContacts.length === 0) return;
    
    try {
      setIsSubmitting(true);
      
      await addContactsToList(selectedList, selectedContacts);
      
      toast({
        title: "Contactos agregados",
        description: `${selectedContacts.length} contacto(s) agregado(s) a la lista.`,
      });
      
      setSelectedContacts([]);
      setSelectedList(null);
      setShowAddToListDialog(false);
      
      // Recargar listas para actualizar contador
      loadLists();
    } catch (error) {
      console.error('Error al agregar contactos a la lista:', error);
      toast({
        title: "Error",
        description: "No se pudieron agregar los contactos a la lista",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Función para subir archivo de contactos
  const handleUploadContactFile = async () => {
    if (!importFile) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo para importar",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsImporting(true);
      
      const result = await uploadContactsFile(importFile);
      
      setParsedContacts(result.contacts);
      
      toast({
        title: "Archivo procesado",
        description: `Se encontraron ${result.totalFound} contactos en el archivo.`,
      });
    } catch (error: any) {
      console.error('Error al procesar archivo:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "No se pudo procesar el archivo",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };
  
  // Función para importar contactos procesados
  const handleImportContacts = async () => {
    if (parsedContacts.length === 0) {
      toast({
        title: "Error",
        description: "No hay contactos para importar",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsImporting(true);
      
      const result = await importContacts(parsedContacts);
      
      toast({
        title: "Importación completada",
        description: `${result.success} contactos importados. ${result.errors} errores.`,
      });
      
      setImportFile(null);
      setParsedContacts([]);
      setShowImportDialog(false);
      
      // Recargar contactos
      loadContacts();
    } catch (error) {
      console.error('Error al importar contactos:', error);
      toast({
        title: "Error",
        description: "No se pudieron importar los contactos",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };
  
  // Función para comenzar la edición de una lista
  const startEditingList = (list: List) => {
    setEditingListId(list.id);
    setEditedListName(list.name);
    setEditedListDescription(list.description || '');
  };
  
  // Función para guardar los cambios de una lista editada - actualizada con validaciones
  const saveEditedList = async () => {
    const nameError = validateListName(editedListName);
    const descError = validateListDescription(editedListDescription);
    if (nameError) {
      toast({
        title: "Nombre inválido",
        description: nameError,
        variant: "destructive",
      });
      return;
    }
    if (descError) {
      toast({
        title: "Descripción inválida",
        description: descError,
        variant: "destructive",
      });
      return;
    }
    if (!editingListId) return;
    try {
      setIsSubmitting(true);
      await updateList(editingListId, editedListName.trim(), editedListDescription.trim());
      setLists(lists.map(list => 
        list.id === editingListId ? {
          ...list, 
          name: editedListName,
          description: editedListDescription
        } : list
      ));
      toast({
        title: "Lista actualizada",
        description: `La lista ha sido actualizada correctamente.`,
      });
      setEditingListId(null);
      setEditedListName('');
      setEditedListDescription('');
    } catch (error) {
      console.error('Error al actualizar lista:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la lista",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Función para cancelar la edición de una lista
  const cancelEditList = () => {
    setEditingListId(null);
    setEditedListName('');
    setEditedListDescription('');
  };
  
  // Función para eliminar una lista
  const handleDeleteList = async (listId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta lista?')) return;
    
    try {
      await deleteList(listId);
      
      // Actualizar estado local
      setLists(lists.filter(list => list.id !== listId));
      
      toast({
        title: "Lista eliminada",
        description: "La lista ha sido eliminada correctamente.",
      });
    } catch (error) {
      console.error('Error al eliminar lista:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la lista",
        variant: "destructive",
      });
    }
  };

  // Selección múltiple de listas
  const handleListSelection = (listId: number) => {
    if (selectedLists.includes(listId)) {
      setSelectedLists(selectedLists.filter(id => id !== listId));
    } else {
      setSelectedLists([...selectedLists, listId]);
    }
  };

  // Eliminar varias listas
  const handleDeleteSelectedLists = async () => {
    if (!selectedLists.length) return;
    if (!confirm('¿Estás seguro de eliminar las listas seleccionadas?')) return;
    for (const id of selectedLists) {
      await handleDeleteList(id);
    }
    setSelectedLists([]);
  };

  // Duplicar lista
  const handleDuplicateList = async (list: List) => {
    try {
      setIsSubmitting(true);
      const newList = await createList(list.name + ' (Copia)', list.description);
      toast({
        title: "Lista duplicada",
        description: `La lista "${list.name}" ha sido duplicada.`,
      });
      await loadLists();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo duplicar la lista",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Exportar una lista específica (CSV)
  const handleExportSingleList = (listId: number) => {
    const exportUrl = exportContacts(listId);
    window.open(exportUrl, '_blank');
    toast({
      title: "Exportación iniciada",
      description: "La descarga de la lista comenzará en breve.",
    });
  };

  // Nueva función para exportar una lista específica en Excel
  const handleExportSingleListExcel = async (listId: number, listName: string) => {
    try {
      // Obtener los contactos de esta lista específica
      const listContacts = await getListContacts(listId);
      
      const data = [
        ["ID", "Nombre", "Email", "Estado"],
        ...listContacts.map(c => [
          c.id,
          c.name,
          c.email,
          c.status === "active" ? "Activo" : "Inactivo"
        ])
      ];
      
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Contactos");
      
      // Ajustar ancho de columnas
      const wscols = [
        { wch: 10 },
        { wch: 40 },
        { wch: 40 },
        { wch: 15 }
      ];
      ws['!cols'] = wscols;
      
      XLSX.writeFile(wb, `lista-${listName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Exportación Excel completada",
        description: `La lista "${listName}" ha sido exportada en formato Excel.`
      });
    } catch (error) {
      console.error('Error al exportar lista a Excel:', error);
      toast({
        title: "Error",
        description: "No se pudo exportar la lista a Excel",
        variant: "destructive",
      });
    }
  };

  // Nueva función para exportar una lista específica en PDF
  const handleExportSingleListPDF = async (listId: number, listName: string) => {
    try {
      // Obtener los contactos de esta lista específica
      const listContacts = await getListContacts(listId);
      
      const doc = new jsPDF("l", "pt", "a4");
      doc.setFontSize(16);
      doc.text(`Lista: ${listName}`, 40, 40);
      
      doc.setFontSize(11);
      doc.text(`Generado: ${new Date().toLocaleDateString()}`, 40, 60);
      doc.text(`Total contactos: ${listContacts.length}`, 40, 80);
      
      autoTable(doc, {
        startY: 100,
        head: [["Nombre", "Email", "Estado"]],
        body: listContacts.map(c => [
          c.name,
          c.email,
          c.status === "active" ? "Activo" : "Inactivo"
        ]),
        theme: "grid",
        styles: { fontSize: 10 },
        margin: { left: 40, right: 40 },
      });
      
      doc.save(`lista-${listName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Exportación PDF completada",
        description: `La lista "${listName}" ha sido exportada en formato PDF.`
      });
    } catch (error) {
      console.error('Error al exportar lista a PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo exportar la lista a PDF",
        variant: "destructive",
      });
    }
  };

  // Visualización de contactos inactivos/activos en la lista
  const filteredListViewContacts = showInactiveContacts
    ? listViewContacts
    : listViewContacts.filter(c => c.status === 'active');

  // Función para cargar contactos de una lista específica
  const handleViewList = async (listId: number) => {
    try {
      setIsLoadingListViewContacts(true);
      
      // Encontrar la lista actual para mostrar su nombre
      const currentList = lists.find(l => l.id === listId) || null;
      setViewingList(currentList);
      
      console.log(`Cargando contactos de la lista ${listId}...`);
      
      const listContacts = await getListContacts(listId);
      console.log(`Recibidos ${listContacts.length} contactos de la lista ${listId}`);
      
      // Guardar los contactos para mostrarlos en el modal
      setListViewContacts(listContacts);
      
      // Mostrar el dialog
      setShowListViewDialog(true);
    } catch (error) {
      console.error('Error al cargar contactos de la lista:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los contactos de esta lista",
        variant: "destructive",
      });
    } finally {
      setIsLoadingListViewContacts(false);
    }
  };

  // Función para abrir el diálogo de edición de contacto
  const startEditingContact = (contact: Contact) => {
    setEditingContact(contact);
    setEditContactName(contact.name);
    setEditContactEmail(contact.email);
    setShowEditContactDialog(true);
  };
  
  // Función para actualizar un contacto
  const handleUpdateContact = async () => {
    if (!editingContact || !editContactName || !editContactEmail) return;
    
    try {
      setIsSubmitting(true);
      
      const updatedContact = await updateContact(editingContact.id, {
        name: editContactName,
        email: editContactEmail
      });
      
      // Actualizar estados locales
      setContacts(contacts.map(contact => 
        contact.id === updatedContact.id ? updatedContact : contact
      ));
      setAllContacts(allContacts.map(contact => 
        contact.id === updatedContact.id ? updatedContact : contact
      ));
      
      toast({
        title: "Contacto actualizado",
        description: `${updatedContact.name} ha sido actualizado correctamente.`,
      });
      
      setShowEditContactDialog(false);
      setEditingContact(null);
      setEditContactName('');
      setEditContactEmail('');
    } catch (error: any) {
      console.error('Error al actualizar contacto:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "No se pudo actualizar el contacto",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Función para abrir el diálogo de eliminación
  const confirmDeleteContact = (contact: Contact) => {
    setDeletingContact(contact);
    setShowDeleteDialog(true);
  };
  
  // Función para eliminar un contacto
  const handleDeleteContact = async () => {
    if (!deletingContact) return;
    
    try {
      setIsSubmitting(true);
      
      await deleteContact(deletingContact.id);
      
      // Actualizar estados locales
      setContacts(contacts.filter(contact => contact.id !== deletingContact.id));
      setAllContacts(allContacts.filter(contact => contact.id !== deletingContact.id));
      setFilteredContacts(filteredContacts.filter(contact => contact.id !== deletingContact.id));
      
      toast({
        title: "Contacto eliminado",
        description: `${deletingContact.name} ha sido eliminado correctamente.`,
      });
      
      setShowDeleteDialog(false);
      setDeletingContact(null);
    } catch (error) {
      console.error('Error al eliminar contacto:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el contacto",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Función para exportar contactos
  const handleExportContacts = (listId?: number) => {
    const exportUrl = exportContacts(listId, statusFilter === 'all' ? undefined : statusFilter);
    window.open(exportUrl, '_blank');
    
    toast({
      title: "Exportación iniciada",
      description: "La descarga de tus contactos comenzará en breve.",
    });
  };

  // Función para exportar listas
  const handleExportLists = () => {
    const exportUrl = exportLists();
    window.open(exportUrl, '_blank');
    
    toast({
      title: "Exportación iniciada",
      description: "La descarga de tus listas comenzará en breve.",
    });
  };

  // Función para subir archivo de listas
  const handleUploadListFile = async () => {
    if (!importListFile) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo para importar",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsImportingList(true);
      
      const result = await uploadListsFile(importListFile);
      
      setParsedLists(result.lists);
      
      toast({
        title: "Archivo procesado",
        description: `Se encontraron ${result.totalFound} listas en el archivo.`,
      });
    } catch (error: any) {
      console.error('Error al procesar archivo:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "No se pudo procesar el archivo",
        variant: "destructive",
      });
    } finally {
      setIsImportingList(false);
    }
  };

  // Función para importar listas procesadas
  const handleImportLists = async () => {
    if (parsedLists.length === 0) {
      toast({
        title: "Error",
        description: "No hay listas para importar",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsImportingList(true);
      
      const result = await importLists(parsedLists);
      
      toast({
        title: "Importación completada",
        description: `${result.success} listas importadas. ${result.errors} errores.`,
      });
      
      setImportListFile(null);
      setParsedLists([]);
      setShowImportListDialog(false);
      
      // Recargar listas
      loadLists();
    } catch (error) {
      console.error('Error al importar listas:', error);
      toast({
        title: "Error",
        description: "No se pudieron importar las listas",
        variant: "destructive",
      });
    } finally {
      setIsImportingList(false);
    }
  };

   // Exportar todas las listas a PDF
  const handleExportListsPDF = async () => {
    const doc = new jsPDF("l", "pt", "a4");
    doc.setFontSize(16);
    doc.text("Listas y sus contactos", 40, 40);

    let startY = 60;
    for (const list of lists) {
      doc.setFontSize(13);
      doc.text(`Lista: ${list.name} (ID: ${list.id})`, 40, startY);
      doc.setFontSize(10);
      doc.text(`Descripción: ${list.description || "-"}`, 40, startY + 15);
      doc.text(`Cantidad de contactos: ${list.contact_count || 0}`, 40, startY + 30);

      // Obtener contactos de la lista
      let contactsList: Contact[] = [];
      try {
        contactsList = await getListContacts(list.id);
      } catch {
        contactsList = [];
      }

      // Tabla de contactos
      autoTable(doc, {
        startY: startY + 40,
        head: [["Nombre", "Email", "Estado"]],
        body: contactsList.map(c => [
          c.name,
          c.email,
          c.status === "active" ? "Activo" : "Inactivo"
        ]),
        theme: "grid",
        styles: { fontSize: 9 },
        margin: { left: 40, right: 40 },
      });

      startY = doc.lastAutoTable.finalY + 30;
      if (startY > 500) {
        doc.addPage();
        startY = 40;
      }
    }
    doc.save("listas_y_contactos.pdf");
    toast({ title: "Exportación PDF", description: "Se descargó el PDF con todas las listas y contactos." });
  };

  // Exportar todas las listas a Excel
  const handleExportListsExcel = async () => {
    const wb = XLSX.utils.book_new();

    for (const list of lists) {
      let contactsList: Contact[] = [];
      try {
        contactsList = await getListContacts(list.id);
      } catch {
        contactsList = [];
      }
      const data = [
        ["ID", list.id],
        ["Nombre", list.name],
        ["Descripción", list.description || ""],
        ["Cantidad de contactos", list.contact_count || 0],
        [],
        ["Nombre", "Email", "Estado"]
      ];
      contactsList.forEach(c => {
        data.push([c.name, c.email, c.status === "active" ? "Activo" : "Inactivo"]);
      });
      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, list.name.substring(0, 28));
    }
    XLSX.writeFile(wb, "listas_y_contactos.xlsx");
    toast({ title: "Exportación Excel", description: "Se descargó el Excel con todas las listas y contactos." });
  };

  // Exportar todos los contactos a PDF
  const handleExportContactsPDF = () => {
    const doc = new jsPDF("l", "pt", "a4");
    doc.setFontSize(16);
    doc.text("Contactos", 40, 40);

    autoTable(doc, {
      startY: 60,
      head: [["Nombre", "Email", "Estado"]],
      body: allContacts.map(c => [
        c.name,
        c.email,
        c.status === "active" ? "Activo" : "Inactivo"
      ]),
      theme: "grid",
      styles: { fontSize: 10 },
      margin: { left: 40, right: 40 },
    });

    doc.save("contactos.pdf");
    toast({ title: "Exportación PDF", description: "Se descargó el PDF de contactos." });
  };

  // Exportar todos los contactos a Excel
  const handleExportContactsExcel = () => {
    const data = [
      ["Nombre", "Email", "Estado"],
      ...allContacts.map(c => [
        c.name,
        c.email,
        c.status === "active" ? "Activo" : "Inactivo"
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contactos");
    XLSX.writeFile(wb, "contactos.xlsx");
    toast({ title: "Exportación Excel", description: "Se descargó el Excel de contactos." });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <Navbar />
      
      <main className="py-8 container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Contactos</h1>
            <p className="text-gray-600">Gestiona tus contactos y listas</p>
          </div>
          
          <Tabs 
            defaultValue="contacts" 
            value={activeTab} 
            onValueChange={(value) => {
              setActiveTab(value);
              // Solo resetear la vista a 'all' si cambiamos a la pestaña de listas
              if (value === "lists") {
                setViewMode('all');
                setCurrentViewListId(null);
              }
              // Al volver a 'contacts' desde 'lists', mostrar todos los contactos
              if (value === "contacts" && activeTab === "lists") {
                setFilteredContacts(allContacts);
                setSearchTerm("");
                setViewMode('all');
                setCurrentViewListId(null);
              }
            }}
            className="w-full"
          >
            <div className="px-4 pt-4">
              <TabsList className="w-full grid grid-cols-2 mb-4">
                <TabsTrigger value="contacts">Contactos</TabsTrigger>
                <TabsTrigger value="lists">Listas</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="contacts" className="p-4">
              {/* Indicador de lista activa */}
              {activeTab === "contacts" && viewMode === 'list' && currentViewListId && (
                <div className="mb-4 flex items-center justify-between bg-blue-50 p-2 rounded-md border border-blue-200">
                  <div className="flex items-center">
                    <span className="text-blue-700 text-sm font-medium">
                      Mostrando contactos de la lista: {lists.find(l => l.id === currentViewListId)?.name || 'Lista'}
                    </span>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setViewMode('all');
                      setCurrentViewListId(null);
                      setFilteredContacts(allContacts);
                    }}
                  >
                    Ver todos los contactos
                  </Button>
                </div>
              )}

              {/* Barra de búsqueda y acciones */}
              <div className="flex flex-col md:flex-row gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Buscar contacto..." 
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => {
                      handleSearch(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => searchTerm && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  />
                  {/* Sugerencias de búsqueda */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute z-10 bg-white border rounded shadow w-full mt-1">
                      {searchSuggestions.map((contact) => (
                        <div
                          key={contact.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onMouseDown={() => {
                            setSearchTerm(contact.name);
                            setShowSuggestions(false);
                          }}
                        >
                          <span className="font-medium">{contact.name}</span>
                          <span className="ml-2 text-gray-500">{contact.email}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap md:flex-nowrap">
                  <select 
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[120px]"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                  {/* Filtro avanzado por dominio */}
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[130px]"
                    value={emailDomainFilter}
                    onChange={e => setEmailDomainFilter(e.target.value)}
                  >
                    <option value="">Todos los dominios</option>
                    {emailDomains.map(domain => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                  {/* Dropdown de exportación */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Formato de exportación</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleExportContacts()}>
                        <FileDown className="h-4 w-4 mr-2" /> CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportContactsPDF}>
                        <FileDown className="h-4 w-4 mr-2" /> PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportContactsExcel}>
                        <FileDown className="h-4 w-4 mr-2" /> Excel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Importar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Importar contactos</DialogTitle>
                        <DialogDescription>
                          Sube un archivo CSV o Excel con tus contactos.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {!parsedContacts.length ? (
                          <>
                            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                              <Input 
                                type="file" 
                                accept=".csv,.xlsx,.xls" 
                                className="mx-auto"
                                onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)}
                                disabled={isImporting}
                              />
                              <p className="text-sm text-gray-500 mt-2">
                                Formatos soportados: CSV, Excel
                              </p>
                            </div>
                            <Button 
                              className="w-full" 
                              onClick={handleUploadContactFile}
                              disabled={!importFile || isImporting}
                            >
                              {isImporting ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Procesando...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Procesar archivo
                                </>
                              )}
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="rounded-md border p-4">
                              <p className="font-medium">Contactos encontrados: {parsedContacts.length}</p>
                              <div className="mt-2 max-h-40 overflow-auto">
                                <ul className="text-sm space-y-1">
                                  {parsedContacts.slice(0, 5).map((contact, idx) => (
                                    <li key={idx} className="flex justify-between">
                                      <span>{contact.name}</span>
                                      <span className="text-gray-500">{contact.email}</span>
                                    </li>
                                  ))}
                                  {parsedContacts.length > 5 && (
                                    <li className="text-center text-gray-500">
                                      Y {parsedContacts.length - 5} más...
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </div>
                            <Button 
                              className="w-full" 
                              onClick={handleImportContacts}
                              disabled={isImporting}
                            >
                              {isImporting ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Importando...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Importar {parsedContacts.length} contactos
                                </>
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={showAddToListDialog} onOpenChange={setShowAddToListDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        disabled={selectedContacts.length === 0}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Agregar a lista
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Agregar a lista</DialogTitle>
                        <DialogDescription>
                          Selecciona la lista a la que quieres agregar {selectedContacts.length} contacto(s).
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {isLoadingLists ? (
                          <div className="text-center py-4">
                            <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
                            <p className="mt-2 text-gray-500">Cargando listas...</p>
                          </div>
                        ) : lists.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-gray-500">No tienes listas creadas.</p>
                            <Button 
                              variant="link" 
                              onClick={() => {
                                setShowAddToListDialog(false);
                                setShowNewListForm(true);
                                (document.querySelector('[data-value="lists"]') as HTMLElement)?.click();
                              }}
                            >
                              Crear una lista
                            </Button>
                          </div>
                        ) : (
                          <>
                            {lists.map(list => (
                              <div 
                                key={list.id} 
                                className={`p-3 border rounded-md cursor-pointer ${selectedList === list.id ? 'bg-blue-50 border-blue-500' : ''}`}
                                onClick={() => setSelectedList(list.id)}
                              >
                                <div className="font-medium">{list.name}</div>
                                <div className="text-sm text-gray-500">{list.contact_count || 0} contactos</div>
                              </div>
                            ))}
                            <Button 
                              className="w-full" 
                              onClick={handleAddToList}
                              disabled={!selectedList || isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Agregando...
                                </>
                              ) : (
                                "Agregar a lista seleccionada"
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    className="flex justify-center items-center"
                    onClick={() => setShowNewContactForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Agregar
                  </Button>
                </div>
              </div>
              
              {showNewContactForm && (
                <div className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50">
                  <h4 className="font-medium mb-3">Nuevo contacto</h4>
                  <div className="space-y-3">
                    <Input
                      type="text"
                      placeholder="Nombre"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="w-full"
                    />
                    <Input
                      type="email"
                      placeholder="Correo electrónico"
                      value={newContactEmail}
                      onChange={(e) => setNewContactEmail(e.target.value)}
                      className="w-full"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowNewContactForm(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleCreateContact}
                        disabled={!newContactName || !newContactEmail || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          "Guardar"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <ScrollArea className="h-[500px] rounded-md border">
                {isLoadingContacts ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <p className="mt-2 text-gray-500">Cargando contactos...</p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[30px]">
                            <Input 
                              type="checkbox" 
                              className="w-4 h-4" 
                              checked={selectedContacts.length > 0 && selectedContacts.length === filteredContacts.length}
                              onChange={() => {
                                if (selectedContacts.length === filteredContacts.length) {
                                  setSelectedContacts([]);
                                } else {
                                  setSelectedContacts(filteredContacts.map(c => c.id));
                                }
                              }} 
                            />
                          </TableHead>
                          <TableHead className="w-[250px] cursor-pointer select-none" onClick={() => handleSort('name')}>
                            Nombre
                            {sortBy === 'name' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                          </TableHead>
                          <TableHead className="cursor-pointer select-none" onClick={() => handleSort('email')}>
                            Correo electrónico
                            {sortBy === 'email' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                          </TableHead>
                          <TableHead className="cursor-pointer select-none" onClick={() => handleSort('status')}>
                            Estado
                            {sortBy === 'status' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                          </TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentContacts.map((contact) => (
                          <TableRow key={contact.id}>
                            <TableCell>
                              <Input 
                                type="checkbox" 
                                className="w-4 h-4" 
                                checked={selectedContacts.includes(contact.id)}
                                onChange={() => handleContactSelection(contact.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                <AvatarFallback>{(contact.name || '').substring(0, 2).toUpperCase()}</AvatarFallback>                                </Avatar>
                                <div>{contact.name}</div>
                              </div>
                            </TableCell>
                            <TableCell>{contact.email}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end space-x-2">
                                <Label htmlFor={`contact-status-${contact.id}`} className={`text-sm ${contact.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                                  {contact.status === 'active' ? 'Activo' : 'Inactivo'}
                                </Label>
                                <Switch 
                                  id={`contact-status-${contact.id}`}
                                  checked={contact.status === 'active'} 
                                  onCheckedChange={() => toggleContactStatus(contact.id, contact.status)}
                                />
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => startEditingContact(contact)}
                                >
                                  Editar
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => confirmDeleteContact(contact)}
                                >
                                  Eliminar
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {currentContacts.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              No se encontraron contactos que coincidan con tu búsqueda
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    {/* PAGINACIÓN */}
                    <div className="mt-4">
                      <Pagination className="pagination-fixed-container">
                        <PaginationContent className="pagination-fixed-content">
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={handlePreviousPage}
                              disabled={currentPage === 1}
                            />
                          </PaginationItem>

                          {getFixedPageNumbers(currentPage, totalPages).map((pageNum, index) => {
                            if (pageNum === -1 || pageNum === -2) {
                              return (
                                <PaginationItem key={`ellipsis-${index}`} className="pagination-fixed-item">
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }
                            
                            return (
                              <PaginationItem key={pageNum} className="pagination-fixed-item">
                                <PaginationLink
                                  isActive={currentPage === pageNum}
                                  onClick={() => handlePageClick(pageNum)}
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}

                          <PaginationItem>
                            <PaginationNext
                              onClick={handleNextPage}
                              disabled={currentPage === totalPages}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                      <div className="text-center mt-2">
                        <p className="text-sm text-gray-500">
                          Mostrando página {currentPage} de {totalPages} 
                          ({filteredContacts.length} resultados)
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="lists" className="p-4">
              {/* Botones para lista - REORGANIZADOS Y REDUCIDOS */}
              <div className="flex items-center justify-between mb-4 gap-2">
                <div className="flex-1 flex items-center gap-2">
                  <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar lista..."
                      value={listSearch}
                      onChange={e => setListSearch(e.target.value)}
                      className="pl-9 h-9"
                      size={30}
                    />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 whitespace-nowrap">
                        Ordenar
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => {
                          setListSortBy('name');
                          setListSortOrder('asc');
                        }}
                        className={`${listSortBy === 'name' && listSortOrder === 'asc' ? 'bg-accent' : ''}`}
                      >
                        Nombre (A-Z)
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setListSortBy('name');
                          setListSortOrder('desc');
                        }}
                        className={`${listSortBy === 'name' && listSortOrder === 'desc' ? 'bg-accent' : ''}`}
                      >
                        Nombre (Z-A)
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setListSortBy('contact_count');
                          setListSortOrder('asc');
                        }}
                        className={`${listSortBy === 'contact_count' && listSortOrder === 'asc' ? 'bg-accent' : ''}`}
                      >
                        Contactos (menor a mayor)
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setListSortBy('contact_count');
                          setListSortOrder('desc');
                        }}
                        className={`${listSortBy === 'contact_count' && listSortOrder === 'desc' ? 'bg-accent' : ''}`}
                      >
                        Contactos (mayor a menor)
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setListSortBy('created_at');
                          setListSortOrder('asc');
                        }}
                        className={`${listSortBy === 'created_at' && listSortOrder === 'asc' ? 'bg-accent' : ''}`}
                      >
                        Fecha (más antigua)
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setListSortBy('created_at');
                          setListSortOrder('desc');
                        }}
                        className={`${listSortBy === 'created_at' && listSortOrder === 'desc' ? 'bg-accent' : ''}`}
                      >
                        Fecha (más reciente)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="flex gap-2 items-center">
                  {!showNewListForm && (
                    <Button
                      size="sm"
                      className="h-9"
                      onClick={() => setShowNewListForm(true)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Agregar
                    </Button>
                  )}
                  
                  <Dialog open={showImportListDialog} onOpenChange={setShowImportListDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Upload className="h-3.5 w-3.5 mr-1" /> Importar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Importar listas</DialogTitle>
                        <DialogDescription>
                          Sube un archivo CSV o Excel con tus listas.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {!parsedLists.length ? (
                          <>
                            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                              <Input 
                                type="file" 
                                accept=".csv,.xlsx,.xls" 
                                className="mx-auto"
                                onChange={(e) => setImportListFile(e.target.files ? e.target.files[0] : null)}
                                disabled={isImportingList}
                              />
                              <p className="text-sm text-gray-500 mt-2">
                                Formatos soportados: CSV, Excel
                              </p>
                            </div>
                            <Button 
                              className="w-full" 
                              onClick={handleUploadListFile}
                              disabled={!importListFile || isImportingList}
                            >
                              {isImportingList ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Procesando...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Procesar archivo
                                </>
                              )}
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="rounded-md border p-4">
                              <p className="font-medium">Listas encontradas: {parsedLists.length}</p>
                              <div className="mt-2 max-h-40 overflow-auto">
                                <ul className="text-sm space-y-1">
                                  {parsedLists.slice(0, 5).map((list, idx) => (
                                    <li key={idx} className="flex justify-between">
                                      <span>{list.name}</span>
                                      <span className="text-gray-500">{list.description}</span>
                                    </li>
                                  ))}
                                  {parsedLists.length > 5 && (
                                    <li className="text-center text-gray-500">
                                      Y {parsedLists.length - 5} más...
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </div>
                            <Button 
                              className="w-full" 
                              onClick={handleImportLists}
                              disabled={isImportingList}
                            >
                              {isImportingList ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Importando...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Importar {parsedLists.length} listas
                                </>
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Exportar
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Formato de exportación</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleExportLists}>
                        <FileDown className="h-4 w-4 mr-2" /> CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportListsPDF}>
                        <FileDown className="h-4 w-4 mr-2" /> PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportListsExcel}>
                        <FileDown className="h-4 w-4 mr-2" /> Excel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-9"
                    disabled={!selectedLists.length}
                    onClick={handleDeleteSelectedLists}
                  >
                    Eliminar seleccionadas
                  </Button>
                </div>
              </div>
              
              {/* Formulario para crear nueva lista */}
              {showNewListForm && (
                <div className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50">
                  <h4 className="font-medium mb-3">Nueva lista</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="block mb-1">Nombre de la lista <span className="text-red-500">*</span></Label>
                      <Input
                        type="text"
                        placeholder="Nombre de la lista"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label className="block mb-1">Descripción (opcional)</Label>
                      <Input
                        type="text"
                        placeholder="Descripción de la lista"
                        value={newListDescription}
                        onChange={(e) => setNewListDescription(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowNewListForm(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleCreateList}
                        disabled={!newListName || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creando...
                          </>
                        ) : (
                          "Crear"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Visualización tipo lista con secciones */}
              <div className="flex flex-col gap-3">
                {currentLists.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No tienes listas creadas</p>
                    <Button 
                      variant="link" 
                      onClick={() => setShowNewListForm(true)}
                    >
                      Crear una lista
                    </Button>
                  </div>
                ) : (
                  currentLists.map((list) => (
                    <div 
                      key={list.id} 
                      className="rounded-md border shadow-sm bg-white flex flex-col relative"
                      style={{
                        borderLeft: `8px solid hsl(${(list.id * 47) % 360}, 70%, 60%)`
                      }}
                    >
                      {/* Encabezado */}
                      <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b">
                        <span style={{fontSize: 22}}>
                          {String.fromCodePoint(0x1F4C1 + (list.id % 10))}
                        </span>
                        <span className="font-medium text-lg">{list.name}</span>
                        <span className="ml-auto text-xs text-gray-400">
                          ID: {list.id}
                        </span>
                        {/* Checkbox para selección múltiple */}
                        <input
                          type="checkbox"
                          className="ml-4 w-5 h-5"
                          checked={selectedLists.includes(list.id)}
                          onChange={() => handleListSelection(list.id)}
                          title="Seleccionar lista"
                        />
                      </div>
                      {/* Descripción */}
                      {list.description && (
                        <div className="px-4 py-2 text-gray-600 text-sm border-b">
                          {list.description}
                        </div>
                      )}
                      {/* Sección de estado y correo */}
                      <div className="flex flex-row flex-wrap items-center gap-4 px-4 py-2 border-b bg-gray-50">
                        <div>
                          <Badge variant="secondary">{list.contact_count || 0} contactos</Badge>
                        </div>
                      </div>
                      {/* Sección de acciones y edición */}
                      <div className="flex flex-wrap gap-2 px-4 py-3 items-center justify-between">
                        {editingListId === list.id ? (
                          <div className="flex flex-col w-full gap-2">
                            <div>
                              <Label className="block mb-1">Nombre de la lista <span className="text-red-500">*</span></Label>
                              <Input
                                type="text"
                                value={editedListName}
                                onChange={(e) => setEditedListName(e.target.value)}
                                autoFocus
                                className="w-full"
                                placeholder="Nombre de la lista"
                              />
                            </div>
                            <div>
                              <Label className="block mb-1">Descripción (opcional)</Label>
                              <Input
                                type="text"
                                value={editedListDescription}
                                onChange={(e) => setEditedListDescription(e.target.value)}
                                className="w-full"
                                placeholder="Descripción de la lista"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={cancelEditList}
                              >
                                <X className="h-4 w-4 mr-1" /> Cancelar
                              </Button>
                              <Button 
                                size="sm"
                                onClick={saveEditedList}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    Guardando...
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-1" /> Guardar
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewList(list.id)}
                              >
                                Ver
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => startEditingList(list)}
                              >
                                <PenLine className="h-4 w-4 mr-1" /> Editar
                              </Button>
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => handleDuplicateList(list)}
                              >
                                Duplicar
                              </Button>
                              {/* Reemplazar el botón de exportación por un DropdownMenu */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    title="Exportar lista"
                                  >
                                    <Upload className="h-4 w-4 mr-1" />
                                    Exportar
                                    <ChevronDown className="h-3 w-3 ml-1" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuLabel>Formato de exportación</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleExportSingleList(list.id)}>
                                    <FileDown className="h-4 w-4 mr-2" /> CSV
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleExportSingleListExcel(list.id, list.name)}>
                                    <FileDown className="h-4 w-4 mr-2" /> Excel
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleExportSingleListPDF(list.id, list.name)}>
                                    <FileDown className="h-4 w-4 mr-2" /> PDF
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteList(list.id)}
                            >
                              Eliminar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {/* Paginación de listas (abajo) */}
              <div className="mt-4">
                <Pagination className="pagination-fixed-container">
                  <PaginationContent className="pagination-fixed-content">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={handleListPreviousPage}
                        disabled={listCurrentPage === 1}
                      />
                    </PaginationItem>

                    {getFixedPageNumbers(listCurrentPage, listTotalPages).map((pageNum, index) => {
                      if (pageNum === -1 || pageNum === -2) {
                        return (
                          <PaginationItem key={`list-ellipsis-${index}`} className="pagination-fixed-item">
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      
                      return (
                        <PaginationItem key={`list-${pageNum}`} className="pagination-fixed-item">
                          <PaginationLink
                            isActive={listCurrentPage === pageNum}
                            onClick={() => handleListPageClick(pageNum)}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={handleListNextPage}
                        disabled={listCurrentPage === listTotalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                <div className="text-center mt-2">
                  <p className="text-sm text-gray-500">
                    Mostrando página {listCurrentPage} de {listTotalPages} 
                    ({filteredLists.length} resultados)
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Agregar el Dialog para visualizar contactos de una lista */}
      <Dialog open={showListViewDialog} onOpenChange={setShowListViewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Contactos de la lista: {viewingList?.name}
            </DialogTitle>
            <DialogDescription>
              {filteredListViewContacts.length} contactos encontrados
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm">
              <input
                type="checkbox"
                checked={showInactiveContacts}
                onChange={() => setShowInactiveContacts(!showInactiveContacts)}
                className="mr-1"
              />
              Mostrar inactivos
            </label>
          </div>
          <ScrollArea className="h-[500px] rounded-md border">
            {isLoadingListViewContacts ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <p className="mt-2 text-gray-500">Cargando contactos...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredListViewContacts.length === 0 ? (
                    <TableRow key="no-contacts-row">
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        No hay contactos en esta lista
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredListViewContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{(contact?.name || '').substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span>{contact.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>
                          <Badge variant={contact.status === 'active' ? 'default' : 'secondary'}>
                            {contact.status === 'active' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFromList(contact.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Eliminar de la lista"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para editar contacto */}
      <Dialog open={showEditContactDialog} onOpenChange={setShowEditContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar contacto</DialogTitle>
            <DialogDescription>
              Actualiza la información del contacto.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                value={editContactName}
                onChange={(e) => setEditContactName(e.target.value)}
                placeholder="Nombre del contacto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Correo electrónico</Label>
              <Input
                id="edit-email"
                type="email"
                value={editContactEmail}
                onChange={(e) => setEditContactEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowEditContactDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateContact}
              disabled={!editContactName || !editContactEmail || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmación para eliminar contacto */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar contacto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de eliminar a {deletingContact?.name}? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteContact}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar contacto"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <footer className="bg-gray-100 py-4 border-t">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2025 Programa de Cultura Digital - Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
};

export default Contacts;