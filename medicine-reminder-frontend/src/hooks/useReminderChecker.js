import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import {
  createReminderNotificationKey,
  playReminderAlert,
  requestNotificationPermission,
  sendReminderNotification,
} from '../utils/notification';

function getId(medicine) {
  return medicine._id || medicine.id;
}

function normalizeSocketUrl(baseUrl) {
  if (!baseUrl) {
    return 'http://localhost:5000';
  }

  return baseUrl.replace(/\/api\/?$/, '');
}

export default function useReminderChecker({ medicines, todayKey, onReminder }) {
  const [highlightMap, setHighlightMap] = useState({});
  const socketUrl = normalizeSocketUrl(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL);
  const medicinesRef = useRef(medicines);
  const onReminderRef = useRef(onReminder);

  useEffect(() => {
    medicinesRef.current = medicines;
  }, [medicines]);

  useEffect(() => {
    onReminderRef.current = onReminder;
  }, [onReminder]);

  const triggerReminder = useCallback(({ medicineId, medicineName, dosage, date, time }) => {
    const normalizedMedicineId = String(medicineId);
    const key = createReminderNotificationKey({
      medicineId: normalizedMedicineId,
      date,
      time,
    });

    if (sessionStorage.getItem(key)) {
      return;
    }

    console.info('[Reminder] Triggered', {
      medicineId: normalizedMedicineId,
      date,
      time,
      source: 'interval-or-socket',
    });

    const shown = sendReminderNotification({
      title: 'Medicine Reminder',
      body: `Time to take ${medicineName}`,
      tag: key,
    });

    if (shown) {
      playReminderAlert();
    }

    if (typeof onReminderRef.current === 'function') {
      onReminderRef.current({
        reminderKey: key,
        medicineId: normalizedMedicineId,
        medicineName,
        dosage,
        date,
        time,
      });
    }

    sessionStorage.setItem(key, 'true');
    setHighlightMap((prev) => ({
      ...prev,
      [normalizedMedicineId]: Date.now() + 120000,
    }));
  }, []);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      const activeDate = format(now, 'yyyy-MM-dd');
      setHighlightMap((prev) => {
        const nextHighlightMap = { ...prev };

        medicinesRef.current.forEach((medicine) => {
          const medicineId = String(getId(medicine));

          (medicine.timeSlots || []).forEach((slot) => {
            if (slot.status !== 'pending' || slot.time !== currentTime) {
              return;
            }

            triggerReminder({
              medicineId,
              medicineName: medicine.name,
              dosage: medicine.dosage,
              date: activeDate || todayKey,
              time: slot.time,
            });
            nextHighlightMap[medicineId] = Date.now() + 120000;
          });
        });

        const currentTs = Date.now();
        Object.keys(nextHighlightMap).forEach((id) => {
          if (nextHighlightMap[id] <= currentTs) {
            delete nextHighlightMap[id];
          }
        });

        return nextHighlightMap;
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [todayKey, triggerReminder]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = io(socketUrl, {
      transports: ['websocket'],
      auth: token ? { token: `Bearer ${token}` } : {},
    });

    socket.on('connect', () => {
      console.info('[Reminder] Socket connected');
    });

    socket.on('connect_error', (error) => {
      console.warn('[Reminder] Socket connection error:', error?.message || error);
    });

    socket.on('medicineReminder', (event) => {
      if (!event?.medicineId || !event?.time) {
        return;
      }

      triggerReminder({
        medicineId: event.medicineId,
        medicineName: event.medicineName || 'your medicine',
        dosage: event.dosage || '',
        date: event.date || todayKey,
        time: event.time,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [socketUrl, todayKey, triggerReminder]);

  const highlightedMedicineIds = useMemo(
    () => Object.keys(highlightMap).filter((id) => highlightMap[id] > Date.now()),
    [highlightMap]
  );

  return { highlightedMedicineIds };
}
