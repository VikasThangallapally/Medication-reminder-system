import sendSmtpMail from './sendSmtpMail.js';
import { createReminderActionToken } from './reminderActionToken.js';

function normalizeBaseUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  // Allow API_BASE_URL values with or without /api suffix.
  return raw.replace(/\/+$/, '').replace(/\/api$/i, '');
}

function isFrontendDomain(url) {
  return /\.netlify\.app/i.test(String(url || ''));
}

function getApiBaseUrl() {
  const explicit = normalizeBaseUrl(process.env.API_BASE_URL);
  const renderUrl = normalizeBaseUrl(process.env.RENDER_EXTERNAL_URL);

  if (explicit) {
    // If API_BASE_URL was accidentally set to frontend URL, prefer Render backend URL.
    if (isFrontendDomain(explicit) && renderUrl) {
      return renderUrl;
    }
    return explicit;
  }

  if (renderUrl) {
    return renderUrl;
  }

  const isProduction = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
  if (isProduction) {
    return '';
  }

  return 'http://localhost:5000';
}

export default async function sendMedicineReminderEmail({
  to,
  name,
  medicineName,
  dosage,
  date,
  time,
  medicineId,
  userId,
  reminderType = 'initial',
}) {
  const safeName = name || 'User';
  const isSecondReminder = reminderType === 'second';
  const apiBaseUrl = getApiBaseUrl();
  const canIncludeActions = Boolean(medicineId && userId && apiBaseUrl);

  let takenActionUrl = '';
  let missedActionUrl = '';

  if (canIncludeActions) {
    const takenToken = createReminderActionToken({
      medicineId,
      userId,
      date,
      time,
      status: 'taken',
    });

    const missedToken = createReminderActionToken({
      medicineId,
      userId,
      date,
      time,
      status: 'missed',
    });

    takenActionUrl = `${apiBaseUrl}/api/reminders/email-action?token=${encodeURIComponent(takenToken)}`;
    missedActionUrl = `${apiBaseUrl}/api/reminders/email-action?token=${encodeURIComponent(missedToken)}`;
  }

  const actionHtml = canIncludeActions
    ? `
      <p style="margin-top:14px"><strong>Update your dose status:</strong></p>
      <div style="margin: 10px 0 6px; display:flex; gap:10px; flex-wrap:wrap;">
        <a href="${takenActionUrl}" style="display:inline-block;padding:10px 14px;border-radius:8px;background:#059669;color:#ffffff;text-decoration:none;font-weight:600;">Mark Taken</a>
        <a href="${missedActionUrl}" style="display:inline-block;padding:10px 14px;border-radius:8px;background:#d97706;color:#ffffff;text-decoration:none;font-weight:600;">Mark Missed</a>
      </div>
      <p style="font-size:12px;color:#475569">Click one option to record this dose.</p>
    `
    : '';

  const actionText = canIncludeActions
    ? [
        '',
        'Update your dose status:',
        `Mark Taken: ${takenActionUrl}`,
        `Mark Missed: ${missedActionUrl}`,
      ].join('\n')
    : '';

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
      <h2 style="margin:0 0 12px">${isSecondReminder ? 'Second Medicine Reminder' : 'Medicine Reminder'}</h2>
      <p>Hello ${safeName},</p>
      <p>${isSecondReminder ? 'This is a second reminder for your medicine dose.' : 'It is time to take your medicine.'}</p>
      <ul style="padding-left:18px">
        <li><strong>Medicine:</strong> ${medicineName}</li>
        <li><strong>Dosage:</strong> ${dosage}</li>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${time}</li>
      </ul>
      <p>${isSecondReminder ? 'Please mark the dose as taken as soon as possible.' : 'Please take your medicine as scheduled.'}</p>
      ${actionHtml}
    </div>
  `;

  const text = [
    `Hello ${safeName},`,
    isSecondReminder ? 'This is a second reminder for your medicine dose.' : 'It is time to take your medicine.',
    `Medicine: ${medicineName}`,
    `Dosage: ${dosage}`,
    `Date: ${date}`,
    `Time: ${time}`,
    actionText,
  ].join('\n');

  return sendSmtpMail({
    to,
    subject: `${isSecondReminder ? 'Second Reminder' : 'Medicine Reminder'}: ${medicineName} at ${time}`,
    html,
    text,
  });
}
