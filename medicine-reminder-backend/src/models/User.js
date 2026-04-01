import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    caregiver: {
      name: {
        type: String,
        trim: true,
        default: '',
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: '',
      },
      phone: {
        type: String,
        trim: true,
        default: '',
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },
    pushSubscriptions: [
      {
        endpoint: {
          type: String,
          trim: true,
          default: '',
        },
        expirationTime: {
          type: Number,
          default: null,
        },
        keys: {
          p256dh: {
            type: String,
            default: '',
          },
          auth: {
            type: String,
            default: '',
          },
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export default User;
