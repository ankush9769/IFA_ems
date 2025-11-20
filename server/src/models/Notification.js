import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    channel: { type: String, enum: ['email', 'sms', 'chat', 'push'], default: 'email' },
    template: { type: String, required: true },
    payload: mongoose.Schema.Types.Mixed,
    status: { type: String, enum: ['queued', 'sent', 'failed'], default: 'queued' },
    sentAt: { type: Date },
    retries: { type: Number, default: 0 },
    error: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model('Notification', notificationSchema);

