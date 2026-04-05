import notifee, {
  AndroidNotificationSetting,
  AndroidCategory,
  AndroidImportance,
  AuthorizationStatus,
  Event,
  EventType,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import {
  appendDoseLog,
  getAlarmMap,
  getMedicines,
  saveAlarmMap,
} from '../storage/medicineStorage';
import {MedicineSchedule, Weekday} from '../types/medicine';

export const CHANNEL_ID = 'medicine-alarm-channel';
const ACTION_TAKEN = 'taken';
const ACTION_SNOOZE = 'snooze';
const SNOOZE_MINUTES = 5;

const weekdayIndex: Record<Weekday, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
}

function parseTime(value: string): {h: number; m: number} {
  const [h, m] = value.split(':').map(Number);
  return {h: Number.isFinite(h) ? h : 8, m: Number.isFinite(m) ? m : 0};
}

function toOccurrenceKey(medicineId: string, ts: number): string {
  return `${medicineId}:${ts}`;
}

function buildActionData(medicine: MedicineSchedule, plannedAt: number) {
  return {
    medicineId: medicine.id,
    medicineName: medicine.name,
    dosage: medicine.dosage,
    plannedAt: String(plannedAt),
    occurrenceKey: toOccurrenceKey(medicine.id, plannedAt),
  };
}

async function createAlarmChannel() {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Medicine Alarm',
    importance: AndroidImportance.HIGH,
    sound: 'alarm_buzzer',
    vibration: true,
    bypassDnd: true,
  });
}

export async function ensureAlarmPermissions(): Promise<void> {
  const settings = await notifee.requestPermission();
  if (settings.authorizationStatus < AuthorizationStatus.AUTHORIZED) {
    return;
  }

  await createAlarmChannel();

  const alarmSettings = await notifee.getNotificationSettings();
  if (alarmSettings.android?.alarm === AndroidNotificationSetting.DISABLED) {
    await notifee.openAlarmPermissionSettings();
  }
}

async function scheduleTrigger(
  id: string,
  title: string,
  body: string,
  timestamp: number,
  data: Record<string, string>,
): Promise<void> {
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp,
    alarmManager: {
      allowWhileIdle: true,
    },
  };

  await notifee.createTriggerNotification(
    {
      id,
      title,
      body,
      data,
      android: {
        channelId: CHANNEL_ID,
        category: AndroidCategory.ALARM,
        importance: AndroidImportance.HIGH,
        pressAction: {id: 'open-app', launchActivity: 'default'},
        fullScreenAction: {id: 'open-app', launchActivity: 'default'},
        sound: 'alarm_buzzer',
        loopSound: true,
        ongoing: true,
        autoCancel: false,
        timestamp,
        showTimestamp: true,
        actions: [
          {
            title: 'Taken',
            pressAction: {id: ACTION_TAKEN, launchActivity: 'default'},
          },
          {
            title: 'Snooze',
            pressAction: {id: ACTION_SNOOZE, launchActivity: 'default'},
          },
        ],
      },
    },
    trigger,
  );
}

function buildScheduleTimestamps(medicine: MedicineSchedule): number[] {
  const start = parseDateOnly(medicine.startDate);
  const end = parseDateOnly(medicine.endDate);
  const now = new Date();
  const allowedDays = new Set(
    (medicine.daysOfWeek || []).map(d => weekdayIndex[d]),
  );
  const times = medicine.times.length ? medicine.times : ['08:00'];

  const result: number[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    if (!allowedDays.size || allowedDays.has(cursor.getDay())) {
      for (const time of times) {
        const {h, m} = parseTime(time);
        const fireAt = new Date(
          cursor.getFullYear(),
          cursor.getMonth(),
          cursor.getDate(),
          h,
          m,
          0,
          0,
        ).getTime();
        if (fireAt > now.getTime()) {
          result.push(fireAt);
        }
      }
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

export async function cancelMedicineAlarms(medicineId: string): Promise<void> {
  const map = await getAlarmMap();
  const keys = Object.keys(map).filter(k => k.startsWith(`${medicineId}:`));

  for (const key of keys) {
    for (const notificationId of map[key]) {
      await notifee.cancelTriggerNotification(notificationId).catch(() => {});
      await notifee.cancelNotification(notificationId).catch(() => {});
    }
    delete map[key];
  }

  await saveAlarmMap(map);
}

export async function scheduleMedicineAlarms(
  medicine: MedicineSchedule,
): Promise<void> {
  await ensureAlarmPermissions();
  await cancelMedicineAlarms(medicine.id);

  const map = await getAlarmMap();
  const timestamps = buildScheduleTimestamps(medicine);

  for (const ts of timestamps) {
    const key = toOccurrenceKey(medicine.id, ts);
    const ids: string[] = [];
    const baseId = `${key}:alarm`;

    await scheduleTrigger(
      baseId,
      `Medicine Reminder: ${medicine.name}`,
      `Dose ${medicine.dosage}. Tap Taken or Snooze.`,
      ts,
      buildActionData(medicine, ts),
    );
    ids.push(baseId);

    // Escalation reminders to keep alerting until user responds.
    for (let i = 1; i <= 3; i += 1) {
      const repeatId = `${key}:repeat:${i}`;
      await scheduleTrigger(
        repeatId,
        `Reminder still pending: ${medicine.name}`,
        `Dose ${medicine.dosage} is still pending.`,
        ts + i * 2 * 60 * 1000,
        buildActionData(medicine, ts),
      );
      ids.push(repeatId);
    }

    map[key] = ids;
  }

  await saveAlarmMap(map);
}

async function clearOccurrenceNotifications(occurrenceKey: string) {
  const map = await getAlarmMap();
  const ids = map[occurrenceKey] || [];

  for (const id of ids) {
    await notifee.cancelTriggerNotification(id).catch(() => {});
    await notifee.cancelNotification(id).catch(() => {});
  }

  delete map[occurrenceKey];
  await saveAlarmMap(map);
}

async function handleTakenAction(data: Record<string, string>) {
  const medicineId = data.medicineId;
  const medicineName = data.medicineName || 'Medicine';
  const occurrenceKey = data.occurrenceKey;
  const plannedAt = Number(data.plannedAt || Date.now());

  if (occurrenceKey) {
    await clearOccurrenceNotifications(occurrenceKey);
  }

  if (medicineId) {
    await appendDoseLog({
      medicineId,
      medicineName,
      plannedAt,
      status: 'taken',
      actionAt: Date.now(),
    });
  }

  await notifee.displayNotification({
    title: `${medicineName} marked as Taken`,
    body: 'Great job. Dose status saved.',
    android: {
      channelId: CHANNEL_ID,
      pressAction: {id: 'open-app'},
    },
  });
}

async function handleSnoozeAction(data: Record<string, string>) {
  const medicineName = data.medicineName || 'Medicine';
  const dosage = data.dosage || '';
  const medicineId = data.medicineId || '';
  const plannedAt = Number(data.plannedAt || Date.now());
  const occurrenceKey = data.occurrenceKey;

  if (occurrenceKey) {
    await clearOccurrenceNotifications(occurrenceKey);
  }

  const snoozePlannedAt = Date.now() + SNOOZE_MINUTES * 60 * 1000;
  const snoozeKey = toOccurrenceKey(medicineId, snoozePlannedAt);
  const snoozeId = `${snoozeKey}:snooze`;

  await scheduleTrigger(
    snoozeId,
    `Snoozed Reminder: ${medicineName}`,
    `${dosage ? `${dosage} ` : ''}time to take your medicine.`,
    snoozePlannedAt,
    {
      medicineId,
      medicineName,
      dosage,
      plannedAt: String(plannedAt),
      occurrenceKey: snoozeKey,
    },
  );

  const map = await getAlarmMap();
  map[snoozeKey] = [snoozeId];
  await saveAlarmMap(map);

  await appendDoseLog({
    medicineId,
    medicineName,
    plannedAt,
    status: 'snoozed',
    actionAt: Date.now(),
  });
}

export async function handleNotifeeActionEvent(event: Event): Promise<void> {
  if (event.type !== EventType.ACTION_PRESS) {
    return;
  }

  const actionId = event.detail.pressAction?.id;
  const data = (event.detail.notification?.data || {}) as Record<
    string,
    string
  >;

  if (actionId === ACTION_TAKEN) {
    await handleTakenAction(data);
    return;
  }

  if (actionId === ACTION_SNOOZE) {
    await handleSnoozeAction(data);
  }
}

export async function rescheduleAllMedicineAlarms(): Promise<void> {
  const medicines = await getMedicines();
  for (const medicine of medicines) {
    await scheduleMedicineAlarms(medicine);
  }
}
