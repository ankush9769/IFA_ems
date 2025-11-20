import { Router } from 'express';
import { 
  getEmployeeAssignments, 
  getEmployeeDailyUpdates, 
  getEmployeeChecklistStatus,
  getEmployeeChecklistStatusByAdmin,
  saveChecklistStatus,
  listEmployees 
} from '../../controllers/employee.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { USER_ROLES } from '../../constants/roles.js';

const router = Router();

router.use(authenticate);
router.get('/', authorize(USER_ROLES.ADMIN), listEmployees);
router.get('/daily-updates', authorize(USER_ROLES.EMPLOYEE), getEmployeeDailyUpdates);
router.get('/checklist-status', authorize(USER_ROLES.EMPLOYEE), getEmployeeChecklistStatus);
router.post('/checklist-status', authorize(USER_ROLES.EMPLOYEE), saveChecklistStatus);
router.get('/:employeeId/checklist-status', authorize(USER_ROLES.ADMIN), getEmployeeChecklistStatusByAdmin);
router.get('/:id/assignments', authorize(USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE), getEmployeeAssignments);

export default router;

