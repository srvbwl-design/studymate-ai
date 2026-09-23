import { Router } from 'express';
import {
  generateStudyPlan,
  getStudyPlans,
  getStudyPlan,
  toggleDay,
  deleteStudyPlan,
} from '../controllers/studyPlansController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { generateStudyPlanSchema, toggleDaySchema } from '../types';

const router = Router();

router.use(requireAuth);

router.post('/generate', validate(generateStudyPlanSchema), generateStudyPlan);
router.get('/', getStudyPlans);
router.get('/:id', getStudyPlan);
router.patch('/:id/days/:dayId', validate(toggleDaySchema), toggleDay);
router.delete('/:id', deleteStudyPlan);

export default router;
