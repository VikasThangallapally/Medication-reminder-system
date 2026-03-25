import sendSmtpMail from './sendSmtpMail.js';

export default async function sendDoseStatusEmail({ to, name, medicineName, dosage, date, time, status }) {
  const safeName = name || 'User';
  const safeStatus = status === 'taken' ? 'taken' : 'missed';
  const subjectPrefix = safeStatus === 'taken' ? 'Dose Confirmed' : 'Dose Missed';

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
      <h2 style="margin:0 0 12px">${subjectPrefix}</h2>
      <p>Hello ${safeName},</p>
      <p>Your medicine dose has been marked as <strong>${safeStatus}</strong>.</p>
      <ul style="padding-left:18px">
        <li><strong>Medicine:</strong> ${medicineName}</li>
        <li><strong>Dosage:</strong> ${dosage}</li>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${time}</li>
        <li><strong>Status:</strong> ${safeStatus}</li>
      </ul>
      ${safeStatus === 'taken' ? '<p>Great job staying on schedule.</p>' : '<p>Please try not to miss the next dose.</p>'}
    </div>
  `;

  const text = [
    `Hello ${safeName},`,
    `Your medicine dose has been marked as ${safeStatus}.`,
    `Medicine: ${medicineName}`,
    `Dosage: ${dosage}`,
    `Date: ${date}`,
    `Time: ${time}`,
    `Status: ${safeStatus}`,
  ].join('\n');

  return sendSmtpMail({
    to,
    subject: `${subjectPrefix}: ${medicineName} at ${time}`,
    html,
    text,
  });
}
