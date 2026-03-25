import { getSmtpCredentials, saveSmtpCredentials } from '../utils/credentialStore.js';

export async function upsertSmtpConfig(req, res, next) {
  try {
    const { host, port, user, pass, from } = req.body;
    await saveSmtpCredentials({
      host,
      port: Number(port || 587),
      user,
      pass,
      from: from || user,
    });

    return res.status(200).json({ message: 'SMTP credentials saved to MongoDB' });
  } catch (error) {
    return next(error);
  }
}

export async function getSmtpConfigStatus(req, res, next) {
  try {
    const config = await getSmtpCredentials();
    if (!config) {
      return res.status(200).json({ configured: false });
    }

    return res.status(200).json({
      configured: true,
      host: config.host,
      port: config.port,
      user: config.user,
      from: config.from || '',
    });
  } catch (error) {
    return next(error);
  }
}
