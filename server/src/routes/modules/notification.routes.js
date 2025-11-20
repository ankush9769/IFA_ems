import { Router } from 'express';
import { createNotification, listNotifications } from '../../controllers/notification.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { USER_ROLES } from '../../constants/roles.js';

const router = Router();

router.use(authenticate, authorize(USER_ROLES.ADMIN));
router.route('/').get(listNotifications).post(createNotification);

export default router;

