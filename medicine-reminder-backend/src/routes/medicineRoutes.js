import express from 'express';
import {
  createMedicine,
  deleteMedicine,
  getMedicineById,
  getMedicines,
  markMedicineStatus,
  updateMedicine,
} from '../controllers/medicineController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import {
  createMedicineValidator,
  markStatusValidator,
  medicineIdValidator,
  updateMedicineValidator,
} from '../validators/medicineValidator.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getMedicines).post(createMedicineValidator, validateRequest, createMedicine);

router
  .route('/:id')
  .get(medicineIdValidator, validateRequest, getMedicineById)
  .put(medicineIdValidator, updateMedicineValidator, validateRequest, updateMedicine)
  .delete(medicineIdValidator, validateRequest, deleteMedicine);

router.patch('/:id/status', markStatusValidator, validateRequest, markMedicineStatus);

export default router;
