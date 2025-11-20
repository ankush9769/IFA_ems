import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';

dotenv.config();

const syncEmployees = async () => {
  await connectDatabase();

  // Find all users with employee role
  const employeeUsers = await User.find({ role: 'employee' });

  console.log(`Found ${employeeUsers.length} employee users`);

  for (const user of employeeUsers) {
    // Check if employee record already exists
    let employee = await Employee.findOne({ user: user._id });

    if (!employee) {
      // Create employee record
      employee = await Employee.create({
        user: user._id,
        name: user.name,
        status: 'Active',
        roleTitle: 'Employee',
      });

      // Link employee to user
      user.employeeRef = employee._id;
      await user.save();

      console.log(`Created employee record for ${user.name}`);
    } else {
      console.log(`Employee record already exists for ${user.name}`);
    }
  }

  console.log('Employee sync completed');
  await mongoose.connection.close();
};

syncEmployees().catch((err) => {
  console.error(err);
  process.exit(1);
});
