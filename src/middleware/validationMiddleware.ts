import { body } from "express-validator";

export const validateRegister = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
];

export const validateLogin = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password required")
];

export const validateTwoFactor = [
  body("userId").notEmpty().withMessage("User ID required"),
  body("twoFactorCode").isLength({ min: 6, max: 6 }).withMessage("2FA code must be 6 digits")
];

export const validateTransaction = [
  body("amount").isNumeric().withMessage("Amount must be a number"),
  body("type").notEmpty().withMessage("Type is required")
];
