import { notificationService } from '../services/api';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export async function ensurePushSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    console.info('[Push] Unsupported in this environment');
    return { subscribed: false, reason: 'unsupported' };
  }

  const registration = await navigator.serviceWorker.ready;
  const permission =
    Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();

  if (permission !== 'granted') {
    console.info('[Push] Permission denied or dismissed:', permission);
    return { subscribed: false, reason: 'permission-denied' };
  }

  const { data } = await notificationService.getPublicKey();
  const publicKey = String(data?.publicKey || '').trim();
  if (!publicKey) {
    console.warn('[Push] Missing public key from backend');
    return { subscribed: false, reason: 'missing-public-key' };
  }

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  await notificationService.subscribe({
    subscription: subscription.toJSON(),
  });

  console.info('[Push] Subscription synced to backend');

  return {
    subscribed: true,
    endpoint: subscription.endpoint,
  };
}
