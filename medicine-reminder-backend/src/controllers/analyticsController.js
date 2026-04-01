import Medicine from '../models/Medicine.js';
import ReminderLog from '../models/ReminderLog.js';

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function weekdayKey(date) {
  return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function startOfWeek(date) {
  const copy = startOfDay(date);
  const offset = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - offset);
  return copy;
}

function formatWeekLabel(date) {
  const weekStart = startOfWeek(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return `${toDateKey(weekStart)} to ${toDateKey(weekEnd)}`;
}

function isMedicineActiveOnDate(medicine, dateKey, dayName) {
  const start = new Date(medicine.startDate).toISOString().slice(0, 10);
  const end = new Date(medicine.endDate).toISOString().slice(0, 10);
  const hasDayRules = Array.isArray(medicine.daysOfWeek) && medicine.daysOfWeek.length > 0;
  const dayAllowed = !hasDayRules || medicine.daysOfWeek.includes(dayName);
  return start <= dateKey && dateKey <= end && dayAllowed;
}

function getTimeSlots(medicine) {
  return (medicine.timeSlots || [])
    .map((slot) => (typeof slot === 'string' ? slot : slot?.time))
    .filter(Boolean);
}

export async function getAdherenceAnalytics(req, res, next) {
  try {
    const days = Math.max(7, Math.min(Number(req.query.days || 30), 180));
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(new Date());
    startDate.setDate(startDate.getDate() - (days - 1));

    const medicines = await Medicine.find({ user: req.user.id }).lean();
    const medicineIds = medicines.map((medicine) => medicine._id);
    const logs = medicineIds.length
      ? await ReminderLog.find({
          medicine: { $in: medicineIds },
          date: { $gte: toDateKey(startDate), $lte: toDateKey(endDate) },
        })
          .select('medicine date time status reminderSentAt secondReminderSentAt escalationSentAt statusUpdatedAt createdAt')
          .lean()
      : [];

    const logLookup = new Map();
    for (const log of logs) {
      logLookup.set(`${String(log.medicine)}_${log.date}_${log.time}`, log);
    }

    const dailyMap = new Map();
    const weeklyMap = new Map();
    const missedByTime = new Map();

    const current = startOfDay(startDate);
    const finalDate = startOfDay(endDate);

    while (current <= finalDate) {
      const dateKey = toDateKey(current);
      const weekStart = startOfWeek(current);
      const weekKey = toDateKey(weekStart);

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { date: dateKey, scheduled: 0, taken: 0, missed: 0 });
      }

      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, {
          weekStart: weekKey,
          weekLabel: formatWeekLabel(weekStart),
          scheduled: 0,
          taken: 0,
          missed: 0,
        });
      }

      const dayBucket = dailyMap.get(dateKey);
      const weekBucket = weeklyMap.get(weekKey);
      const dayName = weekdayKey(current);

      for (const medicine of medicines) {
        if (!isMedicineActiveOnDate(medicine, dateKey, dayName)) {
          continue;
        }

        for (const time of getTimeSlots(medicine)) {
          const log = logLookup.get(`${String(medicine._id)}_${dateKey}_${time}`);
          dayBucket.scheduled += 1;
          weekBucket.scheduled += 1;

          if (log?.status === 'taken') {
            dayBucket.taken += 1;
            weekBucket.taken += 1;
          } else if (log?.status === 'missed') {
            dayBucket.missed += 1;
            weekBucket.missed += 1;
            missedByTime.set(time, (missedByTime.get(time) || 0) + 1);
          }
        }
      }

      current.setDate(current.getDate() + 1);
    }

    const daily = Array.from(dailyMap.values()).map((bucket) => ({
      ...bucket,
      pending: Math.max(bucket.scheduled - bucket.taken - bucket.missed, 0),
      adherencePercentage: bucket.scheduled > 0 ? Number(((bucket.taken / bucket.scheduled) * 100).toFixed(1)) : 0,
    }));

    const weekly = Array.from(weeklyMap.values()).map((bucket) => ({
      ...bucket,
      pending: Math.max(bucket.scheduled - bucket.taken - bucket.missed, 0),
      adherencePercentage: bucket.scheduled > 0 ? Number(((bucket.taken / bucket.scheduled) * 100).toFixed(1)) : 0,
    }));

    const totalScheduled = daily.reduce((sum, bucket) => sum + bucket.scheduled, 0);
    const totalTaken = daily.reduce((sum, bucket) => sum + bucket.taken, 0);
    const totalMissed = daily.reduce((sum, bucket) => sum + bucket.missed, 0);
    const adherencePercentage = totalScheduled > 0 ? Number(((totalTaken / totalScheduled) * 100).toFixed(1)) : 0;

    const bestAdherenceDay = daily
      .filter((bucket) => bucket.scheduled > 0)
      .sort((left, right) => right.adherencePercentage - left.adherencePercentage || right.taken - left.taken)[0] || null;

    const mostMissedTimeEntry = Array.from(missedByTime.entries()).sort((left, right) => right[1] - left[1])[0] || null;
    const mostMissedTime = mostMissedTimeEntry
      ? { time: mostMissedTimeEntry[0], missed: mostMissedTimeEntry[1] }
      : { time: null, missed: 0 };

    const alerts = logs
      .filter((log) => log.escalationSentAt)
      .sort(
        (left, right) =>
          new Date(right.escalationSentAt || right.updatedAt || right.createdAt) -
          new Date(left.escalationSentAt || left.updatedAt || left.createdAt)
      )
      .slice(0, 25)
      .map((log) => {
        const medicine = medicines.find((item) => String(item._id) === String(log.medicine));
        return {
          id: `${String(log.medicine)}_${log.date}_${log.time}`,
          medicineId: String(log.medicine),
          medicineName: medicine?.name || 'Medicine',
          date: log.date,
          time: log.time,
          status: log.status,
          reminderSentAt: log.reminderSentAt || null,
          secondReminderSentAt: log.secondReminderSentAt || null,
          escalationSentAt: log.escalationSentAt || null,
          caregiver: req.user.caregiver || null,
        };
      });

    return res.status(200).json({
      summary: {
        totalScheduled,
        totalTaken,
        totalMissed,
        adherencePercentage,
      },
      trends: {
        bestAdherenceDay,
        mostMissedTime,
      },
      daily,
      weekly,
      alerts,
    });
  } catch (error) {
    return next(error);
  }
}