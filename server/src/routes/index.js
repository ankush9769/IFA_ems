import { Router } from 'express';
import authRoutes from './modules/auth.routes.js';
import userRoutes from './modules/user.routes.js';
import projectRoutes from './modules/project.routes.js';
import dailyUpdateRoutes from './modules/dailyUpdate.routes.js';
import trainingRoutes from './modules/training.routes.js';
import employeeRoutes from './modules/employee.routes.js';
import clientRoutes from './modules/client.routes.js';
import notificationRoutes from './modules/notification.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/daily-updates', dailyUpdateRoutes);
router.use('/training-updates', trainingRoutes);
router.use('/employees', employeeRoutes);
router.use('/clients', clientRoutes);
router.use('/notifications', notificationRoutes);

export default router;

