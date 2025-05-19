import React, { useState, useEffect, useMemo } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Search, Download, Check, X, MailOpen, Loader2, Mail, Eye, Pencil, ChevronDown, FileDown, Calendar as CalendarIcon } from 'lucide-react';
import Navbar from "@/components/Navbar";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmailHistory, getEmailHistory } from "@/utils/emailService";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Notifications = () => {
  const [emails, setEmails] = useState<EmailHistory[]>([]);
  const [scheduledEmails, setScheduledEmails] = useState<EmailHistory[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<EmailHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalEmails, setTotalEmails] = useState(0);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<EmailHistory | null>(null);
  const [editingEmail, setEditingEmail] = useState<EmailHistory | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editTo, setEditTo] = useState('');
  const [editTitulo, setEditTitulo] = useState('');
  const [editSubtitulo, setEditSubtitulo] = useState('');
  const [editContenido, setEditContenido] = useState('');
  const [editHtml, setEditHtml] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Nuevos estados para filtrado por fecha
  const [dateFilter, setDateFilter] = useState<'all' | 'specific' | 'range'>('all');
  const [dateOrder, setDateOrder] = useState<'desc' | 'asc'>('desc');
  const [specificDate, setSpecificDate] = useState<Date | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({
    from: undefined,
    to: undefined
  });

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    console.log("Cargando correos enviados y programados...");

    loadEmails()
      .then(() => {
        if (isMounted) console.log("Correos enviados cargados exitosamente");
      })
      .catch(err => {
        console.error("Error al cargar correos enviados:", err);
      });

    loadScheduledEmails()
      .then(() => {
        if (isMounted) console.log("Correos programados cargados exitosamente");
      })
      .catch(err => {
        console.error("Error al cargar correos programados:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const loadEmails = async () => {
    try {
      const response = await getEmailHistory(1, 100);
      setEmails(response.data);
      setTotalEmails(response.pagination.total);
    } catch (error) {
      console.error('Error al cargar historial de emails:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el historial de correos enviados",
        variant: "destructive",
      });
    }
  };

  const loadScheduledEmails = async () => {
    try {
      console.log("Iniciando carga de correos programados...");
      const token = localStorage.getItem('token');

      if (!token) {
        console.error("No hay token disponible para cargar correos programados");
        return;
      }

      console.log("Enviando solicitud de correos programados...");
      const response = await axios.get('/api/scheduled-emails', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, limit: 100 }
      });

      console.log("Respuesta de correos programados:", response.data);

      if (response.data && Array.isArray(response.data.data)) {
        const scheduled = response.data.data.map((item: any) => ({
          id: item.id,
          subject: item.subject || "Sin asunto",
          status: item.status === 'pending' ? 'scheduled' : item.status,
          to_email: Array.isArray(item.to_email)
            ? item.to_email
            : typeof item.to_email === 'string'
              ? item.to_email.split(',')
              : ["Sin destinatario"],
          timestamp: item.scheduled_for || new Date().toISOString(),
          from_email: item.from_email || "",
          from_name: item.from_name || "",
          content_preview: item.html_content || "",
          titulo_principal: item.titulo_principal || "",
          subtitulo: item.subtitulo || "",
          contenido: item.contenido || "",
        }));

        console.log(`Número de correos programados procesados: ${scheduled.length}`);
        setScheduledEmails(scheduled);
      } else {
        console.warn("No se recibieron datos de correos programados o el formato no es válido");
        setScheduledEmails([]);
      }
    } catch (error) {
      console.error('Error al cargar correos programados:', error);
      setScheduledEmails([]);
      throw error;
    }
  };

  const allEmails = useMemo(() => {
    console.log(`Combinando correos: ${scheduledEmails.length} programados y ${emails.length} enviados`);
    return [
      ...scheduledEmails,
      ...emails
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [scheduledEmails, emails]);

  useEffect(() => {
    let filtered = allEmails;

    if (searchTerm) {
      filtered = filtered.filter(
        email =>
          email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.to_email.some(recipient => recipient.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (email.titulo_principal && email.titulo_principal.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(email => {
        if (statusFilter === 'scheduled') {
          return email.status === 'scheduled' || email.status === 'pending';
        }
        if (statusFilter === 'sent') {
          return email.status === 'sent';
        }
        return true;
      });
    }

    // Aplicar filtros de fecha
    if (dateFilter === 'specific' && specificDate) {
      const startOfDay = new Date(specificDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(specificDate);
      endOfDay.setHours(23, 59, 59, 999);

      filtered = filtered.filter(email => {
        const emailDate = new Date(email.timestamp);
        return emailDate >= startOfDay && emailDate <= endOfDay;
      });
    } else if (dateFilter === 'range' && (dateRange.from || dateRange.to)) {
      if (dateRange.from) {
        const startDate = new Date(dateRange.from);
        startDate.setHours(0, 0, 0, 0);
        filtered = filtered.filter(email => new Date(email.timestamp) >= startDate);
      }

      if (dateRange.to) {
        const endDate = new Date(dateRange.to);
        endDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(email => new Date(email.timestamp) <= endDate);
      }
    }

    // Ordenar por fecha
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredEmails(filtered);

    const calculatedTotalPages = Math.ceil(filtered.length / itemsPerPage);
    if (calculatedTotalPages > 0 && currentPage > calculatedTotalPages) {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter, allEmails, itemsPerPage, dateFilter, dateOrder, specificDate, dateRange]);

  const paginatedEmails = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEmails.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEmails, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handleFirstPage = () => setCurrentPage(1);
  const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handleLastPage = () => setCurrentPage(totalPages);
  const handlePageClick = (pageNum: number) => setCurrentPage(pageNum);

  const getPageNumbers = () => {
    const fixedVisiblePages = 5;

    if (totalPages <= fixedVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(fixedVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    const endPage = Math.min(totalPages, startPage + fixedVisiblePages - 1);

    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - fixedVisiblePages + 1);
    }

    const pageNumbers = [];

    pageNumbers.push(1);

    if (startPage > 2) {
      pageNumbers.push(-1);
    }

    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== totalPages) {
        pageNumbers.push(i);
      }
    }

    if (endPage < totalPages - 1) {
      pageNumbers.push(-2);
    }

    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateSpanish = (date: Date) => {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: es });
  };

  const resetDateFilters = () => {
    setDateFilter('all');
    setSpecificDate(undefined);
    setDateRange({ from: undefined, to: undefined });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Check className="h-5 w-5 text-green-500" />;
      case 'opened': return <MailOpen className="h-5 w-5 text-blue-500" />;
      case 'failed': return <X className="h-5 w-5 text-red-500" />;
      case 'scheduled': return <Mail className="h-5 w-5 text-yellow-500" />;
      case 'pending': return <Mail className="h-5 w-5 text-yellow-500" />;
      default: return <Mail className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent': return 'Enviado';
      case 'opened': return 'Abierto';
      case 'failed': return 'Fallido';
      case 'scheduled': return 'Programado';
      case 'pending': return 'Programado';
      default: return 'Desconocido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800 border-green-200';
      case 'opened': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'scheduled':
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const truncate = (text: string, length: number) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Destinatario", "Asunto", "Estado", "Fecha"];

    const csvContent = [
      headers.join(','),
      ...emails.map(email => [
        email.id,
        email.to_email.join(';'),
        `"${email.subject.replace(/"/g, '""')}"`,
        getStatusText(email.status),
        new Date(email.timestamp).toISOString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `historial-emails-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportación CSV completada",
      description: "El historial de correos ha sido exportado en formato CSV.",
    });
  };

  const handleExportExcel = () => {
    const data = [
      ["ID", "Destinatario", "Asunto", "Estado", "Fecha", "Título", "Subtítulo"]
    ];

    filteredEmails.forEach(email => {
      data.push([
        email.id,
        Array.isArray(email.to_email) ? email.to_email.join('; ') : email.to_email,
        email.subject,
        getStatusText(email.status),
        new Date(email.timestamp).toLocaleDateString(),
        email.titulo_principal || '',
        email.subtitulo || ''
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historial de Correos");

    const wscols = [
      { wch: 10 },
      { wch: 40 },
      { wch: 40 },
      { wch: 15 },
      { wch: 20 },
      { wch: 30 },
      { wch: 30 }
    ];
    ws['!cols'] = wscols;

    XLSX.writeFile(wb, `historial-emails-${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Exportación Excel completada",
      description: "El historial de correos ha sido exportado en formato Excel.",
    });
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF('landscape');

      doc.setFontSize(18);
      doc.text("Historial de Correos Electrónicos", 14, 22);

      doc.setFontSize(11);
      doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 30);

      const tableColumn = ["ID", "Destinatario", "Asunto", "Estado", "Fecha"];
      const tableRows = [];

      filteredEmails.forEach(email => {
        const emailData = [
          email.id,
          Array.isArray(email.to_email) ? email.to_email.join('; ') : email.to_email,
          email.subject,
          getStatusText(email.status),
          new Date(email.timestamp).toLocaleDateString()
        ];
        tableRows.push(emailData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 80 },
          2: { cellWidth: 80 },
          3: { cellWidth: 30 },
          4: { cellWidth: 30 }
        },
        didDrawPage: (data) => {
          doc.setFontSize(8);
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          doc.text(`Página ${data.pageNumber}`, data.settings.margin.left, pageHeight - 10);
        }
      });

      doc.save(`historial-emails-${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "Exportación PDF completada",
        description: "El historial de correos ha sido exportado en formato PDF.",
      });
    } catch (error) {
      console.error("Error al exportar a PDF:", error);
      toast({
        title: "Error en la exportación",
        description: "No se pudo generar el PDF. Verifica que todas las dependencias estén cargadas correctamente.",
        variant: "destructive",
      });
    }
  };

  const handlePreviewEmail = (email: EmailHistory) => {
    setPreviewEmail(email);

    let cleanHtml = '';

    if (email.content_preview) {
      cleanHtml = email.content_preview
        .replace(/<!DOCTYPE[^>]*>/gi, '')
        .replace(/<html[^>]*>[\s\S]*?<body[^>]*>/gi, '')
        .replace(/<\/body>[\s\S]*?<\/html>/gi, '');

      cleanHtml = cleanHtml.replace(/<table[^>]*>\s*<tr>\s*<td[^>]*>\s*<table/gi, '<div');
      cleanHtml = cleanHtml.replace(/<\/table>\s*<\/td>\s*<\/tr>\s*<\/table>/gi, '</div>');

      cleanHtml = cleanHtml.replace(/<style[\s\S]*?<\/style>/gi, '');
      cleanHtml = cleanHtml.replace(/<script[\s\S]*?<\/script>/gi, '');
    }

    setPreviewContent(cleanHtml);
    setShowPreviewDialog(true);
  };

  const handleEditEmail = (email: EmailHistory) => {
    console.log("Editando correo programado:", email);
    setEditingEmail(email);
    setEditSubject(email.subject || "");
    setEditTo(Array.isArray(email.to_email) ? email.to_email.join(', ') : email.to_email || "");
    setEditTitulo(email.titulo_principal || "");
    setEditSubtitulo(email.subtitulo || "");
    setEditContenido(email.contenido || "");
    setEditHtml(email.content_preview || "");
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingEmail) return;
    setIsSavingEdit(true);
    try {
      console.log(`Guardando cambios para correo ID ${editingEmail.id}`);
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error("No hay token de autenticación disponible");
      }

      const response = await axios.put(`/api/scheduled-emails/${editingEmail.id}`, {
        subject: editSubject,
        to_email: editTo.split(',').map(e => e.trim()),
        html_content: editHtml,
        titulo_principal: editTitulo,
        subtitulo: editSubtitulo,
        contenido: editContenido,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Respuesta de edición:", response.data);

      toast({
        title: "Correo actualizado",
        description: "El correo programado ha sido actualizado correctamente.",
      });

      setEditDialogOpen(false);
      setEditingEmail(null);

      await Promise.all([loadEmails(), loadScheduledEmails()]);
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el correo programado.",
        variant: "destructive",
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .pagination-fixed-container {
        width: 100%;
        display: flex;
        justify-content: center;
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

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <Navbar />

      <main className="py-8 container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Historial de Correos</h1>
            <p className="text-gray-600">Consulta el registro de todos los correos enviados y programados desde la plataforma</p>
          </div>

          <div className="p-4">
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log("Estado actual:");
                  console.log("- Correos programados:", scheduledEmails);
                  console.log("- Correos enviados:", emails);
                  console.log("- Correos combinados:", allEmails);
                  console.log("- Correos filtrados:", filteredEmails);

                  toast({
                    title: "Info de depuración",
                    description: `Programados: ${scheduledEmails.length}, Enviados: ${emails.length}, Total: ${allEmails.length}`,
                  });

                  loadScheduledEmails();
                }}
              >
                Recargar correos
              </Button>
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por asunto o destinatario..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="sent">Enviados</SelectItem>
                    <SelectItem value="scheduled">Programados</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtro de orden de fecha */}
                <Select
                  value={dateOrder}
                  onValueChange={(value: 'asc' | 'desc') => setDateOrder(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ordenar por fecha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Más recientes primero</SelectItem>
                    <SelectItem value="asc">Más antiguos primero</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtro de fecha específica */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-[200px] justify-start text-left font-normal ${dateFilter !== 'all' ? "border-primary" : ""}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilter === 'specific' && specificDate ? (
                        formatDateSpanish(specificDate)
                      ) : dateFilter === 'range' && (dateRange.from || dateRange.to) ? (
                        <>
                          {dateRange.from ? formatDateSpanish(dateRange.from) : "Desde inicio"} -
                          {dateRange.to ? formatDateSpanish(dateRange.to) : "Hasta hoy"}
                        </>
                      ) : (
                        "Filtrar por fecha"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 border-b">
                      <div className="space-y-2">
                        <div className="font-medium">Filtrar por:</div>
                        <div className="flex gap-2">
                          <Button
                            variant={dateFilter === 'specific' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setDateFilter('specific')}
                          >
                            Fecha específica
                          </Button>
                          <Button
                            variant={dateFilter === 'range' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setDateFilter('range')}
                          >
                            Rango de fechas
                          </Button>
                        </div>
                      </div>
                    </div>

                    {dateFilter === 'specific' ? (
                      <Calendar
                        mode="single"
                        selected={specificDate}
                        onSelect={(date) => {
                          setSpecificDate(date);
                          if (date) setDateFilter('specific');
                        }}
                        initialFocus
                      />
                    ) : dateFilter === 'range' ? (
                      <Calendar
                        mode="range"
                        selected={{
                          from: dateRange.from,
                          to: dateRange.to,
                        }}
                        onSelect={(range) => {
                          setDateRange({
                            from: range?.from,
                            to: range?.to,
                          });
                          if (range?.from || range?.to) setDateFilter('range');
                        }}
                        initialFocus
                      />
                    ) : null}

                    <div className="p-3 border-t">
                      <div className="flex justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetDateFilters}
                        >
                          Reset
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            if (dateFilter === 'specific' && !specificDate) {
                              setDateFilter('all');
                            } else if (dateFilter === 'range' && !dateRange.from && !dateRange.to) {
                              setDateFilter('all');
                            }
                          }}
                        >
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Formato de exportación</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleExportCSV}>
                      <FileDown className="h-4 w-4 mr-2" /> CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportExcel}>
                      <FileDown className="h-4 w-4 mr-2" /> Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportPDF}>
                      <FileDown className="h-4 w-4 mr-2" /> PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Indicadores de filtros activos */}
            {(dateFilter !== 'all' || searchTerm || statusFilter !== 'all') && (
              <div className="flex flex-wrap items-center gap-2 mb-4 bg-blue-50 p-2 rounded-md">
                <span className="font-medium text-sm text-blue-700">Filtros activos:</span>

                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Estado: {statusFilter === 'sent' ? 'Enviados' : 'Programados'}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 ml-1 p-0"
                      onClick={() => setStatusFilter('all')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {dateFilter === 'specific' && specificDate && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Fecha: {formatDateSpanish(specificDate)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 ml-1 p-0"
                      onClick={() => {
                        setDateFilter('all');
                        setSpecificDate(undefined);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {dateFilter === 'range' && (dateRange.from || dateRange.to) && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Periodo: {dateRange.from ? formatDateSpanish(dateRange.from) : "Inicio"} -
                    {dateRange.to ? formatDateSpanish(dateRange.to) : "Hoy"}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 ml-1 p-0"
                      onClick={() => {
                        setDateFilter('all');
                        setDateRange({ from: undefined, to: undefined });
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {searchTerm && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Búsqueda: "{searchTerm}"
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 ml-1 p-0"
                      onClick={() => setSearchTerm('')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-blue-700"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    resetDateFilters();
                  }}
                >
                  Limpiar todos
                </Button>
              </div>
            )}

            <ScrollArea className="h-[600px]">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  <p className="mt-2 text-gray-500">Cargando historial de correos...</p>
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="h-12 w-12 mx-auto text-gray-300" />
                  <p className="mt-2">No se encontraron correos {statusFilter !== 'all' ? `con estado "${getStatusText(statusFilter)}"` : ""}</p>
                  {scheduledEmails.length === 0 && (
                    <p className="text-sm mt-2 text-orange-500">No hay correos programados disponibles</p>
                  )}
                </div>
              ) : (
                <div className="grid gap-3">
                  {paginatedEmails.map((email) => (
                    <Card key={email.id} className="overflow-hidden">
                      <div className={`h-2 ${getStatusColor(email.status).split(' ')[0]}`}></div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{email.subject}</CardTitle>
                          <Badge variant="outline" className={getStatusColor(email.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(email.status)}
                              {getStatusText(email.status)}
                            </span>
                          </Badge>
                        </div>
                        <CardDescription>
                          <span className="font-semibold">Para:</span> {email.to_email.join(', ')}
                        </CardDescription>

                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex justify-end gap-2">
                          {(email.status === 'scheduled' || email.status === 'pending') && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-yellow-700"
                              onClick={() => handleEditEmail(email)}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600"
                            onClick={() => handlePreviewEmail(email)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Previsualizar
                          </Button>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-1 pb-3 text-sm text-gray-500">
                        <div className="flex justify-between w-full">
                          <span>
                            <span className="font-medium"></span>
                          </span>
                          <span>
                            {formatDate(email.timestamp)}
                          </span>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>

            {!isLoading && totalPages > 1 && (
              <div className="mt-4">
                <Pagination className="pagination-fixed-container">
                  <PaginationContent className="pagination-fixed-content">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>

                    {getPageNumbers().map((pageNum, index) => {
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
                    ({filteredEmails.length} resultados)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar correo programado</DialogTitle>
            <DialogDescription>
              Puedes editar todos los campos del correo programado antes de su envío.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block mb-1 font-medium">Asunto</label>
              <Input
                value={editSubject}
                onChange={e => setEditSubject(e.target.value)}
                placeholder="Asunto del correo"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Destinatarios</label>
              <Input
                value={editTo}
                onChange={e => setEditTo(e.target.value)}
                placeholder="Correos separados por coma"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Título principal</label>
              <Input
                value={editTitulo}
                onChange={e => setEditTitulo(e.target.value)}
                placeholder="Título principal"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Subtítulo</label>
              <Input
                value={editSubtitulo}
                onChange={e => setEditSubtitulo(e.target.value)}
                placeholder="Subtítulo"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Contenido</label>
              <Textarea
                value={editContenido}
                onChange={e => setEditContenido(e.target.value)}
                placeholder="Contenido del correo"
                rows={4}
              />
            </div>

          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSavingEdit}>
              {isSavingEdit ? (
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

      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {previewEmail?.subject}
            </DialogTitle>
            <DialogDescription>
              <div className="flex flex-col text-sm mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <span><strong>De:</strong> {previewEmail?.from_email} </span>
                  <span><strong>Enviado:</strong> {previewEmail && formatDate(previewEmail.timestamp)}</span>
                  <span><strong>Para:</strong> {previewEmail?.to_email?.join(', ')}</span>
                  <span><strong>Estado:</strong> {previewEmail && getStatusText(previewEmail.status)}</span>
                  <span><strong>Organización:</strong> {previewEmail?.from_name || 'No disponible'}</span>

                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
            <h3 className="font-semibold text-lg mb-2">Detalles del contenido</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Título principal:</strong> {previewEmail?.titulo_principal || 'No disponible'}</p>
                <p><strong>Subtítulo:</strong> {previewEmail?.subtitulo || 'No disponible'}</p>
              </div>

            </div>
            {previewEmail?.contenido && (
              <div className="mt-2">
                <p><strong>Contenido:</strong></p>
                <div className="mt-1 p-3 bg-white border rounded-md">
                  {previewEmail.contenido}
                </div>
              </div>
            )}
          </div>

          <div className="border rounded-md overflow-hidden">
            <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex justify-between items-center">
              <h3 className="font-medium text-blue-700">Vista previa del correo</h3>
            </div>
            <div className="p-4 bg-white">
              {previewContent ? (
                <iframe
                  title="Vista previa HTML"
                  srcDoc={previewContent}
                  style={{ width: "100%", minHeight: "400px", border: "none" }}
                />
              ) : (
                <div className="flex items-center justify-center h-40 text-gray-400">
                  No hay contenido HTML disponible para previsualizar
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowPreviewDialog(false)}>
              Cerrar
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

export default Notifications;
