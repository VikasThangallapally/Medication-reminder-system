import { validationResult } from 'express-validator';

export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const errorList = errors.array();
  const firstMessage = errorList[0]?.msg || 'Validation failed';

  return res.status(400).json({
    message: firstMessage,
    errors: errorList,
  });
}
