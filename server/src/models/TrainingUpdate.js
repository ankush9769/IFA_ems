import mongoose from 'mongoose';

const trainingUpdateSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    course: { type: String, required: true },
    date: { type: Date, default: Date.now },
    tasksDone: { type: String, required: true },
    notes: { type: String },
    attachments: [
      {
        name: String,
        url: String,
        storageKey: String,
      },
    ],
    mentor: { type: String },
    status: { type: String, default: 'In Progress' },
  },
  { timestamps: true },
);

export default mongoose.model('TrainingUpdate', trainingUpdateSchema);

