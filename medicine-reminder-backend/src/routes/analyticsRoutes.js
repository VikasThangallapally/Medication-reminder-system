import express from 'express';
import { getAdherenceAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getAdherenceAnalytics);

export default router;