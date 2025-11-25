import Employee from '../models/Employee.js';
import Project from '../models/Project.js';
import DailyUpdate from '../models/DailyUpdate.js';
import ChecklistStatus from '../models/ChecklistStatus.js';
import createHttpError from 'http-errors';

export const listEmployees = async (_req, res, next) => {
  try {
    const employees = await Employee.find().populate('activeProjects', 'clientName status priority');
    res.json(employees);
  } catch (error) {
    next(error);
  }
};

export const getEmployeeAssignments = async (req, res, next) => {
  try {
    const employeeId = req.params.id;
    const projects = await Project.find({ assignees: employeeId }).select(
      'clientName status priority startDate endDate',
    );
    res.json({ employeeId, projects });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeDailyUpdates = async (req, res, next) => {
  try {
    // Get employee reference from authenticated user
    const employeeRef = req.user?.employeeRef;
    
    if (!employeeRef) {
      throw createHttpError(400, 'Employee reference not found for this user');
    }

    // Fetch all daily updates for this employee
    const updates = await DailyUpdate.find({ employee: employeeRef })
      .populate('project', 'clientName projectDescription status')
      .populate('employee', 'name roleTitle')
      .sort({ date: -1 });

    res.json({ updates });
  } catch (error) {
    next(error);
  }
};


export const getEmployeeChecklistStatus = async (req, res, next) => {
  try {
    // Get employee reference from authenticated user
    const employeeRef = req.user?.employeeRef;
    
    if (!employeeRef) {
      throw createHttpError(400, 'Employee reference not found for this user');
    }

    // Fetch all checklist statuses for this employee
    const checklistStatuses = await ChecklistStatus.find({ employee: employeeRef })
      .sort({ date: -1 });

    res.json({ checklistStatuses });
  } catch (error) {
    next(error);
  }
};

export const saveChecklistStatus = async (req, res, next) => {
  try {
    // Get employee reference from authenticated user
    const employeeRef = req.user?.employeeRef;
    
    if (!employeeRef) {
      throw createHttpError(400, 'Employee reference not found for this user');
    }

    const { date, checklist } = req.body;

    if (!date) {
      throw createHttpError(400, 'Date is required');
    }

    if (!checklist || typeof checklist !== 'object') {
      throw createHttpError(400, 'Checklist data is required');
    }

    // Upsert: update if exists, create if not
    const checklistStatus = await ChecklistStatus.findOneAndUpdate(
      { employee: employeeRef, date: new Date(date) },
      { checklist },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(checklistStatus);
  } catch (error) {
    next(error);
  }
};

export const getEmployeeChecklistStatusByAdmin = async (req, res, next) => {
  try {
    const employeeId = req.params.employeeId;

    if (!employeeId) {
      throw createHttpError(400, 'Employee ID is required');
    }

    // Verify employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw createHttpError(404, 'Employee not found');
    }

    // Fetch all checklist statuses for this employee
    const checklistStatuses = await ChecklistStatus.find({ employee: employeeId })
      .sort({ date: -1 });

    res.json({ checklistStatuses, employee: { _id: employee._id, name: employee.name, roleTitle: employee.roleTitle } });
  } catch (error) {
    next(error);
  }
};

// Get my profile (employee)
export const getMyProfile = async (req, res, next) => {
  try {
    const employeeRef = req.user?.employeeRef;
    
    if (!employeeRef) {
      throw createHttpError(400, 'Employee reference not found for this user');
    }

    const employee = await Employee.findById(employeeRef);
    
    if (!employee) {
      throw createHttpError(404, 'Employee profile not found');
    }

    // Also get user data
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user.sub);

    res.json({ employee, user });
  } catch (error) {
    next(error);
  }
};

// Update my profile (employee)
export const updateMyProfile = async (req, res, next) => {
  try {
    const employeeRef = req.user?.employeeRef;
    
    if (!employeeRef) {
      throw createHttpError(400, 'Employee reference not found for this user');
    }

    const {
      name,
      contact,
      whatsappNumber,
      telegramHandle,
      linkedinUrl,
      githubUrl,
      location,
      availability,
      skills,
      roleTitle,
    } = req.body;

    const employee = await Employee.findByIdAndUpdate(
      employeeRef,
      {
        name,
        contact,
        whatsappNumber,
        telegramHandle,
        linkedinUrl,
        githubUrl,
        location,
        availability,
        skills,
        roleTitle,
      },
      { new: true, runValidators: true }
    );

    if (!employee) {
      throw createHttpError(404, 'Employee profile not found');
    }

    // Also update user name if changed
    if (name) {
      const User = (await import('../models/User.js')).default;
      await User.findByIdAndUpdate(req.user.sub, { name });
    }

    res.json(employee);
  } catch (error) {
    next(error);
  }
};
