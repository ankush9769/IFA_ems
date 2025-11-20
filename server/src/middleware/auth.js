import createHttpError from 'http-errors';
import { verifyToken } from '../utils/token.js';

export const authenticate = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization || req.cookies?.accessToken;

    if (!authHeader) {
      throw createHttpError(401, 'Authentication required');
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : authHeader;
    const payload = verifyToken(token, process.env.JWT_ACCESS_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    next(createHttpError(error.status || 401, 'Invalid or expired token'));
  }
};

export const authorize =
  (...allowedRoles) =>
  (req, _res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(createHttpError(403, 'Forbidden'));
    }
    return next();
  };

