import { body, param } from 'express-validator';

export const medicineIdValidator = [
  param('id').isMongoId().withMessage('Valid medicine id is required'),
];

export const createMedicineValidator = [
  body('name').trim().notEmpty().withMessage('Medicine name is required'),
  body('dosage').trim().notEmpty().withMessage('Dosage is required'),
  body('diseaseName').optional().trim(),
  body('frequency')
    .isIn(['once daily', 'twice daily', 'thrice daily'])
    .withMessage('Invalid frequency'),
  body('timeSlots').isArray({ min: 1 }).withMessage('At least one time slot is required'),
  body('timeSlots.*').matches(/^\d{2}:\d{2}$/).withMessage('Each time slot must be HH:mm'),
  body('daysOfWeek')
    .optional()
    .isArray({ min: 1 })
    .withMessage('daysOfWeek must be an array with at least one day'),
  body('daysOfWeek.*')
    .optional()
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day in daysOfWeek'),
  body('startDate').isISO8601().withMessage('Valid startDate is required'),
  body('endDate').isISO8601().withMessage('Valid endDate is required'),
  body('caregiverEscalationMinutes')
    .optional()
    .isInt({ min: 5, max: 240 })
    .withMessage('caregiverEscalationMinutes must be between 5 and 240'),
];

export const updateMedicineValidator = [...createMedicineValidator];

export const markStatusValidator = [
  ...medicineIdValidator,
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be YYYY-MM-DD'),
  body('time').matches(/^\d{2}:\d{2}$/).withMessage('Time must be HH:mm'),
  body('status').isIn(['taken', 'missed']).withMessage('Status must be taken or missed'),
];
