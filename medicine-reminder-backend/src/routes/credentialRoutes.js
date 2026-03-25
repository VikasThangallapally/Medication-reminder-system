import express from 'express';
import { getSmtpConfigStatus, upsertSmtpConfig } from '../controllers/credentialController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { smtpConfigValidator } from '../validators/credentialValidator.js';

const router = express.Router();

router.get('/smtp', protect, getSmtpConfigStatus);
router.post('/smtp', protect, smtpConfigValidator, validateRequest, upsertSmtpConfig);

export default router;
