import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/stats', getDashboardData);

export default router;
