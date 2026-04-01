let permissionRequested = false;
const REMINDER_DEBUG_PREFIX = '[Reminder]';

export function createReminderNotificationKey({ medicineId, date, time }) {
  return `notified_${medicineId}_${date}_${time}`;
}

export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.info(`${REMINDER_DEBUG_PREFIX} Notification API unsupported`);
    return 'unsupported';
  }

  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission;
  }

  if (permissionRequested) {
    return Notification.permission;
  }

  permissionRequested = true;
  const permission = await Notification.requestPermission();
  console.info(`${REMINDER_DEBUG_PREFIX} Notification permission: ${permission}`);
  return permission;
}

export function sendReminderNotification({ title, body, tag }) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.info(`${REMINDER_DEBUG_PREFIX} Notification API unavailable`);
    return false;
  }

  if (Notification.permission !== 'granted') {
    console.info(`${REMINDER_DEBUG_PREFIX} Notification blocked by permission state: ${Notification.permission}`);
    return false;
  }

  new Notification(title, {
    body,
    tag,
    icon: '/favicon.ico',
  });

  return true;
}

export function playReminderAlert() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      return;
    }

    const audioContext = new AudioCtx();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.45);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.45);
  } catch {
    // Ignore audio failures to keep reminders non-blocking.
  }
}
