import { Router } from 'express';
import {
  getConversations,
  getConversation,
  createConversation,
  deleteConversation,
  sendMessage,
} from '../controllers/chatController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { chatMessageSchema, createConversationSchema } from '../types';

const router = Router();

router.use(requireAuth);

router.get('/conversations', getConversations);
router.post('/conversations', validate(createConversationSchema), createConversation);
router.get('/conversations/:id', getConversation);
router.delete('/conversations/:id', deleteConversation);

router.post('/chat', validate(chatMessageSchema), sendMessage);

export default router;
