
import EmailTemplateEditor from "@/components/EmailTemplateEditor";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <Navbar />
      
      <main className="py-8 container mx-auto px-4">
        <EmailTemplateEditor />
      </main>
      
      <footer className="bg-gray-100 py-4 border-t">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2025 Programa de Cultura Digital - Todos los derechos reservados</p>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
};

export default Index;