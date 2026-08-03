// backend/src/validators/authValidator.js
import { body, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    throw new ApiError(400, 'Validation failed', messages);
  }
  next();
};

const signupRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2–100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
];

const loginRules = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export default {
  signupRules,
  loginRules,
  handleValidationErrors,
};