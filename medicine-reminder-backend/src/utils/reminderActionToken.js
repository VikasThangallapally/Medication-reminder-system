import jwt from 'jsonwebtoken';

const ACTION_TOKEN_EXPIRY = '7d';

function getSecret() {
  return process.env.JWT_SECRET || 'change-me';
}

export function createReminderActionToken(payload) {
  return jwt.sign(payload, getSecret(), {
    expiresIn: ACTION_TOKEN_EXPIRY,
  });
}

export function verifyReminderActionToken(token) {
  return jwt.verify(token, getSecret());
}
