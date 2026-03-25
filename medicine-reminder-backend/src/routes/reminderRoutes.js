import express from 'express';
import {
	getReminderLogs,
	getTodayReminders,
	markReminder,
	markReminderFromEmail,
} from '../controllers/reminderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/email-action', markReminderFromEmail);

router.use(protect);

router.get('/today', getTodayReminders);
router.get('/logs', getReminderLogs);
router.post('/mark', markReminder);

export default router;
