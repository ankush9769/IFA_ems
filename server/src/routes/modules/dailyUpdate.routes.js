import { Router } from 'express';
import { createDailyUpdate, listDailyUpdates } from '../../controllers/dailyUpdate.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { USER_ROLES } from '../../constants/roles.js';

const router = Router();

router.use(authenticate);
router
  .route('/')
  .get(authorize(USER_ROLES.ADMIN, USER_ROLES.CLIENT), listDailyUpdates)
  .post(authorize(USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE), createDailyUpdate);

export default router;

