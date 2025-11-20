import { Router } from 'express';
import {
  listClients,
  getClient,
  getClientProjects,
  createClientProject
} from '../../controllers/client.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { USER_ROLES } from '../../constants/roles.js';

const router = Router();

router.use(authenticate);

// ADMIN only
router.get('/', authorize(USER_ROLES.ADMIN), listClients);

// Fetch client profile
router.get('/:id', authorize(USER_ROLES.ADMIN, USER_ROLES.CLIENT), getClient);

// Fetch client projects
router.get('/:id/projects', authorize(USER_ROLES.ADMIN, USER_ROLES.CLIENT), getClientProjects);

// Client creates a new project
router.post('/:id/projects', authorize(USER_ROLES.ADMIN, USER_ROLES.CLIENT), createClientProject);

export default router;
