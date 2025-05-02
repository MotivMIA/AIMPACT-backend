import { body } from "express-validator";

<<<<<<< HEAD
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
=======
export const registerValidation = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

export const loginValidation = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const transactionValidation = [
  body("txHash").notEmpty().withMessage("Transaction hash is required"),
  body("from").notEmpty().withMessage("From address is required"),
  body("to").notEmpty().withMessage("To address is required"),
  body("amount").isFloat({ min: 0 }).withMessage("Amount must be a positive number"),
  body("currency").notEmpty().withMessage("Currency is required"),
];

export const twoFactorValidation = [
  body("userId").notEmpty().withMessage("User ID is required"),
  body("twoFactorCode")
    .isLength({ min: 6, max: 6 })
    .withMessage("2FA code must be 6 digits"),
>>>>>>> origin/main
];
