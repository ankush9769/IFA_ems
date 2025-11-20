import DailyUpdate from '../models/DailyUpdate.js';

export const listDailyUpdates = async (req, res, next) => {
  try {
    const { projectId, employeeId } = req.query;
    const filters = {};
    if (projectId) filters.project = projectId;
    if (employeeId) filters.employee = employeeId;

    const updates = await DailyUpdate.find(filters)
      .sort({ date: -1 })
      .populate('project', 'clientName')
      .populate('employee', 'name status');
    res.json(updates);
  } catch (error) {
    next(error);
  }
};

export const createDailyUpdate = async (req, res, next) => {
  try {
    const update = await DailyUpdate.create({ ...req.body, createdBy: req.user.sub });
    res.status(201).json(update);
  } catch (error) {
    next(error);
  }
};

