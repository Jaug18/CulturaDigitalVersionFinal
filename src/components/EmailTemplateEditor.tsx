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
import TemplateTen from "./email-templates/TemplateTen";
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
import api from "@/services/api";

const ContactsSelectorContent = ({
  contacts,
  selectedContacts,
  setSelectedContacts,
  contactSearchTerm,
  setContactSearchTerm,
  filteredContacts,
  lists,
  selectedLists,
  toggleList,
  listSearchTerm,
  setListSearchTerm,
  filteredLists,
}) => {
  const toggleContact = useCallback((email) => {
    setSelectedContacts(prev => {
      const included = prev.includes(email);
      return included
        ? prev.filter(e => e !== email)
        : [...prev, email];
    });
  }, [setSelectedContacts]);

  return (
    <Tabs defaultValue="contacts" className="flex flex-col h-full space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="contacts">Contactos</TabsTrigger>
        <TabsTrigger value="lists">Listas</TabsTrigger>
      </TabsList>
      <TabsContent value="contacts" className="flex-1 overflow-y-auto min-h-0">
        <div className="flex flex-col h-full space-y-4">
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar contactos..."
              className="pl-9"
              value={contactSearchTerm}
              onChange={(e) => setContactSearchTerm(e.target.value)}
            />
          </div>

          <div className="border rounded-md flex-1 overflow-y-auto p-3 min-h-0">
            {filteredContacts.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{contactSearchTerm?.trim() ? "No se encontraron contactos que coincidan con la búsqueda" : "No se encontraron contactos"}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`p-3 rounded-lg flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors border ${
                      selectedContacts.includes(contact.email) ? "bg-blue-50 border-blue-200" : "border-transparent hover:border-gray-200"
                    }`}
                    onClick={() => toggleContact(contact.email)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{contact.name || "Sin nombre"}</div>
                      <div className="text-xs text-gray-500 truncate">{contact.email}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 transition-colors ${
                      selectedContacts.includes(contact.email)
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300 hover:border-gray-400"
                    }`}>
                      {selectedContacts.includes(contact.email) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </TabsContent>
      <TabsContent value="lists" className="flex-1 overflow-y-auto min-h-0">
        <div className="flex flex-col h-full space-y-4">
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar listas..."
              className="pl-9"
              value={listSearchTerm}
              onChange={(e) => setListSearchTerm(e.target.value)}
            />
          </div>
          <div className="border rounded-md flex-1 overflow-y-auto p-3 min-h-0 h-full">
            {filteredLists.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{listSearchTerm?.trim() ? "No se encontraron listas que coincidan con la búsqueda" : "No se encontraron listas"}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLists.map((list) => (
                  <div
                    key={list.id}
                    className={`p-3 rounded-lg flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors border ${
                      selectedLists.includes(list.id) ? "bg-blue-50 border-blue-200" : "border-transparent hover:border-gray-200"
                    }`}
                    onClick={() => toggleList(list)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{list.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {list.contact_count || list.contactCount || 0} contactos
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 transition-colors ${
                      selectedLists.includes(list.id)
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300 hover:border-gray-400"
                    }`}>
                      {selectedLists.includes(list.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

const EmailTemplateEditor = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [contactsDialogOpen, setContactsDialogOpen] = useState<boolean>(false);
  const [contactSearchTerm, setContactSearchTerm] = useState<string>("");
  const [listSearchTerm, setListSearchTerm] = useState<string>("");

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
    releaseDate: "",
    eventDate: "",
    eventTime: "",
    eventLocation: "",
    instructorName: "",
    contactPhone: "",
    contactEmail: "",
    footerCompany: "",
    footerEmail: "",
    footerPhone: "",
    departmentName: "",
    websiteUrl: "",
    quoteText: "",
    quoteAuthor: "",
    socialTitle: "",
    facebookUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    copyrightText: "",
    stat1Number: "",
    stat1Label: "",
    stat2Number: "",
    stat2Label: "",
    stat3Number: "",
    stat3Label: "",
    implementationDate: "",
    // Timeline steps for TemplateSix
    step1Number: "",
    step1Label: "",
    step2Number: "",
    step2Label: "",
    step3Number: "",
    step3Label: "",
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
    api.get('/api/contacts', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => setContacts(res.data)).catch(() => setContacts([]));
    
    // Cargar listas con contactos incluidos
    const loadListsWithContacts = async () => {
      try {
        const response = await api.get('/api/lists', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        console.log('Respuesta completa de listas:', response.data);
        
        // Si cada lista tiene un ID, cargar los contactos para cada una
        const listsWithContacts = await Promise.all(
          response.data.map(async (list) => {
            try {
              console.log('Cargando contactos para lista:', list.id, list.name);
              const contactsResponse = await api.get(`/api/lists/${list.id}/contacts`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
              });
              console.log(`Contactos para ${list.name}:`, contactsResponse.data);
              return {
                ...list,
                contacts: contactsResponse.data,
                contactCount: contactsResponse.data.length
              };
            } catch (error) {
              console.log(`Error cargando contactos para lista ${list.name}:`, error);
              // Si no existe el endpoint específico, intentar con la información que ya tenemos
              return {
                ...list,
                contacts: list.contacts || [],
                contactCount: list.contacts?.length || list._count?.contacts || list.contactCount || 0
              };
            }
          })
        );
        
        console.log('Listas con contactos procesadas:', listsWithContacts);
        setLists(listsWithContacts);
      } catch (err) {
        console.error('Error cargando listas:', err);
        setLists([]);
      }
    };
    
    loadListsWithContacts();
  }, []);

  const handleImportContacts = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/api/contacts/upload', formData, {
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

  const getCurrentImage = () => {
    if (uploadedImage) return uploadedImage;
    if (templateContent.imageUrl) return templateContent.imageUrl;
    return "https://placehold.co/600x400";
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
      releaseDate: templateContent.releaseDate,
      eventDate: templateContent.eventDate,
      eventTime: templateContent.eventTime,
      eventLocation: templateContent.eventLocation,
      instructorName: templateContent.instructorName,
      contactPhone: templateContent.contactPhone,
      contactEmail: templateContent.contactEmail,
      footerCompany: templateContent.footerCompany,
      footerEmail: templateContent.footerEmail,
      footerPhone: templateContent.footerPhone,
      departmentName: templateContent.departmentName,
      websiteUrl: templateContent.websiteUrl,
      quoteText: templateContent.quoteText,
      quoteAuthor: templateContent.quoteAuthor,
      socialTitle: templateContent.socialTitle,
      facebookUrl: templateContent.facebookUrl,
      linkedinUrl: templateContent.linkedinUrl,
      twitterUrl: templateContent.twitterUrl,
      copyrightText: templateContent.copyrightText,
      stat1Number: templateContent.stat1Number,
      stat1Label: templateContent.stat1Label,
      stat2Number: templateContent.stat2Number,
      stat2Label: templateContent.stat2Label,
      stat3Number: templateContent.stat3Number,
      stat3Label: templateContent.stat3Label,
      implementationDate: templateContent.implementationDate,
      // Timeline steps for TemplateSix
      step1Number: templateContent.step1Number,
      step1Label: templateContent.step1Label,
      step2Number: templateContent.step2Number,
      step2Label: templateContent.step2Label,
      step3Number: templateContent.step3Number,
      step3Label: templateContent.step3Label,
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
      case "template10": return <TemplateTen {...templateProps} />;
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
          buttonText: templateContent.buttonText,
          buttonUrl: templateContent.buttonUrl,
          releaseDate: templateContent.releaseDate,
          eventDate: templateContent.eventDate,
          eventTime: templateContent.eventTime,
          eventLocation: templateContent.eventLocation,
          instructorName: templateContent.instructorName,
          contactPhone: templateContent.contactPhone,
          contactEmail: templateContent.contactEmail,
          footerCompany: templateContent.footerCompany,
          footerEmail: templateContent.footerEmail,
          footerPhone: templateContent.footerPhone,
          departmentName: templateContent.departmentName,
          websiteUrl: templateContent.websiteUrl,
          quoteText: templateContent.quoteText,
          quoteAuthor: templateContent.quoteAuthor,
          socialTitle: templateContent.socialTitle,
          facebookUrl: templateContent.facebookUrl,
          linkedinUrl: templateContent.linkedinUrl,
          twitterUrl: templateContent.twitterUrl,
          copyrightText: templateContent.copyrightText,
          stat1Number: templateContent.stat1Number,
          stat1Label: templateContent.stat1Label,
          stat2Number: templateContent.stat2Number,
          stat2Label: templateContent.stat2Label,
          stat3Number: templateContent.stat3Number,
          stat3Label: templateContent.stat3Label,
          implementationDate: templateContent.implementationDate,
          step1Number: templateContent.step1Number,
          step1Label: templateContent.step1Label,
          step2Number: templateContent.step2Number,
          step2Label: templateContent.step2Label,
          step3Number: templateContent.step3Number,
          step3Label: templateContent.step3Label,
          ...(selectedTemplate === "videoTemplate" && { videoUrl: templateContent.videoUrl }),
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
          buttonText: templateContent.buttonText,
          buttonUrl: templateContent.buttonUrl,
          releaseDate: templateContent.releaseDate,
          eventDate: templateContent.eventDate,
          eventTime: templateContent.eventTime,
          eventLocation: templateContent.eventLocation,
          instructorName: templateContent.instructorName,
          contactPhone: templateContent.contactPhone,
          contactEmail: templateContent.contactEmail,
          footerCompany: templateContent.footerCompany,
          footerEmail: templateContent.footerEmail,
          footerPhone: templateContent.footerPhone,
          departmentName: templateContent.departmentName,
          websiteUrl: templateContent.websiteUrl,
          quoteText: templateContent.quoteText,
          quoteAuthor: templateContent.quoteAuthor,
          socialTitle: templateContent.socialTitle,
          facebookUrl: templateContent.facebookUrl,
          linkedinUrl: templateContent.linkedinUrl,
          twitterUrl: templateContent.twitterUrl,
          copyrightText: templateContent.copyrightText,
          stat1Number: templateContent.stat1Number,
          stat1Label: templateContent.stat1Label,
          stat2Number: templateContent.stat2Number,
          stat2Label: templateContent.stat2Label,
          stat3Number: templateContent.stat3Number,
          stat3Label: templateContent.stat3Label,
          implementationDate: templateContent.implementationDate,
          step1Number: templateContent.step1Number,
          step1Label: templateContent.step1Label,
          step2Number: templateContent.step2Number,
          step2Label: templateContent.step2Label,
          step3Number: templateContent.step3Number,
          step3Label: templateContent.step3Label,
          ...(selectedTemplate === "videoTemplate" && { videoUrl: templateContent.videoUrl }),
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

  const filteredLists = useMemo(() => {
    if (!listSearchTerm.trim()) return lists;
    return lists.filter(
      list => list.name?.toLowerCase().includes(listSearchTerm.toLowerCase())
    );
  }, [lists, listSearchTerm]);

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
      const [localSearchTerm, setLocalSearchTerm] = useState(contactSearchTerm);
      const [localListSearchTerm, setLocalListSearchTerm] = useState("");

      // Filtrar contactos basados en el término de búsqueda local
      const localFilteredContacts = useMemo(() => {
        if (!localSearchTerm.trim()) return contacts;
        return contacts.filter(
          contact => 
            contact.name?.toLowerCase().includes(localSearchTerm.toLowerCase()) || 
            contact.email.toLowerCase().includes(localSearchTerm.toLowerCase())
        );
      }, [contacts, localSearchTerm]);

      const localFilteredLists = useMemo(() => {
        if (!localListSearchTerm.trim()) return lists;
        return lists.filter(
          list => list.name?.toLowerCase().includes(localListSearchTerm.toLowerCase())
        );
      }, [lists, localListSearchTerm]);

      const toggleList = async (list) => {
        const isSelected = localSelectedLists.includes(list.id);

        console.log('Toggle list:', list.name, 'IsSelected:', isSelected);

        if (isSelected) {
            // Deselect list - necesitamos cargar los contactos para poder deseleccionarlos
            try {
              const response = await api.get(`/api/lists/${list.id}/contacts`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
              });
              
              const data = response.data;
              
              if (data.success && data.data) {
                const listContacts = data.data;
                const listContactEmails = listContacts.map(c => c.email).filter(Boolean);
                
                setLocalSelectedLists(prev => prev.filter(id => id !== list.id));
                setLocalSelectedContacts(prev => prev.filter(email => !listContactEmails.includes(email)));
                
                console.log('Lista deseleccionada:', list.name, 'Emails removidos:', listContactEmails);
              }
            } catch (error) {
              console.error('Error al cargar contactos para deseleccionar lista:', error);
              // Fallback: solo remover la lista de las seleccionadas
              setLocalSelectedLists(prev => prev.filter(id => id !== list.id));
            }
        } else {
            // Select list - cargar contactos desde la API
            try {
              const response = await api.get(`/api/lists/${list.id}/contacts`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
              });
              
              const data = response.data;
              
              console.log('Respuesta de contactos de lista:', data);
              
              if (data.success && data.data) {
                const listContacts = data.data;
                const listContactEmails = listContacts.map(c => c.email).filter(Boolean);
                
                setLocalSelectedLists(prev => [...prev, list.id]);
                setLocalSelectedContacts(prev => {
                    const newContacts = listContactEmails.filter(email => !prev.includes(email));
                    return [...prev, ...newContacts];
                });
                
                console.log('Lista seleccionada:', list.name, 'Nuevos contactos agregados:', listContactEmails);
              } else {
                console.warn('No se pudieron cargar contactos de la lista:', list.name);
                // Aún así seleccionar la lista aunque no tengamos contactos
                setLocalSelectedLists(prev => [...prev, list.id]);
              }
            } catch (error) {
              console.error('Error al cargar contactos de la lista:', error);
              // Aún así seleccionar la lista aunque haya un error
              setLocalSelectedLists(prev => [...prev, list.id]);
            }
        }
      };

      // Función para aplicar selección
      const applySelection = () => {
        setSelectedContacts(localSelectedContacts);
        setSelectedLists(localSelectedLists);
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
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-hidden">
            <ContactsSelectorContent
              contacts={contacts}
              selectedContacts={localSelectedContacts}
              setSelectedContacts={setLocalSelectedContacts}
              contactSearchTerm={localSearchTerm}
              setContactSearchTerm={setLocalSearchTerm}
              filteredContacts={localFilteredContacts}
              lists={lists}
              selectedLists={localSelectedLists}
              toggleList={toggleList}
              listSearchTerm={localListSearchTerm}
              setListSearchTerm={setLocalListSearchTerm}
              filteredLists={localFilteredLists}
            />
          </div>
          <div className="border-t pt-4 bg-white flex-shrink-0">
            <Button onClick={applySelection} className="w-full">
              Aplicar selección ({localSelectedContacts.length} contactos)
            </Button>
          </div>
        </div>
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
            <div className="flex-1 overflow-hidden px-4 pb-4">
              <ContactsDialogContent />
            </div>
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
        <DialogContent className="sm:max-w-[650px] h-[600px] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle>Seleccionar destinatarios</DialogTitle>
            <DialogDescription>
              Elige contactos individuales o listas completas como destinatarios
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden p-6 pt-0">
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
                  {selectedTemplate === "template3" && (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="releaseDate" className="text-sm font-medium">
                          Fecha de Lanzamiento
                        </label>
                        <Input
                          id="releaseDate"
                          placeholder="Ej: 15 de Mayo, 2025"
                          value={templateContent.releaseDate}
                          onChange={(e) => handleInputChange("releaseDate", e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Esta fecha aparecerá en la sección destacada de la plantilla.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="departmentName" className="text-sm font-medium">
                          Nombre del Departamento
                        </label>
                        <Input
                          id="departmentName"
                          placeholder="Ej: Departamento de Tecnología de la Información"
                          value={templateContent.departmentName}
                          onChange={(e) => handleInputChange("departmentName", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="contactEmail" className="text-sm font-medium">
                          Email de Contacto
                        </label>
                        <Input
                          id="contactEmail"
                          placeholder="Ej: ti@ejemplo.com"
                          value={templateContent.contactEmail}
                          onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="footerCompany" className="text-sm font-medium">
                          Nombre de la Empresa (Footer)
                        </label>
                        <Input
                          id="footerCompany"
                          placeholder="Ej: Cultura Digital"
                          value={templateContent.footerCompany}
                          onChange={(e) => handleInputChange("footerCompany", e.target.value)}
                        />
                      </div>
                    </>
                  )}
                  {selectedTemplate === "template4" && (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="eventDate" className="text-sm font-medium">
                          Fecha del Evento
                        </label>
                        <Input
                          id="eventDate"
                          placeholder="Ej: 15 de Mayo, 2025"
                          value={templateContent.eventDate}
                          onChange={(e) => handleInputChange("eventDate", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="eventTime" className="text-sm font-medium">
                          Hora del Evento
                        </label>
                        <Input
                          id="eventTime"
                          placeholder="Ej: 10:00 AM - 12:00 PM"
                          value={templateContent.eventTime}
                          onChange={(e) => handleInputChange("eventTime", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="eventLocation" className="text-sm font-medium">
                          Ubicación del Evento
                        </label>
                        <Input
                          id="eventLocation"
                          placeholder="Ej: Sala de Conferencias Virtual"
                          value={templateContent.eventLocation}
                          onChange={(e) => handleInputChange("eventLocation", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="instructorName" className="text-sm font-medium">
                          Nombre del Instructor
                        </label>
                        <Input
                          id="instructorName"
                          placeholder="Ej: María González, Especialista en Productividad"
                          value={templateContent.instructorName}
                          onChange={(e) => handleInputChange("instructorName", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="contactPhone" className="text-sm font-medium">
                          Teléfono de Contacto
                        </label>
                        <Input
                          id="contactPhone"
                          placeholder="Ej: Ext. 1234"
                          value={templateContent.contactPhone}
                          onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="contactEmail" className="text-sm font-medium">
                          Email de Contacto
                        </label>
                        <Input
                          id="contactEmail"
                          placeholder="Ej: culturadigital@ipscsc.com.cojemplo.com"
                          value={templateContent.contactEmail}
                          onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                        />
                      </div>
                    </>
                  )}
                  {selectedTemplate === "template7" && (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="stat1Number" className="text-sm font-medium">
                          Estadística 1 - Número
                        </label>
                        <Input
                          id="stat1Number"
                          placeholder="Ej: 25+"
                          value={templateContent.stat1Number}
                          onChange={(e) => handleInputChange("stat1Number", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="stat1Label" className="text-sm font-medium">
                          Estadística 1 - Etiqueta
                        </label>
                        <Input
                          id="stat1Label"
                          placeholder="Ej: Expositores"
                          value={templateContent.stat1Label}
                          onChange={(e) => handleInputChange("stat1Label", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="stat2Number" className="text-sm font-medium">
                          Estadística 2 - Número
                        </label>
                        <Input
                          id="stat2Number"
                          placeholder="Ej: 8"
                          value={templateContent.stat2Number}
                          onChange={(e) => handleInputChange("stat2Number", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="stat2Label" className="text-sm font-medium">
                          Estadística 2 - Etiqueta
                        </label>
                        <Input
                          id="stat2Label"
                          placeholder="Ej: Talleres"
                          value={templateContent.stat2Label}
                          onChange={(e) => handleInputChange("stat2Label", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="stat3Number" className="text-sm font-medium">
                          Estadística 3 - Número
                        </label>
                        <Input
                          id="stat3Number"
                          placeholder="Ej: 500+"
                          value={templateContent.stat3Number}
                          onChange={(e) => handleInputChange("stat3Number", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="stat3Label" className="text-sm font-medium">
                          Estadística 3 - Etiqueta
                        </label>
                        <Input
                          id="stat3Label"
                          placeholder="Ej: Asistentes"
                          value={templateContent.stat3Label}
                          onChange={(e) => handleInputChange("stat3Label", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="footerEmail" className="text-sm font-medium">
                          Email del Footer
                        </label>
                        <Input
                          id="footerEmail"
                          placeholder="Ej: culturadigital@ipscsc.com.cojemplo.com"
                          value={templateContent.footerEmail}
                          onChange={(e) => handleInputChange("footerEmail", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="footerPhone" className="text-sm font-medium">
                          Teléfono del Footer
                        </label>
                        <Input
                          id="footerPhone"
                          placeholder="Ej: +57 300 123 4567"
                          value={templateContent.footerPhone}
                          onChange={(e) => handleInputChange("footerPhone", e.target.value)}
                        />
                      </div>
                    </>
                  )}
                  {selectedTemplate === "template6" && (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="implementationDate" className="text-sm font-medium">
                          Fecha de Implementación
                        </label>
                        <Input
                          id="implementationDate"
                          placeholder="Ej: 1 de junio, 2025"
                          value={templateContent.implementationDate}
                          onChange={(e) => handleInputChange("implementationDate", e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Esta fecha aparecerá en la línea de tiempo del email.
                        </p>
                      </div>
                      
                      {/* Timeline Steps Configuration */}
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900">Configuración de la Línea de Tiempo</h4>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label htmlFor="step1Number" className="text-sm font-medium">
                              Paso 1 - Número
                            </label>
                            <Input
                              id="step1Number"
                              placeholder="1"
                              value={templateContent.step1Number}
                              onChange={(e) => handleInputChange("step1Number", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="step1Label" className="text-sm font-medium">
                              Paso 1 - Etiqueta
                            </label>
                            <Input
                              id="step1Label"
                              placeholder="Anuncio"
                              value={templateContent.step1Label}
                              onChange={(e) => handleInputChange("step1Label", e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label htmlFor="step2Number" className="text-sm font-medium">
                              Paso 2 - Número
                            </label>
                            <Input
                              id="step2Number"
                              placeholder="2"
                              value={templateContent.step2Number}
                              onChange={(e) => handleInputChange("step2Number", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="step2Label" className="text-sm font-medium">
                              Paso 2 - Etiqueta
                            </label>
                            <Input
                              id="step2Label"
                              placeholder="Preparación"
                              value={templateContent.step2Label}
                              onChange={(e) => handleInputChange("step2Label", e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label htmlFor="step3Number" className="text-sm font-medium">
                              Paso 3 - Número
                            </label>
                            <Input
                              id="step3Number"
                              placeholder="3"
                              value={templateContent.step3Number}
                              onChange={(e) => handleInputChange("step3Number", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="step3Label" className="text-sm font-medium">
                              Paso 3 - Etiqueta
                            </label>
                            <Input
                              id="step3Label"
                              placeholder="Implementación"
                              value={templateContent.step3Label}
                              onChange={(e) => handleInputChange("step3Label", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {selectedTemplate === "template2" && (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="departmentName" className="text-sm font-medium">
                          Nombre del Departamento
                        </label>
                        <Input
                          id="departmentName"
                          placeholder="Ej: Departamento de Seguridad Informática"
                          value={templateContent.departmentName}
                          onChange={(e) => handleInputChange("departmentName", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="contactEmail" className="text-sm font-medium">
                          Email de Contacto
                        </label>
                        <Input
                          id="contactEmail"
                          placeholder="Ej: seguridadinformatica@ejemplo.com"
                          value={templateContent.contactEmail}
                          onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="contactPhone" className="text-sm font-medium">
                          Teléfono de Contacto
                        </label>
                        <Input
                          id="contactPhone"
                          placeholder="Ej: Ext. 1234"
                          value={templateContent.contactPhone}
                          onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="footerCompany" className="text-sm font-medium">
                          Nombre de la Empresa
                        </label>
                        <Input
                          id="footerCompany"
                          placeholder="Ej: Cultura Digital"
                          value={templateContent.footerCompany}
                          onChange={(e) => handleInputChange("footerCompany", e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Este nombre aparecerá en el copyright del footer.
                        </p>
                      </div>
                    </>
                  )}
                  {(selectedTemplate === "template1" || selectedTemplate === "template5" || selectedTemplate === "template6" || selectedTemplate === "videoTemplate") && (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="footerCompany" className="text-sm font-medium">
                          Nombre de la Empresa
                        </label>
                        <Input
                          id="footerCompany"
                          placeholder="Ej: Cultura Digital"
                          value={templateContent.footerCompany}
                          onChange={(e) => handleInputChange("footerCompany", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="footerEmail" className="text-sm font-medium">
                          Email del Footer
                        </label>
                        <Input
                          id="footerEmail"
                          placeholder="Ej: culturadigital@ipscsc.com.cojemplo.com"
                          value={templateContent.footerEmail}
                          onChange={(e) => handleInputChange("footerEmail", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="footerPhone" className="text-sm font-medium">
                          Teléfono del Footer
                        </label>
                        <Input
                          id="footerPhone"
                          placeholder="Ej: +1 234 567 8900"
                          value={templateContent.footerPhone}
                          onChange={(e) => handleInputChange("footerPhone", e.target.value)}
                        />
                      </div>
                      {selectedTemplate === "template5" && (
                        <>
                          <div className="space-y-2">
                            <label htmlFor="websiteUrl" className="text-sm font-medium">
                              Sitio Web
                            </label>
                            <Input
                              id="websiteUrl"
                              placeholder="Ej: www.ejemplo.com"
                              value={templateContent.websiteUrl}
                              onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="quoteText" className="text-sm font-medium">
                              Texto de la Cita
                            </label>
                            <Textarea
                              id="quoteText"
                              placeholder="Ej: La tecnología por sí sola no es suficiente..."
                              rows={3}
                              value={templateContent.quoteText}
                              onChange={(e) => handleInputChange("quoteText", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="quoteAuthor" className="text-sm font-medium">
                              Autor de la Cita
                            </label>
                            <Input
                              id="quoteAuthor"
                              placeholder="Ej: Steve Jobs"
                              value={templateContent.quoteAuthor}
                              onChange={(e) => handleInputChange("quoteAuthor", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="socialTitle" className="text-sm font-medium">
                              Título de Redes Sociales
                            </label>
                            <Input
                              id="socialTitle"
                              placeholder="Ej: Síguenos en nuestras redes sociales"
                              value={templateContent.socialTitle}
                              onChange={(e) => handleInputChange("socialTitle", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="facebookUrl" className="text-sm font-medium">
                              URL de Facebook
                            </label>
                            <Input
                              id="facebookUrl"
                              placeholder="Ej: https://facebook.com/empresa"
                              value={templateContent.facebookUrl}
                              onChange={(e) => handleInputChange("facebookUrl", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="linkedinUrl" className="text-sm font-medium">
                              URL de LinkedIn
                            </label>
                            <Input
                              id="linkedinUrl"
                              placeholder="Ej: https://linkedin.com/company/empresa"
                              value={templateContent.linkedinUrl}
                              onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="twitterUrl" className="text-sm font-medium">
                              URL de Twitter/X
                            </label>
                            <Input
                              id="twitterUrl"
                              placeholder="Ej: https://twitter.com/empresa"
                              value={templateContent.twitterUrl}
                              onChange={(e) => handleInputChange("twitterUrl", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="copyrightText" className="text-sm font-medium">
                              Texto de Copyright
                            </label>
                            <Input
                              id="copyrightText"
                              placeholder="Ej: © 2025 Todos los derechos reservados"
                              value={templateContent.copyrightText}
                              onChange={(e) => handleInputChange("copyrightText", e.target.value)}
                            />
                          </div>
                        </>
                      )}
                    </>
                  )}
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
                                e.currentTarget.src = "https://placehold.co/600x400";
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
                  variant={selectedTemplate === "template10" ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col"
                  onClick={() => setSelectedTemplate("template10")}
                >
                  <span className="text-xs">Boletín</span>
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