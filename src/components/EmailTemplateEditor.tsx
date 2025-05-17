import { useState, useMemo, useCallback, memo } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Users, Send, Loader2, ExternalLink, Calendar as CalendarIcon, Video, Search, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TemplateOne from "./email-templates/TemplateOne";
import TemplateTwo from "./email-templates/TemplateTwo";
import TemplateThree from "./email-templates/TemplateThree";
import TemplateFour from "./email-templates/TemplateFour";
import TemplateFive from "./email-templates/TemplateFive";
import TemplateSix from "./email-templates/TemplateSix";
import TemplateSeven from "./email-templates/TemplateSeven";
import TemplateEight from "./email-templates/TemplateEight";
import TemplateNine from "./email-templates/TemplateNine";
import ThirteenTemplate from "./email-templates/ThirteenTemplate";
import FourteenTemplate from "./email-templates/FourteenTemplate";
import FifteenTemplate from "./email-templates/FifteenTemplate";
import VideoTemplate from "./email-templates/VideoTemplate";
import { sendEmail, parseEmailList } from "@/utils/emailService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/use-mobile";
import axios from "axios";

const ContactsSelectorContent = ({
  contacts,
  lists,
  selectedContacts,
  setSelectedContacts,
  selectedLists,
  setSelectedLists,
  contactsTab,
  setContactsTab,
  contactSearchTerm,
  setContactSearchTerm,
  filteredContacts,
}) => {
  const token = localStorage.getItem('token');
  const [internalSelectedContacts, setInternalSelectedContacts] = useState(selectedContacts);
  const [internalSelectedLists, setInternalSelectedLists] = useState(selectedLists);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [localContactsTab, setLocalContactsTab] = useState(contactsTab);

  useEffect(() => {
    setInternalSelectedContacts(selectedContacts);
  }, [selectedContacts]);

  useEffect(() => {
    setInternalSelectedLists(selectedLists);
  }, [selectedLists]);

  useEffect(() => {
    if (contactsTab !== localContactsTab) {
      setLocalContactsTab(contactsTab);
    }
  }, [contactsTab]);

  const handleTabChange = useCallback((value) => {
    setLocalContactsTab(value);
    setContactsTab(value);
  }, [setContactsTab]);

  const handleSelectList = useCallback(async (listId) => {
    setIsLoadingLists(true);

    try {
      if (internalSelectedLists.includes(listId)) {
        const newSelectedLists = internalSelectedLists.filter(id => id !== listId);
        setInternalSelectedLists(newSelectedLists);

        if (newSelectedLists.length === 0) {
          setInternalSelectedContacts([]);
            setSelectedLists(newSelectedLists);
            setSelectedContacts([]);
        } else {
          let allContactEmails = [];
          for (const listToLoad of newSelectedLists) {
            const response = await axios.get(`/api/lists/${listToLoad}/contacts`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const contactEmails = response.data.map(c => c.email);
            allContactEmails = [...allContactEmails, ...contactEmails];
          }

          const uniqueEmails = [...new Set(allContactEmails)];
          setInternalSelectedContacts(uniqueEmails);

            setSelectedLists(newSelectedLists);
            setSelectedContacts(uniqueEmails);
        }
      } else {
        const response = await axios.get(`/api/lists/${listId}/contacts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const contactEmails = response.data.map(c => c.email);

        const newSelectedLists = [...internalSelectedLists, listId];
        setInternalSelectedLists(newSelectedLists);

        const allEmails = [...internalSelectedContacts, ...contactEmails];
        const uniqueEmails = [...new Set(allEmails)];
        setInternalSelectedContacts(uniqueEmails);

          setSelectedLists(newSelectedLists);
          setSelectedContacts(uniqueEmails);
      }
    } catch (err) {
      console.error("Error gestionando lista:", err);
    } finally {
      setIsLoadingLists(false);
    }
  }, [internalSelectedLists, internalSelectedContacts, token, setSelectedLists, setSelectedContacts]);

  const toggleContact = useCallback((email) => {
    setInternalSelectedContacts(prev => {
      const included = prev.includes(email);
      const newContacts = included
        ? prev.filter(e => e !== email)
        : [...prev, email];

        setSelectedContacts(newContacts);


      return newContacts;
    });
  }, [setSelectedContacts]);

  return (
    <div className="space-y-4">
      <Tabs
        defaultValue={localContactsTab}
        value={localContactsTab}
        onValueChange={handleTabChange}
        className="selection-tabs"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contacts">Contactos</TabsTrigger>
          <TabsTrigger value="lists">Listas</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar contactos..."
              className="pl-9"
              value={contactSearchTerm}
              onChange={(e) => setContactSearchTerm(e.target.value)}
            />
          </div>

          <div className="border rounded-md h-[400px] overflow-y-auto p-2">
            {filteredContacts.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                No se encontraron contactos
              </div>
            ) : (
              <div className="space-y-2">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`p-2 rounded-md flex items-center justify-between hover:bg-gray-100 cursor-pointer ${
                      internalSelectedContacts.includes(contact.email) ? "bg-blue-50 border border-blue-200" : ""
                    }`}
                    onClick={() => toggleContact(contact.email)}
                  >
                    <div>
                      <div className="font-medium">{contact.name || "Sin nombre"}</div>
                      <div className="text-xs text-gray-500">{contact.email}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border ${
                      internalSelectedContacts.includes(contact.email)
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300"
                    }`}>
                      {internalSelectedContacts.includes(contact.email) && (
                        <Check className="w-4 h-4 text-white mx-auto" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {internalSelectedContacts.length > 0 && (
            <div className="text-sm text-gray-600 font-medium">
              {internalSelectedContacts.length} contacto(s) seleccionado(s)
            </div>
          )}
        </TabsContent>

        <TabsContent value="lists" className="space-y-4">
          <div className="border rounded-md h-[400px] overflow-y-auto p-2 relative">
            {isLoadingLists && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            )}

            {lists.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                No se encontraron listas
              </div>
            ) : (
              <div className="space-y-2">
                {lists.map((list) => (
                  <div
                    key={list.id}
                    className={`p-2 rounded-md hover:bg-gray-100 cursor-pointer ${
                      internalSelectedLists.includes(list.id.toString()) ? "bg-blue-50 border border-blue-200" : ""
                    }`}
                    onClick={() => handleSelectList(list.id.toString())}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{list.name}</div>
                        <div className="text-xs text-gray-500">
                          {list.contact_count || 0} contacto(s)
                        </div>
                        {list.description && (
                          <div className="text-xs text-gray-600 mt-1">{list.description}</div>
                        )}
                      </div>
                      <div className={`w-5 h-5 rounded-full border ${
                        internalSelectedLists.includes(list.id.toString())
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300"
                      }`}>
                        {internalSelectedLists.includes(list.id.toString()) && (
                          <Check className="w-4 h-4 text-white mx-auto" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {internalSelectedLists.length > 0 && (
            <div className="text-sm text-blue-600 font-medium">
              {internalSelectedLists.length} lista(s) seleccionada(s) con {internalSelectedContacts.length} contacto(s) únicos
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const EmailTemplateEditor = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [contactsDialogOpen, setContactsDialogOpen] = useState<boolean>(false);
  const [contactsTab, setContactsTab] = useState<"contacts" | "lists">("contacts");
  const [contactSearchTerm, setContactSearchTerm] = useState<string>("");

  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("template1");
  const [templateContent, setTemplateContent] = useState({
    subject: "",
    heading: "",
    subheading: "",
    content: "",
    buttonText: "Leer más",
    buttonUrl: "#",
    videoUrl: "https://youtu.be/X16kWXuBrdk", // Video de ejemplo predeterminado
    imageUrl: "",
  });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [emailTo, setEmailTo] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendMode, setSendMode] = useState<"individual" | "bulk">("individual");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Scheduling state
  const [isScheduling, setIsScheduling] = useState<boolean>(false);
  const [scheduleType, setScheduleType] = useState<"minutes" | "hours" | "days">("minutes");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(new Date());
  const [scheduledTime, setScheduledTime] = useState<string>("12:00");
  const [scheduledMinutes, setScheduledMinutes] = useState<number>(15);
  const [scheduledHours, setScheduledHours] = useState<number>(1);
  const [scheduledDays, setScheduledDays] = useState<number>(1);
  
  // Dialog/drawer state
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState<boolean>(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    // Si hay más de un contacto seleccionado, cambiar a masivo automáticamente
    if (selectedContacts.length > 1 && sendMode === "individual") {
      setSendMode("bulk");
    }
  }, [selectedContacts, sendMode]);

  const handleInputChange = (field: string, value: string) => {
    setTemplateContent({
      ...templateContent,
      [field]: value,
    });
  };

const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "El archivo seleccionado no es una imagen válida.",
        variant: "destructive",
      });
      return;
    }

    // Verificar tamaño máximo (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast({
        title: "Advertencia",
        description: "La imagen es demasiado grande (>5MB). Podría causar problemas en algunos clientes de correo.",
        variant: "warning",
      });
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      
      // Mostrar confirmación
      toast({
        title: "Imagen cargada",
        description: "La imagen se ha cargado correctamente y estará disponible en el correo.",
      });
    };
    reader.onerror = () => {
      toast({
        title: "Error",
        description: "No se pudo cargar la imagen. Intente con otra imagen.",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  }
};

  useEffect(() => {
    // Cargar contactos
    axios.get('/api/contacts', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => setContacts(res.data)).catch(() => setContacts([]));
    // Cargar listas
    axios.get('/api/lists', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => setLists(res.data)).catch(() => setLists([]));
  }, []);

  const handleImportContacts = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/contacts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Contactos importados:', res.data.contacts);
    } catch (err) {
      console.error('Error importando contactos:', err);
    }
  };

  const handleImportLists = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/lists/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Listas importadas:', res.data.lists);
    } catch (err) {
      console.error('Error importando listas:', err);
    }
  };

  const getCurrentImage = () => {
    if (uploadedImage) return uploadedImage;
    if (templateContent.imageUrl) return templateContent.imageUrl;
    return "https://via.placeholder.com/600x300";
  };

  const getTemplateComponent = () => {
    const templateProps = {
      subject: templateContent.subject,
      heading: templateContent.heading,
      subheading: templateContent.subheading,
      content: templateContent.content,
      buttonText: templateContent.buttonText,
      videoUrl: templateContent.videoUrl,
      buttonUrl: templateContent.buttonUrl,
      ...(selectedTemplate !== "videoTemplate" && { imageUrl: getCurrentImage() }),
    };

    switch (selectedTemplate) {
      case "template1": return <TemplateOne {...templateProps} />;
      case "template2": return <TemplateTwo {...templateProps} />;
      case "template3": return <TemplateThree {...templateProps} />;
      case "template4": return <TemplateFour {...templateProps} />;
      case "template5": return <TemplateFive {...templateProps} />;
      case "template6": return <TemplateSix {...templateProps} />;
      case "template7": return <TemplateSeven {...templateProps} />;
      case "template8": return <TemplateEight {...templateProps} />;
      case "template9": return <TemplateNine {...templateProps} />;
      case "template13": return <ThirteenTemplate {...templateProps} />;
      case "template14": return <FourteenTemplate {...templateProps} />;
      case "template15": return <FifteenTemplate {...templateProps} />;
      case "videoTemplate": return <VideoTemplate {...templateProps} />;
      default: return <TemplateOne {...templateProps} />;
    }
  };

  const getScheduledSendTime = (): Date => {
    const now = new Date();
    
    if (scheduleType === "minutes") {
      const futureTime = new Date(now.getTime() + scheduledMinutes * 60 * 1000);
      return futureTime;
    } else if (scheduleType === "hours") {
      const futureTime = new Date(now.getTime() + scheduledHours * 60 * 60 * 1000);
      return futureTime;
    } else if (scheduleType === "days") {
      if (scheduledDate) {
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        const scheduledDateTime = new Date(scheduledDate);
        scheduledDateTime.setHours(hours, minutes, 0, 0);
        return scheduledDateTime;
      } else {
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        const futureDate = new Date(now.getTime() + scheduledDays * 24 * 60 * 60 * 1000);
        futureDate.setHours(hours, minutes, 0, 0);
        return futureDate;
      }
    }
    
    return now;
  };

  const handleSendEmail = async () => {
    if (!templateContent.subject) {
      toast({
        title: "Error",
        description: "Por favor, ingrese un asunto para el correo.",
        variant: "destructive",
      });
      return;
    }
    
    if (!emailTo) {
      toast({
        title: "Error",
        description: "Por favor, ingrese al menos un destinatario.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    setPreviewUrl(null);
    
    try {
      const recipients = parseEmailList(emailTo);
      
      if (recipients.length === 0) {
        toast({
          title: "Error",
          description: "No se encontraron direcciones de correo válidas.",
          variant: "destructive",
        });
        setIsSending(false);
        return;
      }

      const result = await sendEmail({
        to: sendMode === "individual" ? recipients[0] : recipients,
        subject: templateContent.subject,
        htmlContent: "",
        templateId: selectedTemplate,
        templateProps: {
          subject: templateContent.subject,
          heading: templateContent.heading,
          subheading: templateContent.subheading,
          content: templateContent.content,
          videoUrl: templateContent.videoUrl,
          buttonText: templateContent.buttonText,
          buttonUrl: templateContent.buttonUrl,
          ...(selectedTemplate !== "videoTemplate" && { imageUrl: getCurrentImage() })
        }
      });

      if (result.success) {
        toast({
          title: "¡Éxito!",
          description: result.message || "Correo enviado exitosamente",
        });
        
        if (result.previewUrl) {
          setPreviewUrl(result.previewUrl);
        }
        
        setIsScheduleDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.message || "Ocurrió un error al enviar el correo",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al enviar correo:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Ocurrió un error al procesar el correo.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleScheduleEmail = async () => {
    if (!templateContent.subject) {
      toast({
        title: "Error",
        description: "Por favor, ingrese un asunto para el correo.",
        variant: "destructive",
      });
      return;
    }
    
    if (!emailTo) {
      toast({
        title: "Error",
        description: "Por favor, ingrese al menos un destinatario.",
        variant: "destructive",
      });
      return;
    }

    setIsScheduling(true);
    setPreviewUrl(null);
    
    try {
      const recipients = parseEmailList(emailTo);
      
      if (recipients.length === 0) {
        toast({
          title: "Error",
          description: "No se encontraron direcciones de correo válidas.",
          variant: "destructive",
        });
        setIsScheduling(false);
        return;
      }
      
      const scheduledTime = getScheduledSendTime();
      const formattedScheduledTime = format(scheduledTime, "PPpp", { locale: es });

      const result = await sendEmail({
        to: sendMode === "individual" ? recipients[0] : recipients,
        subject: templateContent.subject,
        htmlContent: "",
        templateId: selectedTemplate,
        templateProps: {
          subject: templateContent.subject,
          heading: templateContent.heading,
          subheading: templateContent.subheading,
          content: templateContent.content,
          videoUrl: templateContent.videoUrl,
          buttonText: templateContent.buttonText,
          buttonUrl: templateContent.buttonUrl,
          ...(selectedTemplate !== "videoTemplate" && { imageUrl: getCurrentImage() })
        },
        scheduledFor: scheduledTime.toISOString()
      });

      if (result.success) {
        toast({
          title: "¡Programado!",
          description: `El correo ha sido programado para: ${formattedScheduledTime}`,
        });
        
        setIsScheduleDialogOpen(false);
        
        setTimeout(() => {
          window.location.href = '/notifications';
        }, 2000);
      } else {
        toast({
          title: "Error",
          description: result.message || "Ocurrió un error al programar el correo",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al programar correo:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Ocurrió un error al programar el correo.",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const filteredContacts = useMemo(() => {
    if (!contactSearchTerm.trim()) return contacts;
    return contacts.filter(
      contact => 
        contact.name?.toLowerCase().includes(contactSearchTerm.toLowerCase()) || 
        contact.email.toLowerCase().includes(contactSearchTerm.toLowerCase())
    );
  }, [contacts, contactSearchTerm]);

  const applyContactSelection = useCallback(() => {
    if (selectedContacts.length > 0) {
      setEmailTo(selectedContacts.join(", "));
      toast({
        title: "Contactos seleccionados",
        description: `Se han añadido ${selectedContacts.length} contactos como destinatarios.`,
      });
    }
    setContactsDialogOpen(false);
  }, [selectedContacts, setEmailTo, toast, setContactsDialogOpen]);

  const openContactsDialog = useCallback(() => {
    setContactsDialogOpen(true);
  }, [setContactsDialogOpen]);

  const ContactsSelector = useCallback(() => {
    // Crear un componente interno con estado local
    const ContactsDialogContent = () => {
      const [localSelectedContacts, setLocalSelectedContacts] = useState([...selectedContacts]);
      const [localSelectedLists, setLocalSelectedLists] = useState([...selectedLists]);
      const [localContactsTab, setLocalContactsTab] = useState(contactsTab);
      const [localSearchTerm, setLocalSearchTerm] = useState(contactSearchTerm);

      // Filtrar contactos basados en el término de búsqueda local
      const localFilteredContacts = useMemo(() => {
        if (!localSearchTerm.trim()) return contacts;
        return contacts.filter(
          contact => 
            contact.name?.toLowerCase().includes(localSearchTerm.toLowerCase()) || 
            contact.email.toLowerCase().includes(localSearchTerm.toLowerCase())
        );
      }, [contacts, localSearchTerm]);

      // Función para aplicar selección
      const applySelection = () => {
        setSelectedContacts(localSelectedContacts);
        setSelectedLists(localSelectedLists);
        setContactsTab(localContactsTab);
        setContactSearchTerm(localSearchTerm);
        
        if (localSelectedContacts.length > 0) {
          setEmailTo(localSelectedContacts.join(", "));
          toast({
            title: "Contactos seleccionados",
            description: `Se han añadido ${localSelectedContacts.length} contactos como destinatarios.`,
          });
        }
        setContactsDialogOpen(false);
      };

      return (
        <>
          <ContactsSelectorContent
            contacts={contacts}
            lists={lists}
            selectedContacts={localSelectedContacts}
            setSelectedContacts={setLocalSelectedContacts}
            selectedLists={localSelectedLists}
            setSelectedLists={setLocalSelectedLists}
            contactsTab={localContactsTab}
            setContactsTab={setLocalContactsTab}
            contactSearchTerm={localSearchTerm}
            setContactSearchTerm={setLocalSearchTerm}
            filteredContacts={localFilteredContacts}
          />
          <div className="pt-4">
            <Button onClick={applySelection} className="w-full">
              Aplicar selección ({localSelectedContacts.length} contactos)
            </Button>
          </div>
        </>
      );
    };

    if (isMobile) {
      return (
        <Drawer open={contactsDialogOpen} onOpenChange={setContactsDialogOpen}>
          <DrawerTrigger asChild>
            <Button 
              onClick={openContactsDialog}
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
            >
              <Users className="h-4 w-4" />
              Seleccionar destinatarios
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader>
              <DrawerTitle>Seleccionar destinatarios</DrawerTitle>
              <DrawerDescription>
                Elige contactos individuales o listas completas como destinatarios
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 py-2">
              <ContactsDialogContent />
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      );
    }

    return (
      <Dialog open={contactsDialogOpen} onOpenChange={setContactsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            onClick={openContactsDialog}
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
          >
            <Users className="h-4 w-4" />
            Seleccionar destinatarios
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Seleccionar destinatarios</DialogTitle>
            <DialogDescription>
              Elige contactos individuales o listas completas como destinatarios
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-2" style={{maxHeight: "calc(85vh - 200px)"}}>
            <ContactsDialogContent />
          </div>
        </DialogContent>
      </Dialog>
    );
  }, [
    contactsDialogOpen, 
    openContactsDialog,
    contacts,
    lists,
    isMobile,
    toast
  ]);

  const SchedulingPopup = useCallback(() => {
    // Crear un componente interno para el contenido que maneje su propio estado
    const ScheduleContent = () => {
      // Modificar para eliminar el tipo "now" y establecer "minutes" como valor por defecto
      const [localScheduleType, setLocalScheduleType] = useState<"minutes" | "hours" | "days">("minutes");
      const [localScheduledMinutes, setLocalScheduledMinutes] = useState(scheduledMinutes);
      const [localScheduledHours, setLocalScheduledHours] = useState(scheduledHours);
      const [localScheduledDays, setLocalScheduledDays] = useState(scheduledDays);
      const [localScheduledDate, setLocalScheduledDate] = useState<Date | undefined>(scheduledDate);
      const [localScheduledTime, setLocalScheduledTime] = useState(scheduledTime);
      
      // Función para aplicar los cambios globalmente solo cuando se envía
      const applyScheduleSettings = () => {
        setScheduleType(localScheduleType);
        setScheduledMinutes(localScheduledMinutes);
        setScheduledHours(localScheduledHours);
        setScheduledDays(localScheduledDays);
        setScheduledDate(localScheduledDate);
        setScheduledTime(localScheduledTime);
        handleScheduleEmail();
      };
      
      // Convertir hora en formato de entrada (para el campo de tiempo)
      const formatTimeForInput = (timeString: string) => {
        if (!timeString) return "12:00";
        return timeString;
      };
      
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Programar envío para</label>
            <Select
              value={localScheduleType}
              onValueChange={(value: "minutes" | "hours" | "days") => setLocalScheduleType(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccione cuándo enviar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">En X minutos</SelectItem>
                <SelectItem value="hours">En X horas</SelectItem>
                <SelectItem value="days">En fecha específica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Campos específicos según el tipo de programación */}
          {localScheduleType === "minutes" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Minutos</label>
              <Input 
                type="number" 
                min="1" 
                max="59" 
                value={localScheduledMinutes}
                onChange={(e) => setLocalScheduledMinutes(parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-gray-500">El correo se enviará en {localScheduledMinutes} minutos</p>
            </div>
          )}
          
          {localScheduleType === "hours" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Horas</label>
              <Input 
                type="number" 
                min="1" 
                max="24" 
                value={localScheduledHours}
                onChange={(e) => setLocalScheduledHours(parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-gray-500">El correo se enviará en {localScheduledHours} horas</p>
            </div>
          )}
          
          {localScheduleType === "days" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localScheduledDate ? format(localScheduledDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={localScheduledDate}
                      onSelect={setLocalScheduledDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Hora</label>
                <Input 
                  type="time" 
                  value={formatTimeForInput(localScheduledTime)}
                  onChange={(e) => setLocalScheduledTime(e.target.value)}
                />
              </div>
              
              <p className="text-xs text-gray-500">
                {localScheduledDate ? 
                  `El correo se enviará el ${format(localScheduledDate, "PPP", { locale: es })} a las ${localScheduledTime}` :
                  "Por favor, selecciona una fecha"}
              </p>
            </div>
          )}
          
          <div className="pt-4">
            <Button 
              onClick={applyScheduleSettings} 
              disabled={isSending || (localScheduleType === "days" && !localScheduledDate)} 
              className="w-full"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Programando...
                </>
              ) : (
                <>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Programar envío
                </>
              )}
            </Button>
          </div>
        </div>
      );
    };

    if (isMobile) {
      return (
        <Drawer open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(true)}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Programar
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Programar envío de correo</DrawerTitle>
              <DrawerDescription>Configure cuándo desea enviar el correo</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 py-2">
              <ScheduleContent />
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      );
    }

    return (
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={() => setIsScheduleDialogOpen(true)}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Programar
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Programar envío de correo</DialogTitle>
            <DialogDescription>Configure cuándo desea enviar el correo</DialogDescription>
          </DialogHeader>
          <ScheduleContent />
        </DialogContent>
      </Dialog>
    );
  }, [
    isScheduleDialogOpen,
    setIsScheduleDialogOpen,
    isMobile,
    isSending,
    isScheduling
  ]);

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Editor de Plantilla</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Contenido</TabsTrigger>
                  <TabsTrigger value="image">Imagen</TabsTrigger>
                  <TabsTrigger value="send">Enviar</TabsTrigger>
                </TabsList>
                <TabsContent value="content" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Asunto del Correo
                    </label>
                    <Input
                      id="subject"
                      placeholder="Asunto del correo"
                      value={templateContent.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="heading" className="text-sm font-medium">
                      Título Principal
                    </label>
                    <Input
                      id="heading"
                      placeholder="Título principal"
                      value={templateContent.heading}
                      onChange={(e) => handleInputChange("heading", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subheading" className="text-sm font-medium">
                      Subtítulo
                    </label>
                    <Input
                      id="subheading"
                      placeholder="Subtítulo"
                      value={templateContent.subheading}
                      onChange={(e) => handleInputChange("subheading", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="content" className="text-sm font-medium">
                      Contenido
                    </label>
                    <Textarea
                      id="content"
                      placeholder="Contenido del correo"
                      rows={5}
                      value={templateContent.content}
                      onChange={(e) => handleInputChange("content", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="buttonText" className="text-sm font-medium">
                      Texto del Botón
                    </label>
                    <Input
                      id="buttonText"
                      placeholder="Texto del botón"
                      value={templateContent.buttonText}
                      onChange={(e) => handleInputChange("buttonText", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="buttonUrl" className="text-sm font-medium">
                      URL del Botón
                    </label>
                    <Input
                      id="buttonUrl"
                      placeholder="URL del botón"
                      value={templateContent.buttonUrl}
                      onChange={(e) => handleInputChange("buttonUrl", e.target.value)}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="image" className="space-y-4 mt-4">
                  {/* Mostrar URL de video solo cuando se selecciona la plantilla de video */}
                  {selectedTemplate === "videoTemplate" && (
                    <div className="space-y-2">
                      <label htmlFor="videoUrl" className="text-sm font-medium">
                        URL del Video (YouTube o Vimeo)
                      </label>
                      <Input
                        id="videoUrl"
                        placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX"
                        value={templateContent.videoUrl}
                        onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Ingresa una URL de YouTube o Vimeo para incrustar el video en el correo.
                      </p>
                    </div>
                  )}
                  
                  {/* Mostrar campos de imagen solo cuando NO es plantilla de video */}
                  {selectedTemplate !== "videoTemplate" && (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="imageUrl" className="text-sm font-medium">
                          URL de la Imagen
                        </label>
                        <Input
                          id="imageUrl"
                          placeholder="https://ejemplo.com/imagen.jpg"
                          value={templateContent.imageUrl}
                          onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">O Subir Imagen</label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        <p className="text-xs text-muted-foreground">
                          Formatos soportados: JPG, PNG, GIF. Tamaño máximo recomendado: 5MB
                        </p>
                      </div>
                      {uploadedImage && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">Imagen cargada:</p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setUploadedImage(null)}
                            >
                              Quitar
                            </Button>
                          </div>
                          <div className="relative border rounded-md p-2 bg-gray-50">
                            <img
                              src={uploadedImage}
                              alt="Vista previa"
                              className="max-w-full h-auto rounded-md"
                            />
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              Cargada localmente
                            </div>
                          </div>
                        </div>
                      )}
                      {!uploadedImage && templateContent.imageUrl && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Usando imagen desde URL:</p>
                          <div className="relative border rounded-md p-2 bg-gray-50">
                            <img
                              src={templateContent.imageUrl}
                              alt="Vista previa"
                              className="max-w-full h-auto rounded-md"
                              onError={(e) => {
                                e.currentTarget.src = "https://via.placeholder.com/600x300?text=Error+cargando+imagen";
                              }}
                            />
                            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                              URL remota
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
                <TabsContent value="send" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Envío de Correo</h3>
                    
                    {previewUrl && (
                      <Alert className="mb-4 bg-blue-50 border-blue-200">
                        <AlertTitle className="text-blue-700">Correo enviado correctamente</AlertTitle>
                        <AlertDescription className="text-blue-600">
                          <p className="mb-2">El correo ha sido enviado a través de nuestro servicio de prueba (Ethereal).</p>
                          <a 
                            href={previewUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-700 hover:text-blue-900 font-semibold"
                          >
                            Ver cómo se ve el correo <ExternalLink className="ml-1 h-4 w-4" />
                          </a>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex space-x-2 mb-4">
                      <Button
                        variant={sendMode === "individual" ? "default" : "outline"}
                        onClick={() => setSendMode("individual")}
                        className="flex-1"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Individual
                      </Button>
                      <Button
                        variant={sendMode === "bulk" ? "default" : "outline"}
                        onClick={() => setSendMode("bulk")}
                        className="flex-1"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Masivo
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="emailTo" className="text-sm font-medium">
                        {sendMode === "individual" ? "Destinatario" : "Destinatarios (separados por coma, punto y coma o nueva línea)"}
                      </label>
                      
                      <ContactsSelector />
                      
                      <div className="mt-3">
                        <Textarea
                          id="emailTo"
                          placeholder={sendMode === "individual" ? "correo@ejemplo.com" : "correo1@ejemplo.com, correo2@ejemplo.com"}
                          rows={sendMode === "individual" ? 1 : 4}
                          value={emailTo}
                          onChange={(e) => setEmailTo(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Puedes seleccionar contactos usando el botón de arriba o escribir las direcciones manualmente.
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full mt-4" 
                      onClick={handleSendEmail}
                      disabled={isSending}
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Enviar {sendMode === "bulk" ? "Correos" : "Correo"}
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Seleccionar Plantilla</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={selectedTemplate === "template1" ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col"
                  onClick={() => setSelectedTemplate("template1")}
                >
                  <span className="text-xs">Tips</span>
                </Button>
                <Button
                  variant={selectedTemplate === "template2" ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col"
                  onClick={() => setSelectedTemplate("template2")}
                >
                  <span className="text-xs">Ciber Seguridad</span>
                </Button>
                <Button
                  variant={selectedTemplate === "template3" ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col"
                  onClick={() => setSelectedTemplate("template3")}
                >
                  <span className="text-xs">Anuncios</span>
                </Button>
                <Button
                  variant={selectedTemplate === "template4" ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col"
                  onClick={() => setSelectedTemplate("template4")}
                >
                  <span className="text-xs">Talleres</span>
                </Button>
                <Button
                  variant={selectedTemplate === "template5" ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col"
                  onClick={() => setSelectedTemplate("template5")}
                >
                  <span className="text-xs">Tendencias</span>
                </Button>
                <Button
                  variant={selectedTemplate === "template6" ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col"
                  onClick={() => setSelectedTemplate("template6")}
                >
                  <span className="text-xs">Políticas</span>
                </Button>
                <Button
                  variant={selectedTemplate === "template7" ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col"
                  onClick={() => setSelectedTemplate("template7")}
                >
                  <span className="text-xs">Transformación</span>
                </Button>
                <Button
                  variant={selectedTemplate === "template8" ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col"
                  onClick={() => setSelectedTemplate("template8")}
                >
                  <span className="text-xs">Eventos</span>
                </Button>
                <Button
                  variant={selectedTemplate === "template9" ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col"
                  onClick={() => setSelectedTemplate("template9")}
                >
                  <span className="text-xs">Innovación</span>
                </Button>
                <Button
                  variant={selectedTemplate === "template13" ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col"
                  onClick={() => setSelectedTemplate("template13")}
                >
                  <span className="text-xs">Moderna</span>
                </Button>
                <Button
                  variant={selectedTemplate === "template14" ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col"
                  onClick={() => setSelectedTemplate("template14")}
                >
                  <span className="text-xs">Profesional</span>
                </Button>
                <Button
                  variant={selectedTemplate === "template15" ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col"
                  onClick={() => setSelectedTemplate("template15")}
                >
                  <span className="text-xs">Minimalista</span>
                </Button>
                <Button
                  variant={selectedTemplate === "videoTemplate" ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col"
                  onClick={() => setSelectedTemplate("videoTemplate")}  
                >
                  <span className="text-xs">Video</span>
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="lg:col-span-7">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Vista Previa</h3>
              <div className="flex space-x-2">
                <Button
                  onClick={handleSendEmail}
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar
                    </>
                  )}
                </Button>
                <SchedulingPopup />
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[700px]">
              {getTemplateComponent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateEditor;