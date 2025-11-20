import { Router } from 'express';
import { createTrainingUpdate, listTrainingUpdates } from '../../controllers/training.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { USER_ROLES } from '../../constants/roles.js';

const router = Router();

router.use(authenticate);
router
  .route('/')
  .get(authorize(USER_ROLES.ADMIN), listTrainingUpdates)
  .post(authorize(USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE), createTrainingUpdate);

export default router;

