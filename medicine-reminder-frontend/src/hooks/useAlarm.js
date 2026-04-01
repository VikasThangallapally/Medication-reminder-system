import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createAlarmController, createAlarmKey } from '../utils/alarm';

export default function useAlarm({ repeatMinutes = 2 } = {}) {
  const [activeReminder, setActiveReminder] = useState(null);
  const handledKeysRef = useRef(new Set());
  const snoozeTimersRef = useRef(new Map());
  const remindersRef = useRef(new Map());
  const alarmControllerRef = useRef(createAlarmController());

  const clearSnoozeTimer = useCallback((key) => {
    const timer = snoozeTimersRef.current.get(key);
    if (timer) {
      clearTimeout(timer);
      snoozeTimersRef.current.delete(key);
    }
  }, []);

  const stopAlarm = useCallback(() => {
    alarmControllerRef.current.stop();
  }, []);

  const triggerAlarm = useCallback((reminder) => {
    const key = reminder?.reminderKey
      || createAlarmKey({ medicineId: reminder?.medicineId, date: reminder?.date, time: reminder?.time });

    if (!reminder?.medicineId || !reminder?.time || handledKeysRef.current.has(key)) {
      return;
    }

    remindersRef.current.set(key, {
      ...reminder,
      alarmKey: key,
    });

    setActiveReminder((prev) => {
      if (prev?.alarmKey === key) {
        return prev;
      }
      return remindersRef.current.get(key);
    });
  }, []);

  const acknowledgeAlarm = useCallback((alarmKey) => {
    if (!alarmKey) {
      return;
    }
    handledKeysRef.current.add(alarmKey);
    clearSnoozeTimer(alarmKey);
    stopAlarm();
    setActiveReminder((prev) => (prev?.alarmKey === alarmKey ? null : prev));
  }, [clearSnoozeTimer, stopAlarm]);

  const snoozeAlarm = useCallback((alarmKey) => {
    if (!alarmKey) {
      return;
    }

    stopAlarm();
    setActiveReminder((prev) => (prev?.alarmKey === alarmKey ? null : prev));
    clearSnoozeTimer(alarmKey);

    const timer = setTimeout(() => {
      if (handledKeysRef.current.has(alarmKey)) {
        return;
      }

      const savedReminder = remindersRef.current.get(alarmKey);
      if (!savedReminder) {
        return;
      }

      setActiveReminder((prev) => {
        if (prev?.alarmKey === alarmKey) {
          return prev;
        }

        return savedReminder;
      });
    }, Math.max(1, repeatMinutes) * 60 * 1000);

    snoozeTimersRef.current.set(alarmKey, timer);
  }, [clearSnoozeTimer, repeatMinutes, stopAlarm]);

  useEffect(() => {
    if (!activeReminder?.alarmKey) {
      return;
    }

    void alarmControllerRef.current.start();

    return () => {
      stopAlarm();
    };
  }, [activeReminder, stopAlarm]);

  useEffect(() => {
    return () => {
      stopAlarm();
      snoozeTimersRef.current.forEach((timer) => clearTimeout(timer));
      snoozeTimersRef.current.clear();
    };
  }, [stopAlarm]);

  return useMemo(
    () => ({
      activeReminder,
      triggerAlarm,
      acknowledgeAlarm,
      snoozeAlarm,
    }),
    [activeReminder, triggerAlarm, acknowledgeAlarm, snoozeAlarm]
  );
}