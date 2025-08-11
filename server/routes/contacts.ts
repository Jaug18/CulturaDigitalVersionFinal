import { Router } from 'express';
import multer from 'multer';
import contactController from '@/controllers/contactController';
import { authenticateToken } from '@/config/auth';

const router = Router();

// Configurar multer para la subida de archivos
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de contactos
router.get('/', contactController.getContacts.bind(contactController));
router.post('/', contactController.createContact.bind(contactController));
router.put('/:id', contactController.updateContact.bind(contactController));
router.delete('/:id', contactController.deleteContact.bind(contactController));
router.patch('/:id/status', contactController.updateContactStatus.bind(contactController));
router.get('/export', contactController.exportContacts.bind(contactController));
router.post('/upload', upload.single('file'), contactController.uploadContacts.bind(contactController));
router.post('/import', contactController.importContacts.bind(contactController));

export default router;
