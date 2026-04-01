import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

let configured = false;
let warned = false;

function ensureWebPushConfigured() {
  if (configured) {
    return true;
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    if (!warned) {
      warned = true;
      console.warn('[Push] Skipping push notifications because VAPID keys are not configured');
    }
    return false;
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  configured = true;
  return true;
}

function normalizeSubscriptions(subscriptions) {
  if (!Array.isArray(subscriptions)) {
    return [];
  }

  return subscriptions
    .map((item) => ({
      endpoint: String(item?.endpoint || '').trim(),
      expirationTime: item?.expirationTime ?? null,
      keys: {
        p256dh: String(item?.keys?.p256dh || '').trim(),
        auth: String(item?.keys?.auth || '').trim(),
      },
    }))
    .filter((item) => item.endpoint && item.keys.p256dh && item.keys.auth);
}

export default async function sendPushNotification(subscriptions, payload) {
  if (!ensureWebPushConfigured()) {
    return { sentCount: 0, failedCount: 0 };
  }

  const normalizedSubscriptions = normalizeSubscriptions(subscriptions);
  if (normalizedSubscriptions.length === 0) {
    return { sentCount: 0, failedCount: 0 };
  }

  const body = JSON.stringify(payload || {});
  let sentCount = 0;
  let failedCount = 0;

  await Promise.all(
    normalizedSubscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, body);
        sentCount += 1;
      } catch {
        failedCount += 1;
      }
    })
  );

  return { sentCount, failedCount };
}

export function getPushPublicKey() {
  return VAPID_PUBLIC_KEY;
}
