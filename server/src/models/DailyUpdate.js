import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    storageKey: String,
    type: { type: String, default: 'file' },
  },
  { _id: false },
);

const dailyUpdateSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, default: Date.now },
    summary: { type: String, required: true },
    nextPlan: { type: String, default: '' },
    blockers: { type: String },
    hoursLogged: { type: Number, default: 0 },
    attachments: [attachmentSchema],
    visibility: { type: String, enum: ['Admin', 'Client', 'Internal'], default: 'Internal' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

dailyUpdateSchema.index({ date: -1 });

export default mongoose.model('DailyUpdate', dailyUpdateSchema);

