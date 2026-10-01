import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null }, // Null if single API SMS
  senderId: { type: String, required: true },
  to: { type: String, required: true },
  text: { type: String, required: true },
  segments: { type: Number, default: 1 },
  cost: { type: Number, default: 1 },
  status: { type: String, enum: ['submitted', 'delivered', 'failed', 'dropped', 'rejected'], default: 'submitted' },
  providerMessageId: { type: String, default: null }, // ID from SMPP provider
  dlrReceivedAt: { type: Date, default: null },
  errorMessage: { type: String, default: null },
}, { timestamps: true });

// Index for fast reporting and lookups
messageSchema.index({ userId: 1, createdAt: -1 });
messageSchema.index({ campaignId: 1 });
messageSchema.index({ status: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
