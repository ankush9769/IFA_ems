import mongoose from 'mongoose';
import { PROJECT_STATUS, PRIORITY_LEVELS, CLIENT_TYPES } from '../constants/roles.js';

const milestoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dueDate: { type: Date },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Blocked'], default: 'Pending' },
    notes: { type: String },
  },
  { _id: true },
);

const fileSchema = new mongoose.Schema(
  {
    label: String,
    url: String,
    storageKey: String,
    type: { type: String, enum: ['file', 'link'], default: 'link' },
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true, trim: true },
    status: { type: String, enum: PROJECT_STATUS, default: 'Active' },
    projectDescription: { type: String },
    filesLinks: [fileSchema],
    clientType: { type: String, enum: CLIENT_TYPES, default: 'Existing' },
    projectType: { type: String, default: '<insert project type>' },
    priority: { type: String, enum: PRIORITY_LEVELS, default: 'Medium' },
    estHoursRequired: { type: Number, default: 0 },
    totalHoursSpent: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    assigned: { type: Boolean, default: false },
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    leadAssignee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    vaIncharge: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    updateIncharge: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    telegramGroupLink: { type: String },
    whatsappLink: { type: String },
    milestones: [milestoneSchema],
    milestoneDetails: { type: String },
    tags: [{ type: String }],
    stockMarketFlag: { type: Boolean, default: false },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    deadlineAlertSent: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

projectSchema.index({ clientName: 'text', projectDescription: 'text', tags: 'text' });

export default mongoose.model('Project', projectSchema);

