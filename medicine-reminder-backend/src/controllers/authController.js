import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import sendPasswordResetEmail from '../utils/sendPasswordResetEmail.js';
import generateToken from '../utils/generateToken.js';

function getClientBaseUrl() {
  const configured = (process.env.CLIENT_URL || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return configured[0] || 'http://localhost:5173';
}

function serializeUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);
    return res.status(201).json({
      user: serializeUser(user),
      token,
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    return res.status(200).json({
      user: serializeUser(user),
      token,
    });
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res) {
  return res.status(200).json({ user: req.user });
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const baseUrl = getClientBaseUrl();
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;
    const resetPath = `/reset-password?token=${rawToken}`;
    const emailResult = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });

    return res.status(200).json({
      message: emailResult.sent
        ? 'Reset link sent to your email.'
        : 'Reset link generated. Email is not configured, use the link below.',
      emailSent: Boolean(emailResult.sent),
      emailReason: emailResult.reason || null,
      resetUrl,
      resetPath,
      resetToken: rawToken,
    });
  } catch (error) {
    return next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    return res.status(200).json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    return next(error);
  }
}
