import express from 'express';
import {
  askMedicineAssistant,
  getMedicineInfoByName,
  searchMedicineInfo,
} from '../controllers/medicineInfoController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', searchMedicineInfo);
router.post('/assistant', askMedicineAssistant);
router.get('/:name', getMedicineInfoByName);

export default router;
