import { Router } from 'express';
import {
  generateNotes,
  getNotes,
  getNote,
  saveNote,
  updateNote,
  deleteNote,
} from '../controllers/notesController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { generateNotesSchema, saveNoteSchema, updateNoteSchema } from '../types';

const router = Router();

router.use(requireAuth);

router.post('/generate', validate(generateNotesSchema), generateNotes);
router.get('/', getNotes);
router.post('/', validate(saveNoteSchema), saveNote);
router.get('/:id', getNote);
router.put('/:id', validate(updateNoteSchema), updateNote);
router.delete('/:id', deleteNote);

export default router;
