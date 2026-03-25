import mongoose from 'mongoose';

const credentialConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    payload: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CredentialConfig = mongoose.model('CredentialConfig', credentialConfigSchema);

export default CredentialConfig;
