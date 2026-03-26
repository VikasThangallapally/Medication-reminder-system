import nodemailer from 'nodemailer';
import { getSmtpCredentials, hydrateSmtpCredentialsFromEnv } from './credentialStore.js';

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
  const dbConfig = await getSmtpCredentials();
  const hasDbConfig = Boolean(dbConfig?.host && dbConfig?.user && dbConfig?.pass);
  const config = hasDbConfig ? dbConfig : getEnvSmtpConfig();

  if (!config) {
    return { transporter: null, from: null, reason: 'SMTP is not configured in MongoDB credentials' };
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
