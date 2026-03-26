import nodemailer from 'nodemailer';
import dns from 'dns/promises';
import { getSmtpCredentials, hydrateSmtpCredentialsFromEnv } from './credentialStore.js';

const SMTP_SEND_ATTEMPTS = Math.max(1, Number(process.env.SMTP_SEND_ATTEMPTS || 3));
const SMTP_RETRY_DELAY_MS = Math.max(200, Number(process.env.SMTP_RETRY_DELAY_MS || 1000));

function sanitizeEmailAddress(value) {
  return String(value || '').trim().toLowerCase();
}

function extractEmailAddress(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/<([^>]+)>/);
  if (match?.[1]) {
    return sanitizeEmailAddress(match[1]);
  }
  return sanitizeEmailAddress(raw);
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
  let from = String(config.from || user || '').trim();
  let fromEmail = extractEmailAddress(from);
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
  if (host.includes('gmail.com') && fromEmail !== user) {
    from = user;
    fromEmail = user;
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
  const pass = process.env.SMTP_PASS || process.env.SENDGRID_API_KEY;

  if (process.env.SENDGRID_API_KEY && !host && !user) {
    return {
      host: 'smtp.sendgrid.net',
      port: Number(process.env.SMTP_PORT || 587),
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY,
      from: process.env.SENDGRID_FROM || process.env.SMTP_FROM || process.env.SMTP_USER || '',
    };
  }

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

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isRetryableError(error) {
  const code = String(error?.code || '').toUpperCase();
  const responseCode = Number(error?.responseCode || 0);
  const retryableCodes = new Set([
    'ETIMEDOUT',
    'ECONNECTION',
    'ECONNRESET',
    'EHOSTUNREACH',
    'ENOTFOUND',
    'ESOCKET',
  ]);

  if (retryableCodes.has(code)) {
    return true;
  }

  // 4xx SMTP responses are usually temporary and worth retrying.
  return responseCode >= 400 && responseCode < 500;
}

async function resolveSmtpHost(hostname) {
  const forceIpv4 = String(process.env.SMTP_FORCE_IPV4 || 'true').toLowerCase() !== 'false';
  if (!forceIpv4) {
    return { host: hostname, family: undefined };
  }

  try {
    const result = await dns.lookup(hostname, { family: 4 });
    if (result?.address) {
      return { host: result.address, family: 4 };
    }
  } catch (error) {
    console.warn(`[SMTP DNS Warning] Unable to resolve IPv4 for ${hostname}: ${error?.message || 'unknown error'}`);
  }

  return { host: hostname, family: undefined };
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

  const resolved = await resolveSmtpHost(config.host);

  const transporter = nodemailer.createTransport({
    host: resolved.host,
    family: resolved.family,
    port: Number(config.port || 587),
    secure: Number(config.port || 587) === 465,
    requireTLS: Number(config.port || 587) !== 465,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      servername: config.host,
      minVersion: 'TLSv1.2',
    },
  });

  let verifyWarning = null;
  try {
    await transporter.verify();
  } catch (error) {
    verifyWarning = `SMTP verify warning: ${error?.message || 'unknown error'}`;
    console.warn(`[SMTP Verify Warning] ${verifyWarning}`);
  }

  return {
    transporter,
    from: config.from || config.user,
    reason: verifyWarning,
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

  let lastError = null;

  for (let attempt = 1; attempt <= SMTP_SEND_ATTEMPTS; attempt += 1) {
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
      lastError = error;
      if (!isRetryableError(error) || attempt === SMTP_SEND_ATTEMPTS) {
        break;
      }

      await delay(SMTP_RETRY_DELAY_MS * attempt);
    }
  }

  return {
    sent: false,
    reason: `${reason ? `${reason} | ` : ''}${lastError?.message || 'Unable to send email'}`,
  };
}
