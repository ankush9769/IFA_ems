import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';

dotenv.config();

const check = async () => {
  await connectDatabase();
  
  const user = await User.findOne({ email: 'emp1@gmail.com' });
  console.log('User:', user);
  
  if (user?.employeeRef) {
    const employee = await Employee.findById(user.employeeRef);
    console.log('Employee:', employee);
  } else {
    console.log('No employeeRef found');
  }
  
  process.exit();
};

check();
