import mongoose from 'mongoose';

const reminderLogSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
    },
    time: {
      type: String,
      required: true,
      match: /^\d{2}:\d{2}$/,
    },
    status: {
      type: String,
      enum: ['taken', 'missed'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

reminderLogSchema.index({ medicine: 1, date: 1, time: 1 }, { unique: true });

const ReminderLog = mongoose.model('ReminderLog', reminderLogSchema);

export default ReminderLog;
