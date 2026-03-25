import crypto from 'crypto';
import CredentialConfig from '../models/CredentialConfig.js';

const SMTP_KEY = 'smtp';

function getCipherKey() {
  const secret = process.env.CONFIG_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing CONFIG_ENCRYPTION_KEY or JWT_SECRET for credential encryption');
  }
  return crypto.createHash('sha256').update(secret).digest();
}

function encryptObject(value) {
  const iv = crypto.randomBytes(12);
  const key = getCipherKey();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(value), 'utf8');
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decryptObject(payload) {
  const [ivHex, authTagHex, encryptedHex] = String(payload || '').split(':');
  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error('Invalid encrypted credential payload');
  }

  const key = getCipherKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8'));
}

export async function saveSmtpCredentials(credentials) {
  const payload = encryptObject(credentials);
  await CredentialConfig.findOneAndUpdate(
    { key: SMTP_KEY },
    { key: SMTP_KEY, payload },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function getSmtpCredentials() {
  const doc = await CredentialConfig.findOne({ key: SMTP_KEY }).lean();
  if (!doc) {
    return null;
  }

  try {
    return decryptObject(doc.payload);
  } catch {
    return null;
  }
}

export async function hydrateSmtpCredentialsFromEnv() {
  const existing = await CredentialConfig.findOne({ key: SMTP_KEY }).lean();
  if (existing) {
    return;
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT || 587);
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || '';

  if (!host || !user || !pass) {
    return;
  }

  await saveSmtpCredentials({ host, port, user, pass, from });
}
