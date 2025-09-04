// Declaraciones de tipos globales
declare namespace Express {
  export interface Multer {
    File: {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
    }
  }
}

declare module 'multer' {
  export interface FileFilterCallback {
    (error: Error): void;
    (error: null, acceptFile: boolean): void;
  }
}
