import express from 'express';
import { saveCaregiver } from '../controllers/caregiverController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { saveCaregiverValidator } from '../validators/caregiverValidator.js';

const router = express.Router();

router.use(protect);
router.post('/', saveCaregiverValidator, validateRequest, saveCaregiver);

export default router;