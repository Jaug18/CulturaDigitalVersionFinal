export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  fullName?: string;
  avatarUrl?: string;
  role: 'admin' | 'user';
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  emailVerified: boolean;
  emailVerificationToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: number;
  userId: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface List {
  id: number;
  userId: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  contactCount?: number;
}

export interface Email {
  id: number;
  userId: number;
  toEmail: string[];
  subject: string;
  fromEmail: string;
  fromName?: string;
  status: 'sent' | 'failed' | 'pending';
  message?: string;
  emailId?: string;
  contentPreview?: string;
  tituloPrincipal?: string;
  subtitulo?: string;
  contenido?: string;
  templateId?: string;
  imagenesBase64?: number;
  imagenesUrl?: number;
  imagenesTotalKb?: number;
  timestamp: Date;
}

export interface ScheduledEmail {
  id: number;
  userId: number;
  toEmail: string[];
  subject: string;
  htmlContent: string;
  fromEmail: string;
  fromName?: string;
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  tituloPrincipal?: string;
  subtitulo?: string;
  contenido?: string;
  templateId?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  errorMessage?: string;
}

export interface RefreshToken {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface LoginAttempt {
  id: number;
  username: string;
  ipAddress: string;
  attemptedAt: Date;
  success: boolean;
  userAgent?: string;
}

export interface ListContact {
  listId: number;
  contactId: number;
  addedAt: Date;
}
