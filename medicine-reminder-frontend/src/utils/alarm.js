import alarmSoundUrl from '../assets/sounds/alarm.wav';

function createWebAudioFallback() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    return null;
  }

  const context = new AudioCtx();
  let intervalId = null;

  const beep = () => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = 'square';
    oscillator.frequency.value = 920;
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    const startAt = context.currentTime;
    gainNode.gain.setValueAtTime(0.0001, startAt);
    gainNode.gain.exponentialRampToValueAtTime(0.24, startAt + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.35);

    oscillator.start(startAt);
    oscillator.stop(startAt + 0.38);
  };

  return {
    start() {
      if (context.state === 'suspended') {
        void context.resume();
      }
      beep();
      intervalId = setInterval(beep, 900);
    },
    stop() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
}

export function createAlarmController() {
  if (typeof window === 'undefined') {
    return {
      start: () => Promise.resolve(false),
      stop: () => {},
    };
  }

  let audio = null;
  let fallback = null;

  return {
    async start() {
      try {
        if (!audio) {
          audio = new Audio(alarmSoundUrl);
          audio.loop = true;
          audio.preload = 'auto';
        }

        await audio.play();
        return true;
      } catch {
        if (!fallback) {
          fallback = createWebAudioFallback();
        }
        fallback?.start();
        return Boolean(fallback);
      }
    },
    stop() {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      fallback?.stop();
    },
  };
}

export function createAlarmKey({ medicineId, date, time }) {
  return `alarm_${medicineId}_${date}_${time}`;
}