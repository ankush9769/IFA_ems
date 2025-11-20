import User from '../models/User.js';

export const listUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const users = await User.find(query).select('-password -resetTokenHash -resetTokenExpiresAt');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role, status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, status },
      { new: true, runValidators: true },
    );
    res.json(user);
  } catch (error) {
    next(error);
  }
};

