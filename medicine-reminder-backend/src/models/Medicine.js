import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dosage: {
      type: String,
      required: true,
      trim: true,
    },
    diseaseName: {
      type: String,
      trim: true,
      default: '',
    },
    frequency: {
      type: String,
      enum: ['once daily', 'twice daily', 'thrice daily'],
      required: true,
    },
    timeSlots: {
      type: [String],
      default: [],
    },
    daysOfWeek: {
      type: [
        {
          type: String,
          enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        },
      ],
      default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    caregiverEscalationMinutes: {
      type: Number,
      min: 5,
      max: 240,
      default: 30,
    },
  },
  {
    timestamps: true,
  }
);

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;
