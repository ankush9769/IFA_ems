import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    organization: { type: String, required: true, trim: true },
    primaryContact: { type: String },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String },
    address: { type: String },
    timezone: { type: String },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    notes: { type: String },
    comments: [
      {
        message: String,
        createdAt: { type: Date, default: Date.now },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model('Client', clientSchema);

