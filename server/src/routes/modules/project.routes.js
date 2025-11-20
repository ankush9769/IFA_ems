import { Router } from 'express';
import {
  addProjectDailyUpdate,
  getProjectDailyUpdates,
  createProject,
  getProject,
  listProjects,
  updateProject,
} from '../../controllers/project.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { USER_ROLES } from '../../constants/roles.js';

const router = Router();

router.use(authenticate);
router
  .route('/')
  .get(listProjects)
  .post(authorize(USER_ROLES.ADMIN, USER_ROLES.CLIENT), createProject);

router
  .route('/:id')
  .get(getProject)
  .put(authorize(USER_ROLES.ADMIN), updateProject);

router.post('/:id/updates', authorize(USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE), addProjectDailyUpdate);
router.get('/:id/updates', getProjectDailyUpdates);

export default router;

