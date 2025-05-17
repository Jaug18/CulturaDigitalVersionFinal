import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Email {
  _id: string;
  to: string | string[];
  subject: string;
  from: string;
  status: 'sent' | 'failed';
  message: string;
  timestamp: string;
  contentPreview: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface EmailHistoryProps {
  limit?: number;
}

const EmailHistory: React.FC<EmailHistoryProps> = ({ limit = 10 }) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchEmails = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/emails?page=${page}&limit=${limit}`);
      
      if (response.data.success) {
        setEmails(response.data.data);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.data.message || 'Error desconocido');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al cargar historial de emails:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails(currentPage);
  }, [currentPage, limit]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatRecipients = (recipients: string | string[]) => {
    if (typeof recipients === 'string') return recipients;
    if (recipients.length <= 3) return recipients.join(', ');
    return `${recipients.slice(0, 3).join(', ')} y ${recipients.length - 3} más`;
  };

  if (loading && !emails.length) {
    return <div className="p-4 text-center">Cargando historial de emails...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-300 rounded">
        <p className="text-red-700">Error: {error}</p>
        <button 
          onClick={() => fetchEmails(currentPage)}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="email-history">
      <h2 className="text-xl font-bold mb-4">Historial de Emails</h2>
      
      {emails.length === 0 ? (
        <p className="text-gray-500">No hay emails en el historial.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border-b">Fecha</th>
                  <th className="px-4 py-2 border-b">Destinatario</th>
                  <th className="px-4 py-2 border-b">Asunto</th>
                  <th className="px-4 py-2 border-b">Estado</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((email) => (
                  <tr key={email._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{formatDate(email.timestamp)}</td>
                    <td className="px-4 py-2 border-b">{formatRecipients(email.to)}</td>
                    <td className="px-4 py-2 border-b">{email.subject}</td>
                    <td className="px-4 py-2 border-b">
                      <span className={`px-2 py-1 rounded text-sm ${
                        email.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {email.status === 'sent' ? 'Enviado' : 'Fallido'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center mt-4">
              <nav className="flex items-center">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Anterior
                </button>
                
                <span className="mx-4">
                  Página {currentPage} de {pagination.pages}
                </span>
                
                <button
                  onClick={() => handlePageChange(Math.min(pagination.pages, currentPage + 1))}
                  disabled={currentPage === pagination.pages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmailHistory;
