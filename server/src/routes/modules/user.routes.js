import { Router } from 'express';
import { listUsers, updateUserRole } from '../../controllers/user.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { USER_ROLES } from '../../constants/roles.js';

const router = Router();

router.use(authenticate, authorize(USER_ROLES.ADMIN));
router.get('/', listUsers);
router.put('/:id', updateUserRole);

export default router;

