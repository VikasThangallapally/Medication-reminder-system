import Medicine from '../models/Medicine.js';
import ReminderLog from '../models/ReminderLog.js';

function normalizeDateOnly(dateValue) {
  return new Date(new Date(dateValue).toISOString().slice(0, 10));
}

function normalizeDays(daysOfWeek) {
  const defaultDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
    return defaultDays;
  }

  return [...new Set(daysOfWeek.map((day) => String(day).toLowerCase()))];
}

function mapLogsByMedicine(logs) {
  const grouped = new Map();
  for (const log of logs) {
    const medicineId = String(log.medicine);
    if (!grouped.has(medicineId)) {
      grouped.set(medicineId, []);
    }
    grouped.get(medicineId).push({
      date: log.date,
      time: log.time,
      status: log.status,
    });
  }
  return grouped;
}

export async function getMedicines(req, res, next) {
  try {
    const query = req.user?.id ? { user: req.user.id } : {};
    const medicines = await Medicine.find(query).sort({ createdAt: -1 }).lean();

    const medicineIds = medicines.map((item) => item._id);
    const logs = await ReminderLog.find({
      medicine: { $in: medicineIds },
    })
      .select('medicine date time status')
      .lean();

    const groupedLogs = mapLogsByMedicine(logs);

    const withLogs = medicines.map((medicine) => ({
      ...medicine,
      logs: groupedLogs.get(String(medicine._id)) || [],
    }));

    return res.status(200).json({ medicines: withLogs });
  } catch (error) {
    return next(error);
  }
}

export async function getMedicineById(req, res, next) {
  try {
    const query = req.user?.id ? { _id: req.params.id, user: req.user.id } : { _id: req.params.id };
    const medicine = await Medicine.findOne(query).lean();
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    const logs = await ReminderLog.find({
      medicine: medicine._id,
    })
      .select('date time status')
      .lean();

    return res.status(200).json({ medicine: { ...medicine, logs } });
  } catch (error) {
    return next(error);
  }
}

export async function createMedicine(req, res, next) {
  try {
    const { name, dosage, diseaseName, frequency, timeSlots, daysOfWeek, startDate, endDate } = req.body;

    const parsedStart = normalizeDateOnly(startDate);
    const parsedEnd = normalizeDateOnly(endDate);

    if (parsedStart > parsedEnd) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }

    const medicine = await Medicine.create({
      user: req.user?.id,
      name,
      dosage,
      diseaseName: diseaseName || '',
      frequency,
      timeSlots,
      daysOfWeek: normalizeDays(daysOfWeek),
      startDate: parsedStart,
      endDate: parsedEnd,
    });

    return res.status(201).json({ medicine });
  } catch (error) {
    return next(error);
  }
}

export async function updateMedicine(req, res, next) {
  try {
    const { name, dosage, diseaseName, frequency, timeSlots, daysOfWeek, startDate, endDate } = req.body;

    const query = req.user?.id ? { _id: req.params.id, user: req.user.id } : { _id: req.params.id };
    const medicine = await Medicine.findOne(query);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    const parsedStart = normalizeDateOnly(startDate);
    const parsedEnd = normalizeDateOnly(endDate);

    if (parsedStart > parsedEnd) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }

    medicine.name = name;
    medicine.dosage = dosage;
    medicine.diseaseName = diseaseName || '';
    medicine.frequency = frequency;
    medicine.timeSlots = timeSlots;
    medicine.daysOfWeek = normalizeDays(daysOfWeek);
    medicine.startDate = parsedStart;
    medicine.endDate = parsedEnd;

    const updated = await medicine.save();

    return res.status(200).json({ medicine: updated });
  } catch (error) {
    return next(error);
  }
}

export async function deleteMedicine(req, res, next) {
  try {
    const query = req.user?.id ? { _id: req.params.id, user: req.user.id } : { _id: req.params.id };
    const medicine = await Medicine.findOneAndDelete(query);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    await ReminderLog.deleteMany({ medicine: req.params.id });

    return res.status(200).json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    return next(error);
  }
}

export async function markMedicineStatus(req, res, next) {
  try {
    const query = req.user?.id ? { _id: req.params.id, user: req.user.id } : { _id: req.params.id };
    const medicine = await Medicine.findOne(query);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    const { date, time, status } = req.body;

    if (!medicine.timeSlots.includes(time)) {
      return res.status(400).json({ message: 'Time slot not found for this medicine' });
    }

    const log = await ReminderLog.findOneAndUpdate(
      {
        medicine: medicine._id,
        date,
        time,
      },
      {
        status,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({ message: 'Status updated', log });
  } catch (error) {
    return next(error);
  }
}
