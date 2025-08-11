import { Request } from 'express';
import { User } from './models';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'user';
    fullName?: string;
    avatarUrl?: string;
    emailVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface SearchQuery {
  search?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  validation?: Record<string, string[]>;
}

export interface EmailSendRequest {
  to: string | string[] | { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  from?: {
    email?: string;
    name?: string;
  };
  titulo_principal?: string;
  subtitulo?: string;
  contenido?: string;
  content_preview?: string;
  template_id?: string;
}

export interface EmailScheduleRequest extends EmailSendRequest {
  scheduled_for: string;
  image_url?: string;
}

export interface ContactCreateRequest {
  name: string;
  email: string;
  status?: 'active' | 'inactive';
}

export interface ContactImportRequest {
  contacts: ContactCreateRequest[];
}

export interface ListCreateRequest {
  name: string;
  description?: string;
}

export interface ListImportRequest {
  lists: ListCreateRequest[];
}

export interface ListContactsRequest {
  contactIds: number[];
}

export interface UserRegistrationRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface UserLoginRequest {
  username: string;
  password: string;
}

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  full_name?: string;
  role?: 'admin' | 'user';
  is_active?: boolean;
  avatar_url?: string;
  email_verified?: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  password: string;
}

export interface EmailResult {
  success: boolean;
  message: string;
  id?: string;
  imageInfo?: {
    base64Count: number;
    urlCount: number;
    totalSize: number;
  };
}

export interface ServiceStatus {
  server: boolean;
  email: boolean;
  database: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

// Requests para contactos
export interface CreateContactRequest {
  name: string;
  email: string;
  status?: 'active' | 'inactive';
}

export interface UpdateContactRequest {
  name?: string;
  email?: string;
  status?: 'active' | 'inactive';
}

// Requests para listas
export interface CreateListRequest {
  name: string;
  description?: string;
}

export interface UpdateListRequest {
  name?: string;
  description?: string;
}

// Otros tipos útiles
export interface ImportContactsRequest {
  contacts: CreateContactRequest[];
}

export interface AddContactsToListRequest {
  contactIds: number[];
}
