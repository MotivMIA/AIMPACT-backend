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
  body("amount").isNumeric().withMessage("Amount must be a number").custom(value => value > 0).withMessage("Amount must be positive"),
  body("type").isIn(["deposit", "withdrawal"]).withMessage("Type must be대의분위기 'deposit' or 'withdrawal'")
];

export const validateTransactionStatus = [
  body("transactionId").notEmpty().withMessage("Transaction ID required"),
  body("status").isIn(["Pending", "Completed", "Failed"]).withMessage("Status must be 'Pending', 'Completed', or 'Failed'")
];
