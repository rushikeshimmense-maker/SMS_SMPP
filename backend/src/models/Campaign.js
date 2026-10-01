import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  senderId: { type: String, required: true },
  route: { type: String, enum: ['Transactional', 'Promotional', 'OTP'], default: 'Transactional' },
  dltTemplateId: { type: String },
  audienceCount: { type: Number, default: 0 },
  deliveredCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Processing', 'Completed', 'Failed', 'Cancelled'], default: 'Pending' },
  isScheduled: { type: Boolean, default: false },
  scheduledTime: { type: Date },
}, { timestamps: true });

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;
