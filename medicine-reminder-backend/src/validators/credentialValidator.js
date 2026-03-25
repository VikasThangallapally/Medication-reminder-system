import { body } from 'express-validator';

export const smtpConfigValidator = [
  body('host').trim().notEmpty().withMessage('SMTP host is required'),
  body('port').isInt({ min: 1, max: 65535 }).withMessage('SMTP port must be valid'),
  body('user').trim().notEmpty().withMessage('SMTP user is required'),
  body('pass').trim().notEmpty().withMessage('SMTP password is required'),
  body('from').optional().isString().withMessage('SMTP from must be a string'),
];
