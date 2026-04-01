import express from 'express';
import { getVapidPublicKey, subscribePush, unsubscribePush } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/public-key', getVapidPublicKey);
router.use(protect);
router.post('/subscribe', subscribePush);
router.post('/unsubscribe', unsubscribePush);

export default router;
