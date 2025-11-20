import { Router } from 'express';
import {
  login,
  refresh,
  register,
  requestPasswordReset,
  resetPassword,
} from '../../controllers/auth.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { USER_ROLES } from '../../constants/roles.js';

const router = Router();

router.post('/register', register); // Public signup
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/reset-request', requestPasswordReset);
router.post('/reset', resetPassword);

export default router;

