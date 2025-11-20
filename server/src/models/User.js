import mongoose from 'mongoose';
import { USER_ROLES } from '../constants/roles.js';

const preferenceSchema = new mongoose.Schema(
  {
    theme: { type: String, default: 'system' },
    locale: { type: String, default: 'en' },
    notificationsEnabled: { type: Boolean, default: true },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(USER_ROLES), default: USER_ROLES.EMPLOYEE },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    designation: { type: String },
    department: { type: String },
    timezone: { type: String, default: 'UTC' },
    photoUrl: { type: String },
    preferences: { type: preferenceSchema, default: () => ({}) },
    lastLoginAt: { type: Date },
    employeeRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    clientRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    applicantRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Applicant' },
    resetTokenHash: { type: String, select: false },
    resetTokenExpiresAt: { type: Date, select: false },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);

