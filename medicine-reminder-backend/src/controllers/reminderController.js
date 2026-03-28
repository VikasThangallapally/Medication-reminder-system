import Medicine from '../models/Medicine.js';
import ReminderLog from '../models/ReminderLog.js';
import sendDoseStatusEmail from '../utils/sendDoseStatusEmail.js';
import { verifyReminderActionToken } from '../utils/reminderActionToken.js';

function getClientHomeUrl() {
  const explicitFrontendUrl = String(process.env.FRONTEND_URL || '').trim().replace(/\/+$/, '');
  if (explicitFrontendUrl) {
    return explicitFrontendUrl;
  }

  const configured = (process.env.CLIENT_URL || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const isProduction = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
  if (isProduction && configured.length > 0) {
    // Prefer Netlify URLs in production
    const netlifyUrl = configured.find((url) => /\.netlify\.app/i.test(url));
    if (netlifyUrl) {
      return netlifyUrl;
    }

    // Fall back to any public HTTPS URL
    const publicUrl = configured.find(
      (url) => !/localhost|127\.0\.0\.1/i.test(url) && /^https?:\/\//i.test(url)
    );
    if (publicUrl) {
      return publicUrl;
    }
  }

  return configured[0] || 'http://localhost:5174';
}

function renderReminderActionPage({ title, message, tone = 'success' }) {
  const homeUrl = getClientHomeUrl();
  const accent = tone === 'success' ? '#34d399' : '#f59e0b';
  const eyebrow = tone === 'success' ? 'STATUS UPDATED' : 'ACTION REQUIRED';

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Medicine Reminder</title>
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #e2e8f0;
            background:
              radial-gradient(circle at 18% 14%, rgba(14, 116, 144, 0.2), transparent 38%),
              radial-gradient(circle at 86% 82%, rgba(16, 185, 129, 0.14), transparent 42%),
              linear-gradient(130deg, #020617 0%, #071226 54%, #030712 100%);
            padding: 20px;
          }

          .card {
            width: min(92vw, 700px);
            border-radius: 26px;
            border: 1px solid rgba(125, 211, 252, 0.24);
            background: linear-gradient(155deg, rgba(7, 18, 34, 0.92), rgba(9, 27, 45, 0.72));
            box-shadow: 0 30px 72px -42px rgba(8, 145, 178, 0.7);
            text-align: center;
            overflow: hidden;
          }

          .accent {
            height: 6px;
            background: linear-gradient(90deg, #06b6d4, ${accent});
          }

          .content {
            padding: 42px 32px 38px;
          }

          .eyebrow {
            margin: 0;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            font-size: 13px;
            font-weight: 700;
            color: #67e8f9;
          }

          h1 {
            margin: 12px 0 0;
            font-size: clamp(36px, 6vw, 52px);
            line-height: 1.2;
            color: #e2e8f0;
          }

          p {
            margin: 18px auto 0;
            max-width: 540px;
            font-size: 34px;
            color: #cbd5e1;
            font-size: clamp(20px, 3vw, 34px);
            line-height: 1.35;
          }

          a {
            margin-top: 30px;
            display: inline-block;
            text-decoration: none;
            background: linear-gradient(90deg, #06b6d4, #22c55e);
            color: #ffffff;
            font-weight: 700;
            border-radius: 14px;
            padding: 14px 24px;
            font-size: 22px;
            box-shadow: 0 12px 28px -16px rgba(34, 211, 238, 0.8);
          }

          .subtext {
            margin-top: 18px;
            font-size: 14px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <main class="card">
          <div class="accent"></div>
          <div class="content">
            <p class="eyebrow">${eyebrow}</p>
            <h1>${title}</h1>
            <p>${message}</p>
            <a href="${homeUrl}">Go to Home Page</a>
            <div class="subtext">Medical Reminder System</div>
          </div>
        </main>
      </body>
    </html>
  `;
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function weekdayKey(date) {
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return weekdays[date.getDay()];
}

export async function getTodayReminders(req, res, next) {
  try {
    const now = new Date();
    const todayKey = toDateKey(now);
    const todayName = weekdayKey(now);

    const query = req.user?.id ? { user: req.user.id } : {};
    const medicines = await Medicine.find(query).lean();
    const activeMedicines = medicines.filter((item) => {
      const start = new Date(item.startDate).toISOString().slice(0, 10);
      const end = new Date(item.endDate).toISOString().slice(0, 10);
      const hasDays = Array.isArray(item.daysOfWeek) && item.daysOfWeek.length > 0;
      const dayAllowed = !hasDays || item.daysOfWeek.includes(todayName);
      return start <= todayKey && todayKey <= end && dayAllowed;
    });

    const medicineIds = activeMedicines.map((item) => item._id);
    const logs = await ReminderLog.find({
      medicine: { $in: medicineIds },
      date: todayKey,
    })
      .select('medicine date time status')
      .lean();

    return res.status(200).json({
      date: todayKey,
      medicines: activeMedicines,
      logs,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getReminderLogs(req, res, next) {
  try {
    const logs = await ReminderLog.find({})
      .populate('medicine', 'name dosage frequency timeSlots')
      .sort({ date: -1, time: -1 })
      .lean();

    return res.status(200).json({ logs });
  } catch (error) {
    return next(error);
  }
}

export async function markReminder(req, res, next) {
  try {
    const { medicineId, date, time, status } = req.body;

    if (!medicineId || !date || !time || !status) {
      return res.status(400).json({ message: 'medicineId, date, time and status are required' });
    }

    if (!['taken', 'missed'].includes(status)) {
      return res.status(400).json({ message: 'Status must be taken or missed' });
    }

    const query = req.user?.id ? { _id: medicineId, user: req.user.id } : { _id: medicineId };
    const medicine = await Medicine.findOne(query).populate('user', 'name email');
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    const slotExists = (medicine.timeSlots || []).includes(time);
    if (!slotExists) {
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

    const userEmail = medicine?.user?.email;
    if (userEmail) {
      void (async () => {
        try {
          const emailResult = await sendDoseStatusEmail({
            to: userEmail,
            name: medicine?.user?.name || 'User',
            medicineName: medicine.name,
            dosage: medicine.dosage,
            date,
            time,
            status,
          });

          if (!emailResult.sent) {
            console.warn(
              `[Status Email Failed] medicine=${medicine.name} | date=${date} | time=${time} | status=${status} | reason=${emailResult.reason}`
            );
          }
        } catch (mailError) {
          console.warn(
            `[Status Email Failed] medicine=${medicine.name} | date=${date} | time=${time} | status=${status} | reason=${mailError.message || 'unknown'}`
          );
        }
      })();
    }

    return res.status(200).json({ message: 'Reminder marked successfully', log });
  } catch (error) {
    return next(error);
  }
}

export async function markReminderFromEmail(req, res, next) {
  try {
    const { token } = req.query;

    if (!token) {
      return res
        .status(400)
        .send(renderReminderActionPage({ title: 'Invalid Link', message: 'Token is missing.', tone: 'warning' }));
    }

    let payload;
    try {
      payload = verifyReminderActionToken(token);
    } catch {
      return res.status(400).send(
        renderReminderActionPage({
          title: 'Link Expired',
          message: 'Please use a recent reminder email.',
          tone: 'warning',
        })
      );
    }

    const { medicineId, userId, date, time, status } = payload || {};
    if (!medicineId || !userId || !date || !time || !['taken', 'missed'].includes(status)) {
      return res.status(400).send(
        renderReminderActionPage({
          title: 'Invalid Link',
          message: 'Required action details are missing.',
          tone: 'warning',
        })
      );
    }

    const medicine = await Medicine.findOne({ _id: medicineId, user: userId }).populate('user', 'name email');
    if (!medicine) {
      return res.status(404).send(
        renderReminderActionPage({
          title: 'Medicine Not Found',
          message: 'This reminder cannot be processed.',
          tone: 'warning',
        })
      );
    }

    const slotExists = (medicine.timeSlots || []).includes(time);
    if (!slotExists) {
      return res.status(400).send(
        renderReminderActionPage({
          title: 'Invalid Time Slot',
          message: 'This dose time is not available.',
          tone: 'warning',
        })
      );
    }

    await ReminderLog.findOneAndUpdate(
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

    const statusLabel = status === 'taken' ? 'Taken' : 'Missed';
    return res.status(200).send(
      renderReminderActionPage({
        title: 'Status Updated',
        message: `${medicine.name} for ${date} ${time} marked as ${statusLabel}.`,
        tone: 'success',
      })
    );
  } catch (error) {
    return next(error);
  }
}
