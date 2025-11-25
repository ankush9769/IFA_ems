import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['admin', 'client'], required: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientName: { type: String, required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    messages: [messageSchema],
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    unreadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for faster queries
chatSchema.index({ client: 1 });
chatSchema.index({ lastMessageAt: -1 });

export default mongoose.model('Chat', chatSchema);
