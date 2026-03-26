import cron from 'node-cron';
import Medicine from '../models/Medicine.js';
import ReminderLog from '../models/ReminderLog.js';
import sendMedicineReminderEmail from './sendMedicineReminderEmail.js';
import sendDoseStatusEmail from './sendDoseStatusEmail.js';
import { emitMedicineReminder } from '../socket/socketServer.js';

let jobsStarted = false;
const emittedReminderKeys = new Set();
const REMINDER_TIMEZONE = process.env.REMINDER_TIMEZONE || 'Asia/Kolkata';

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

      const medicines = await Medicine.find({ user: { $exists: true, $ne: null } })
        .populate('user', 'name email')
        .lean();
      const activeMedicines = medicines.filter((medicine) => isActiveToday(medicine, dateKey, todayWeekday));
      const activeMedicineIds = activeMedicines.map((medicine) => medicine._id);
      const todayLogs = await ReminderLog.find({
        medicine: { $in: activeMedicineIds },
        date: dateKey,
      })
        .select('medicine time status')
        .lean();

      const logLookup = new Set(todayLogs.map((log) => `${String(log.medicine)}_${log.time}`));

      const dueMedicines = medicines.filter(
        (medicine) =>
          isActiveToday(medicine, dateKey, todayWeekday) && Array.isArray(medicine.timeSlots) && medicine.timeSlots.includes(timeKey)
      );

      for (const medicine of dueMedicines) {
        const medicineId = String(medicine._id);
        const eventKey = `${medicineId}_${dateKey}_${timeKey}`;

        if (emittedReminderKeys.has(eventKey)) {
          continue;
        }

        emittedReminderKeys.add(eventKey);
        const userEmail = medicine?.user?.email;
        const userName = medicine?.user?.name || 'User';

        if (userEmail) {
          const emailResult = await sendMedicineReminderEmail({
            to: userEmail,
            name: userName,
            medicineName: medicine.name,
            dosage: medicine.dosage,
            date: dateKey,
            time: timeKey,
            medicineId,
            userId: String(medicine?.user?._id || medicine.user),
          });

          if (!emailResult.sent) {
            console.warn(
              `[Reminder Email Failed] ${dateKey} ${timeKey} | medicine=${medicine.name} | reason=${emailResult.reason}`
            );
          }
        }

        const event = {
          medicineId,
          medicineName: medicine.name,
          dosage: medicine.dosage,
          date: dateKey,
          time: timeKey,
          userId: String(medicine?.user?._id || medicine.user),
        };

        emitMedicineReminder(event);
        console.log(
          `[Reminder Event] ${dateKey} ${timeKey} | medicine=${medicine.name} | dosage=${medicine.dosage}`
        );
      }

      for (const medicine of activeMedicines) {
        const userEmail = medicine?.user?.email;
        const userName = medicine?.user?.name || 'User';
        const slots = Array.isArray(medicine.timeSlots) ? medicine.timeSlots : [];

        for (const slot of slots) {
          if (slot >= timeKey) {
            continue;
          }

          const medicineId = String(medicine._id);
          const slotLogKey = `${medicineId}_${slot}`;
          if (logLookup.has(slotLogKey)) {
            continue;
          }

          await ReminderLog.findOneAndUpdate(
            {
              medicine: medicine._id,
              date: dateKey,
              time: slot,
            },
            {
              status: 'missed',
            },
            {
              upsert: true,
              setDefaultsOnInsert: true,
            }
          );

          logLookup.add(slotLogKey);

          if (userEmail) {
            const emailResult = await sendDoseStatusEmail({
              to: userEmail,
              name: userName,
              medicineName: medicine.name,
              dosage: medicine.dosage,
              date: dateKey,
              time: slot,
              status: 'missed',
            });

            if (!emailResult.sent) {
              console.warn(
                `[Auto Missed Email Failed] ${dateKey} ${slot} | medicine=${medicine.name} | reason=${emailResult.reason}`
              );
            }
          }

          console.log(`[Auto Missed] ${dateKey} ${slot} | medicine=${medicine.name}`);
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
