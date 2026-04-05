import mongoose from 'mongoose';

const medicineInfoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    uses: {
      type: [String],
      default: [],
    },
    precautions: {
      type: [String],
      default: [],
    },
    sideEffects: {
      type: [String],
      default: [],
    },
    dosageByAge: {
      type: [
        {
          ageGroup: { type: String, required: true, trim: true },
          dose: { type: String, required: true, trim: true },
          frequency: { type: String, default: '', trim: true },
          maxDaily: { type: String, default: '', trim: true },
          notes: { type: String, default: '', trim: true },
        },
      ],
      default: [],
    },
    lifespan: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

medicineInfoSchema.pre('validate', function setNormalizedName(next) {
  this.normalizedName = String(this.name || '').trim().toLowerCase();
  next();
});

medicineInfoSchema.index({ name: 'text', category: 'text', purpose: 'text' });

const MedicineInfo = mongoose.model('MedicineInfo', medicineInfoSchema);

export default MedicineInfo;
