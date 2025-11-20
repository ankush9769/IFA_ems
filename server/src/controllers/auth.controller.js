import crypto from 'crypto';
import createHttpError from 'http-errors';
import User from '../models/User.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/token.js';

const setAuthCookies = (res, accessToken, refreshToken) => {
  const secure = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    sameSite: secure ? 'none' : 'lax',
    secure,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: secure ? 'none' : 'lax',
    secure,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      throw createHttpError(409, 'User already exists');
    }

    const hashed = await hashPassword(password);
    const user = await User.create({ name, email, password: hashed, role });

    // If registering as employee, create Employee record
    if (role === 'employee' || role === 'applicant') {
      const Employee = (await import('../models/Employee.js')).default;
      const employee = await Employee.create({
        user: user._id,
        name: user.name,
        status: 'Active',
        roleTitle: role === 'applicant' ? 'Applicant' : 'Employee',
      });
      user.employeeRef = employee._id;
      await user.save();
    }

    res.status(201).json({ id: user._id, email: user.email });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw createHttpError(401, 'Invalid credentials');
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      throw createHttpError(401, 'Invalid credentials');
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      accessToken,
      refreshToken,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        employeeRef: user.employeeRef,
        clientRef: user.clientRef
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (!token) {
      throw createHttpError(401, 'Refresh token required');
    }
    const payload = verifyToken(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) {
      throw createHttpError(401, 'User not found');
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setAuthCookies(res, accessToken, refreshToken);
    res.json({ accessToken, refreshToken });
  } catch (error) {
    next(createHttpError(401, error.message));
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+resetTokenHash +resetTokenExpiresAt');
    if (!user) {
      return res.json({ message: 'If the email exists, reset instructions were sent' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    const hashed = await hashPassword(token);
    user.resetTokenHash = hashed;
    user.resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    // TODO: send via email provider placeholder
    console.log(`[PASSWORD RESET TOKEN] ${token}`);
    res.json({ message: 'Reset instructions sent via <insert notification provider>' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token) {
      throw createHttpError(400, 'Token required');
    }

    const user = await User.findOne({ resetTokenExpiresAt: { $gt: new Date() } }).select(
      '+resetTokenHash +resetTokenExpiresAt',
    );
    if (!user) {
      throw createHttpError(400, 'Invalid or expired token');
    }

    const valid = await verifyPassword(token, user.resetTokenHash);
    if (!valid) {
      throw createHttpError(400, 'Invalid token');
    }

    user.password = await hashPassword(password);
    user.resetTokenHash = undefined;
    user.resetTokenExpiresAt = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

