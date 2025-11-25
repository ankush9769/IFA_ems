import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import {
  getOrCreateChat,
  getAllChats,
  sendMessage,
  markAsRead,
} from '../../controllers/chat.controller.js';

const router = Router();

// Get all chats (admin only)
router.get('/', authenticate, authorize('admin'), getAllChats);

// Get or create chat
router.get('/my-chat', authenticate, authorize('client', 'admin'), getOrCreateChat);
router.get('/:clientId', authenticate, authorize('admin'), getOrCreateChat);

// Send message
router.post('/message', authenticate, authorize('client', 'admin'), sendMessage);

// Mark as read
router.put('/:clientId/read', authenticate, authorize('client', 'admin'), markAsRead);

export default router;
