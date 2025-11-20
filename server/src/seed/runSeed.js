import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Project from '../models/Project.js';
import DailyUpdate from '../models/DailyUpdate.js';
import { hashPassword } from '../utils/password.js';
import { USER_ROLES } from '../constants/roles.js';

dotenv.config();

const seed = async () => {
  await connectDatabase();

  await Promise.all([User.deleteMany({}), Employee.deleteMany({}), Project.deleteMany({}), DailyUpdate.deleteMany({})]);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: await hashPassword('ChangeMe123!'),
    role: 'admin',
  });

  const employeeUser = await User.create({
    name: 'Employee One',
    email: 'employee@example.com',
    password: await hashPassword('ChangeMe123!'),
    role: 'employee',
  });

  const employee = await Employee.create({
    user: employeeUser._id,
    name: employeeUser.name,
    status: 'Active',
  });

  const project = await Project.create({
    clientName: 'Sample Client',
    status: 'Active',
    projectDescription: 'Initial migration project',
    priority: 'High',
    assigned: true,
    assignees: [employee._id],
    leadAssignee: employee._id,
    createdBy: admin._id,
  });

  employee.activeProjects = [project._id];
  await employee.save();

  await DailyUpdate.create({
    project: project._id,
    employee: employee._id,
    summary: 'Kick-off meeting completed',
    nextPlan: 'Prepare onboarding checklist',
    hoursLogged: 4,
    createdBy: employeeUser._id,
  });

  console.log('Seed data generated');
  await mongoose.connection.close();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

