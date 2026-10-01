import mongoose from 'mongoose';

const dltTemplateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  templateId: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['Transactional', 'Promotional', 'OTP'], default: 'Transactional' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

export const DltTemplate = mongoose.model('DltTemplate', dltTemplateSchema);

const senderIdSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderId: { type: String, required: true, maxlength: 6 },
  entityId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

export const SenderId = mongoose.model('SenderId', senderIdSchema);
