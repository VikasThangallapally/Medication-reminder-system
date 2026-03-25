import sendSmtpMail from './sendSmtpMail.js';

export default async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
      <h2 style="margin:0 0 12px">Password Reset</h2>
      <p>Hello ${name || 'User'},</p>
      <p>Click the button below to reset your password. This link is valid for 15 minutes.</p>
      <p style="margin:16px 0">
        <a href="${resetUrl}" style="background:#0ea5e9;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;font-weight:600">
          Reset Password
        </a>
      </p>
      <p>If the button does not work, paste this URL into your browser:</p>
      <p style="word-break:break-all">${resetUrl}</p>
    </div>
  `;

  return sendSmtpMail({
    to,
    subject: 'Reset your Medicine Reminder password',
    html,
  });
}
