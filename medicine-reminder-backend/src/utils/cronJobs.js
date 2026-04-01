import cron from 'node-cron';
import Medicine from '../models/Medicine.js';
import ReminderLog from '../models/ReminderLog.js';
import sendMedicineReminderEmail from './sendMedicineReminderEmail.js';
import sendEscalationAlertEmail from './sendEscalationAlertEmail.js';
import sendPushNotification from './sendPushNotification.js';
import { emitMedicineReminder } from '../socket/socketServer.js';

let jobsStarted = false;
const emittedReminderKeys = new Set();
const REMINDER_TIMEZONE = process.env.REMINDER_TIMEZONE || 'Asia/Kolkata';
const REMINDER_GRACE_MINUTES = Math.max(1, Number(process.env.REMINDER_GRACE_MINUTES || 5));
const SECOND_REMINDER_DELAY_MINUTES = Math.max(1, Number(process.env.SECOND_REMINDER_DELAY_MINUTES || 15));
const DEFAULT_ESCALATION_DELAY_MINUTES = Math.max(
  SECOND_REMINDER_DELAY_MINUTES + 1,
  Number(process.env.ESCALATION_DELAY_MINUTES || 30)
);

function getZonedParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: REMINDER_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date).reduce((acc, item) => {
    if (item.type !== 'literal') {
      acc[item.type] = item.value;
    }
    return acc;
  }, {});

  return {
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    timeKey: `${parts.hour}:${parts.minute}`,
    weekday: String(parts.weekday || '').toLowerCase(),
  };
}

function toDateKey(date) {
  return getZonedParts(date).dateKey;
}

function weekdayKey(date) {
  return getZonedParts(date).weekday;
}

function toTimeKey(date) {
  return getZonedParts(date).timeKey;
}

function timeKeyToMinutes(timeKey) {
  const [hourPart, minutePart] = String(timeKey || '').split(':');
  const hour = Number(hourPart);
  const minute = Number(minutePart);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return null;
  }

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return hour * 60 + minute;
}

function getReminderWindowMinutes(nowTimeKey) {
  const currentMinute = timeKeyToMinutes(nowTimeKey);
  if (currentMinute === null) {
    return { windowStartMinute: 0, windowEndMinute: 0 };
  }

  return {
    windowStartMinute: Math.max(0, currentMinute - REMINDER_GRACE_MINUTES),
    windowEndMinute: currentMinute,
  };
}

function isInReminderWindow(slot, windowStartMinute, windowEndMinute) {
  const slotMinute = timeKeyToMinutes(slot);
  if (slotMinute === null) {
    return false;
  }

  return slotMinute >= windowStartMinute && slotMinute <= windowEndMinute;
}

function combineDateAndTime(dateKey, timeKey) {
  return new Date(`${dateKey}T${timeKey}:00`);
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function getEscalationDelayMinutes(medicine) {
  const fromMedicine = Number(medicine?.caregiverEscalationMinutes);
  if (Number.isFinite(fromMedicine) && fromMedicine >= 5) {
    return fromMedicine;
  }

  return DEFAULT_ESCALATION_DELAY_MINUTES;
}

function isActiveToday(medicine, todayDateKey, todayWeekday) {
  const start = toDateKey(new Date(medicine.startDate));
  const end = toDateKey(new Date(medicine.endDate));
  const hasDayRules = Array.isArray(medicine.daysOfWeek) && medicine.daysOfWeek.length > 0;
  const dayAllowed = !hasDayRules || medicine.daysOfWeek.includes(todayWeekday);
  return start <= todayDateKey && todayDateKey <= end && dayAllowed;
}

export function startCronJobs() {
  if (jobsStarted) {
    return;
  }

  jobsStarted = true;

  // Check due reminders every minute.
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const dateKey = toDateKey(now);
      const timeKey = toTimeKey(now);
      const todayWeekday = weekdayKey(now);
      const { windowStartMinute, windowEndMinute } = getReminderWindowMinutes(timeKey);

      const medicines = await Medicine.find({ user: { $exists: true, $ne: null } })
        .populate('user', 'name email caregiver pushSubscriptions')
        .lean();
      const activeMedicines = medicines.filter((medicine) => isActiveToday(medicine, dateKey, todayWeekday));
      const activeMedicineIds = activeMedicines.map((medicine) => medicine._id);
      const todayLogs = await ReminderLog.find({
        medicine: { $in: activeMedicineIds },
        date: dateKey,
      })
        .select('medicine time status reminderSentAt secondReminderSentAt escalationSentAt')
        .lean();

      const logLookup = new Set(todayLogs.map((log) => `${String(log.medicine)}_${log.time}`));
      const logMap = new Map(todayLogs.map((log) => [`${String(log.medicine)}_${log.time}`, log]));

      const dueMedicines = activeMedicines.filter((medicine) => {
        const slots = Array.isArray(medicine.timeSlots) ? medicine.timeSlots : [];
        return slots.some((slot) => {
          const slotLogKey = `${String(medicine._id)}_${slot}`;
          return isInReminderWindow(slot, windowStartMinute, windowEndMinute) && !logLookup.has(slotLogKey);
        });
      });

      for (const medicine of dueMedicines) {
        const medicineId = String(medicine._id);
        const userEmail = medicine?.user?.email;
        const userName = medicine?.user?.name || 'User';
        const dueSlots = (Array.isArray(medicine.timeSlots) ? medicine.timeSlots : []).filter((slot) => {
          const slotLogKey = `${medicineId}_${slot}`;
          return isInReminderWindow(slot, windowStartMinute, windowEndMinute) && !logLookup.has(slotLogKey);
        });

        for (const slot of dueSlots) {
          const eventKey = `${medicineId}_${dateKey}_${slot}`;
          const slotLogKey = `${medicineId}_${slot}`;

          if (emittedReminderKeys.has(eventKey)) {
            continue;
          }

          emittedReminderKeys.add(eventKey);

          const reminderTime = new Date();
          await ReminderLog.findOneAndUpdate(
            {
              medicine: medicine._id,
              date: dateKey,
              time: slot,
            },
            {
              status: 'pending',
              reminderSentAt: reminderTime,
              statusUpdatedAt: reminderTime,
            },
            {
              upsert: true,
              setDefaultsOnInsert: true,
            }
          );
          logMap.set(slotLogKey, {
            medicine: medicine._id,
            date: dateKey,
            time: slot,
            status: 'pending',
            reminderSentAt: reminderTime,
          });

          if (userEmail) {
            const emailResult = await sendMedicineReminderEmail({
              to: userEmail,
              name: userName,
              medicineName: medicine.name,
              dosage: medicine.dosage,
              date: dateKey,
              time: slot,
              medicineId,
              userId: String(medicine?.user?._id || medicine.user),
              reminderType: 'initial',
            });

            if (!emailResult.sent) {
              console.warn(
                `[Reminder Email Failed] ${dateKey} ${slot} | medicine=${medicine.name} | reason=${emailResult.reason}`
              );
            }
          }

          const event = {
            medicineId,
            medicineName: medicine.name,
            dosage: medicine.dosage,
            date: dateKey,
            time: slot,
            userId: String(medicine?.user?._id || medicine.user),
          };

          emitMedicineReminder(event);

          await sendPushNotification(medicine?.user?.pushSubscriptions, {
            title: 'Medicine Reminder',
            body: `${medicine.name} (${medicine.dosage}) at ${slot}`,
            tag: `reminder_${medicineId}_${dateKey}_${slot}`,
            data: {
              url: '/dashboard',
              medicineId,
              medicineName: medicine.name,
              dosage: medicine.dosage,
              date: dateKey,
              time: slot,
              type: 'initial',
            },
          });

          console.log(
            `[Reminder Event] ${dateKey} ${slot} | medicine=${medicine.name} | dosage=${medicine.dosage}`
          );
        }
      }

      for (const medicine of activeMedicines) {
        const userEmail = medicine?.user?.email;
        const userName = medicine?.user?.name || 'User';
        const caregiver = medicine?.user?.caregiver || null;
        const slots = Array.isArray(medicine.timeSlots) ? medicine.timeSlots : [];
        const medicineId = String(medicine._id);

        for (const slot of slots) {
          const slotLogKey = `${medicineId}_${slot}`;
          const log = logMap.get(slotLogKey);
          if (!log || log.status === 'taken') {
            continue;
          }

          const now = new Date();
          const scheduledAt = combineDateAndTime(dateKey, slot);
          const secondReminderDueAt = addMinutes(scheduledAt, SECOND_REMINDER_DELAY_MINUTES);
          const escalationDueAt = addMinutes(scheduledAt, getEscalationDelayMinutes(medicine));

          if (!log.secondReminderSentAt && now >= secondReminderDueAt) {
            const updatedLog = await ReminderLog.findOneAndUpdate(
              { medicine: medicine._id, date: dateKey, time: slot },
              { secondReminderSentAt: now, statusUpdatedAt: now },
              { new: true }
            ).lean();
            logMap.set(slotLogKey, updatedLog || { ...log, secondReminderSentAt: now });

            if (userEmail) {
              const secondReminderEmail = await sendMedicineReminderEmail({
                to: userEmail,
                name: userName,
                medicineName: medicine.name,
                dosage: medicine.dosage,
                date: dateKey,
                time: slot,
                medicineId,
                userId: String(medicine?.user?._id || medicine.user),
                reminderType: 'second',
              });

              if (!secondReminderEmail.sent) {
                console.warn(
                  `[Second Reminder Email Failed] ${dateKey} ${slot} | medicine=${medicine.name} | reason=${secondReminderEmail.reason}`
                );
              }
            }

            console.log(`[Second Reminder] ${dateKey} ${slot} | medicine=${medicine.name}`);

            await sendPushNotification(medicine?.user?.pushSubscriptions, {
              title: 'Second Medicine Reminder',
              body: `Please take ${medicine.name} (${medicine.dosage}) now`,
              tag: `second_reminder_${medicineId}_${dateKey}_${slot}`,
              data: {
                url: '/dashboard',
                medicineId,
                medicineName: medicine.name,
                dosage: medicine.dosage,
                date: dateKey,
                time: slot,
                type: 'second',
              },
            });
          }

          const refreshedLog = logMap.get(slotLogKey) || log;
          if (!refreshedLog.escalationSentAt && now >= escalationDueAt) {
            const escalatedLog = await ReminderLog.findOneAndUpdate(
              { medicine: medicine._id, date: dateKey, time: slot },
              {
                escalationSentAt: now,
                status: 'missed',
                statusUpdatedAt: now,
              },
              { new: true }
            ).lean();
            logMap.set(slotLogKey, escalatedLog || { ...refreshedLog, escalationSentAt: now, status: 'missed' });

            if (userEmail) {
              const patientAlert = await sendEscalationAlertEmail({
                to: userEmail,
                caregiverName: caregiver?.name || 'Caregiver',
                patientName: userName,
                medicineName: medicine.name,
                dosage: medicine.dosage,
                date: dateKey,
                time: slot,
              });

              if (!patientAlert.sent) {
                console.warn(
                  `[Escalation Email Failed] ${dateKey} ${slot} | medicine=${medicine.name} | reason=${patientAlert.reason}`
                );
              }
            }

            if (caregiver?.email) {
              const caregiverAlert = await sendEscalationAlertEmail({
                to: caregiver.email,
                caregiverName: caregiver.name || 'Caregiver',
                patientName: userName,
                medicineName: medicine.name,
                dosage: medicine.dosage,
                date: dateKey,
                time: slot,
              });

              if (!caregiverAlert.sent) {
                console.warn(
                  `[Caregiver Escalation Email Failed] ${dateKey} ${slot} | medicine=${medicine.name} | reason=${caregiverAlert.reason}`
                );
              }
            } else {
              console.warn(
                `[Caregiver Escalation Skipped] ${dateKey} ${slot} | medicine=${medicine.name} | reason=Caregiver email not configured`
              );
            }

            emitMedicineReminder({
              medicineId,
              medicineName: medicine.name,
              dosage: medicine.dosage,
              date: dateKey,
              time: slot,
              userId: String(medicine?.user?._id || medicine.user),
              type: 'escalation',
              caregiver: caregiver || null,
            });

            await sendPushNotification(medicine?.user?.pushSubscriptions, {
              title: 'Missed Medicine Alert',
              body: `${medicine.name} was missed at ${slot}. Please check now.`,
              tag: `escalation_${medicineId}_${dateKey}_${slot}`,
              data: {
                url: '/dashboard',
                medicineId,
                medicineName: medicine.name,
                dosage: medicine.dosage,
                date: dateKey,
                time: slot,
                type: 'escalation',
              },
            });

            console.log(`[Escalation] ${dateKey} ${slot} | medicine=${medicine.name}`);
          }
        }
      }

      // Prevent unbounded growth in long-running processes.
      if (emittedReminderKeys.size > 10000) {
        emittedReminderKeys.clear();
      }
    } catch (error) {
      console.error('Cron reminder check failed:', error.message);
    }
  }, { timezone: REMINDER_TIMEZONE });

  // Cleanup very old reminder logs once daily.
  cron.schedule('0 2 * * *', async () => {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 180);
      await ReminderLog.deleteMany({ createdAt: { $lt: cutoff } });
    } catch (error) {
      console.error('Cron cleanup failed:', error.message);
    }
  }, { timezone: REMINDER_TIMEZONE });
}
