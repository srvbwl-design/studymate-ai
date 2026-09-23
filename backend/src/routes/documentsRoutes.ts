import { Router } from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  askDocument,
} from '../controllers/documentsController';
import { requireAuth } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';
import { validate } from '../middleware/validate';
import { askDocumentSchema } from '../types';

const router = Router();

router.use(requireAuth);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);
router.post('/:id/ask', validate(askDocumentSchema), askDocument);

export default router;
