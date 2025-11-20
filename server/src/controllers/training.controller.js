import TrainingUpdate from '../models/TrainingUpdate.js';

export const listTrainingUpdates = async (_req, res, next) => {
  try {
    const items = await TrainingUpdate.find().populate('employee', 'name status');
    res.json(items);
  } catch (error) {
    next(error);
  }
};

export const createTrainingUpdate = async (req, res, next) => {
  try {
    const update = await TrainingUpdate.create(req.body);
    res.status(201).json(update);
  } catch (error) {
    next(error);
  }
};

