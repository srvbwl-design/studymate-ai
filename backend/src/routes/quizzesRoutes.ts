import { Router } from 'express';
import {
  generateQuiz,
  getQuizzes,
  getQuiz,
  submitQuiz,
} from '../controllers/quizzesController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { generateQuizSchema, submitQuizSchema } from '../types';

const router = Router();

router.use(requireAuth);

router.post('/generate', validate(generateQuizSchema), generateQuiz);
router.get('/', getQuizzes);
router.get('/:id', getQuiz);
router.post('/:id/submit', validate(submitQuizSchema), submitQuiz);

export default router;
