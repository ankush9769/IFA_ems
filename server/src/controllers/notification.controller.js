import Notification from '../models/Notification.js';

export const listNotifications = async (_req, res, next) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(100);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const notification = await Notification.create(req.body);
    // TODO integrate with <insert notification provider>
    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
};

