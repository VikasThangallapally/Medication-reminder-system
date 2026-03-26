import nodemailer from 'nodemailer';
import { getSmtpCredentials, hydrateSmtpCredentialsFromEnv } from './credentialStore.js';

function normalizeSmtpConfig(config) {
  if (!config) {
    return null;
  }

  const host = String(config.host || '').trim();
  const user = String(config.user || '').trim();
  const port = Number(config.port || 587);
  const from = String(config.from || user || '').trim();
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

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text,
    });

    return { sent: true };
  } catch (error) {
    return { sent: false, reason: error.message || 'Unable to send email' };
  }
}
