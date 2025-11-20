import mongoose from 'mongoose';

const checklistStatusSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, required: true },
    checklist: {
      type: Map,
      of: Boolean,
      default: {},
    },
  },
  { timestamps: true },
);

// Compound index for fast lookups
checklistStatusSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.model('ChecklistStatus', checklistStatusSchema);
