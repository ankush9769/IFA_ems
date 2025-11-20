import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    roleTitle: { type: String },
    contact: { type: String },
    photoUrl: { type: String },
    activeProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    skills: [{ type: String }],
    availability: { type: String, default: 'Full-time' },
    telegramHandle: { type: String },
    whatsappNumber: { type: String },
    employmentType: { type: String, default: '<insert employment type list>' },
    location: { type: String },
    trainingParticipation: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TrainingUpdate' }],
  },
  { timestamps: true },
);

export default mongoose.model('Employee', employeeSchema);

