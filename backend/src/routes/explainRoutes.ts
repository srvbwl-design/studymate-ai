import { Router } from 'express';
import { explainTopic } from '../controllers/explainController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { explainTopicSchema } from '../types';

const router = Router();

router.use(requireAuth);

router.post('/explain', validate(explainTopicSchema), explainTopic);

export default router;
