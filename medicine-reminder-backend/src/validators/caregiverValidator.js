import { body } from 'express-validator';

export const saveCaregiverValidator = [
  body('name').trim().notEmpty().withMessage('Caregiver name is required'),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Caregiver email must be valid').normalizeEmail(),
  body('phone').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 5 }).withMessage('Caregiver phone must be valid'),
  body().custom((value) => {
    const email = String(value?.email || '').trim();
    const phone = String(value?.phone || '').trim();
    if (!email && !phone) {
      throw new Error('Caregiver email or phone is required');
    }
    return true;
  }),
];