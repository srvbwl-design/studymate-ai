import { Router } from 'express';
import { register, login, getCurrentUser, logout } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../types';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', requireAuth, getCurrentUser);

export default router;
