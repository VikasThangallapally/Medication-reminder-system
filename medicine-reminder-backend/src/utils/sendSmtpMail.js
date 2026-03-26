import nodemailer from 'nodemailer';
import { getSmtpCredentials, hydrateSmtpCredentialsFromEnv } from './credentialStore.js';

function sanitizeEmailAddress(value) {
  return String(value || '').trim().toLowerCase();
}

function parseRecipients(to) {
  const values = Array.isArray(to) ? to : String(to || '').split(',');
  const recipients = values
    .map((value) => sanitizeEmailAddress(value))
    .filter(Boolean);

  return Array.from(new Set(recipients));
}

function normalizeSmtpConfig(config) {
  if (!config) {
    return null;
  }

  const host = String(config.host || '').trim().toLowerCase();
  const user = sanitizeEmailAddress(config.user);
  const port = Number(config.port || 587);
  let from = sanitizeEmailAddress(config.from || user || '');
  let pass = String(config.pass || '');

  // Gmail app passwords are shown with spaces in UI, but SMTP expects raw characters.
  if (/gmail\.com$/i.test(host)) {
    pass = pass.replace(/\s+/g, '');
  } else {
    pass = pass.trim();
  }

  if (!host || !user || !pass) {
    return null;
  }

  // Gmail often rejects or downgrades delivery when From differs from authenticated user.
  if (host.includes('gmail.com') && from !== user) {
    from = user;
  }

  return {
    host,
    port,
    user,
    pass,
    from,
  };
}

function getEnvSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port: Number(process.env.SMTP_PORT || 587),
    user,
    pass,
    from: process.env.SMTP_FROM || user,
  };
}

async function createTransport() {
  await hydrateSmtpCredentialsFromEnv();
  const envConfig = normalizeSmtpConfig(getEnvSmtpConfig());
  const dbConfig = await getSmtpCredentials();
  const normalizedDbConfig = normalizeSmtpConfig(dbConfig);
  const config = envConfig || normalizedDbConfig;

  if (!config) {
    return { transporter: null, from: null, reason: 'SMTP is not configured (env or MongoDB credentials missing)' };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: Number(config.port || 587),
    secure: Number(config.port || 587) === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  return {
    transporter,
    from: config.from || config.user,
    reason: null,
  };
}

export default async function sendSmtpMail({ to, subject, html, text }) {
  const { transporter, from, reason } = await createTransport();
  if (!transporter) {
    return { sent: false, reason };
  }

  const recipients = parseRecipients(to);
  if (!recipients.length) {
    return { sent: false, reason: 'Missing recipient email address' };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to: recipients,
      subject,
      html,
      text,
    });

    const accepted = Array.isArray(info.accepted) ? info.accepted.length : 0;
    const rejected = Array.isArray(info.rejected) ? info.rejected : [];

    if (!accepted || rejected.length === recipients.length) {
      return {
        sent: false,
        reason: `SMTP rejected recipient(s): ${rejected.join(', ') || recipients.join(', ')}`,
      };
    }

    return { sent: true };
  } catch (error) {
    return { sent: false, reason: error.message || 'Unable to send email' };
  }
}
