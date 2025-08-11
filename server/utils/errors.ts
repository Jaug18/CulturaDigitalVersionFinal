export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Mantener el stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
    
    this.name = 'ApiError';
  }
}

export const handleError = (error: any, defaultMessage: string = 'Error interno del servidor') => {
  if (error instanceof ApiError) {
    return error;
  }
  
  console.error('Error no manejado:', error);
  return new ApiError(defaultMessage, 500);
};

export const handleAsyncError = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
