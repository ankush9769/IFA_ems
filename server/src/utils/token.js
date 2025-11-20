import jwt from 'jsonwebtoken';

const signToken = (payload, secret, expiresIn) =>
  jwt.sign(payload, secret, {
    expiresIn,
  });

export const generateAccessToken = (user) =>
  signToken(
    { 
      sub: user._id, 
      role: user.role, 
      email: user.email,
      employeeRef: user.employeeRef,
      clientRef: user.clientRef
    },
    process.env.JWT_ACCESS_SECRET,
    process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  );

export const generateRefreshToken = (user) =>
  signToken(
    { sub: user._id, tokenType: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  );

export const verifyToken = (token, secret) => jwt.verify(token, secret);

