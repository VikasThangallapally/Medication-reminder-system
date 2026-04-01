import User from '../models/User.js';
import { getPushPublicKey } from '../utils/sendPushNotification.js';

function sanitizeSubscription(rawSubscription) {
  const subscription = rawSubscription && typeof rawSubscription === 'object' ? rawSubscription : null;
  if (!subscription) {
    return null;
  }

  const endpoint = String(subscription.endpoint || '').trim();
  const p256dh = String(subscription?.keys?.p256dh || '').trim();
  const auth = String(subscription?.keys?.auth || '').trim();

  if (!endpoint || !p256dh || !auth) {
    return null;
  }

  const expirationTime =
    Number.isFinite(Number(subscription.expirationTime)) && subscription.expirationTime !== null
      ? Number(subscription.expirationTime)
      : null;

  return {
    endpoint,
    expirationTime,
    keys: {
      p256dh,
      auth,
    },
  };
}

export async function subscribePush(req, res, next) {
  try {
    const sanitized = sanitizeSubscription(req.body?.subscription);
    if (!sanitized) {
      return res.status(400).json({ message: 'Valid push subscription is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const nextSubscriptions = Array.isArray(user.pushSubscriptions) ? [...user.pushSubscriptions] : [];
    const existingIndex = nextSubscriptions.findIndex((item) => item.endpoint === sanitized.endpoint);
    const now = new Date();

    if (existingIndex >= 0) {
      nextSubscriptions[existingIndex] = {
        ...nextSubscriptions[existingIndex].toObject?.(),
        ...sanitized,
        updatedAt: now,
      };
    } else {
      nextSubscriptions.push({
        ...sanitized,
        createdAt: now,
        updatedAt: now,
      });
    }

    user.pushSubscriptions = nextSubscriptions;
    await user.save();

    return res.status(200).json({
      message: 'Push subscription saved',
      count: user.pushSubscriptions.length,
    });
  } catch (error) {
    return next(error);
  }
}

export function getVapidPublicKey(req, res) {
  const key = getPushPublicKey();
  return res.status(200).json({
    publicKey: key || '',
  });
}

export async function unsubscribePush(req, res, next) {
  try {
    const endpoint = String(req.body?.endpoint || '').trim();
    if (!endpoint) {
      return res.status(400).json({ message: 'Subscription endpoint is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.pushSubscriptions = (user.pushSubscriptions || []).filter((item) => item.endpoint !== endpoint);
    await user.save();

    return res.status(200).json({
      message: 'Push subscription removed',
      count: user.pushSubscriptions.length,
    });
  } catch (error) {
    return next(error);
  }
}
