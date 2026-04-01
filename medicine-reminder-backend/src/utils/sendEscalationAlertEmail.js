import sendSmtpMail from './sendSmtpMail.js';

export default async function sendEscalationAlertEmail({
  to,
  caregiverName,
  patientName,
  medicineName,
  dosage,
  date,
  time,
}) {
  if (!to) {
    return { sent: false, reason: 'Missing escalation recipient' };
  }

  const safeCaregiverName = caregiverName || 'Caregiver';
  const safePatientName = patientName || 'Patient';

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
      <h2 style="margin:0 0 12px">Escalation Alert</h2>
      <p>Hello ${safeCaregiverName},</p>
      <p>${safePatientName} has not confirmed the scheduled medicine dose in time.</p>
      <ul style="padding-left:18px">
        <li><strong>Medicine:</strong> ${medicineName}</li>
        <li><strong>Dosage:</strong> ${dosage}</li>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${time}</li>
      </ul>
      <p>Please follow up with the patient as needed.</p>
    </div>
  `;

  const text = [
    `Hello ${safeCaregiverName},`,
    `${safePatientName} has not confirmed the scheduled medicine dose in time.`,
    `Medicine: ${medicineName}`,
    `Dosage: ${dosage}`,
    `Date: ${date}`,
    `Time: ${time}`,
    'Please follow up with the patient as needed.',
  ].join('\n');

  return sendSmtpMail({
    to,
    subject: `Escalation Alert: ${medicineName} at ${time}`,
    html,
    text,
  });
}