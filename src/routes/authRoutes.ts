import { Router } from "express";
import { login, register, setupTwoFactor, verifyTwoFactor } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { body } from "express-validator";

const router = Router();

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

router.post("/setup-2fa", authMiddleware, setupTwoFactor);

router.post(
  "/verify-2fa",
  [
    body("userId").notEmpty().withMessage("User ID is required"),
    body("twoFactorCode").notEmpty().withMessage("2FA code is required"),
  ],
  verifyTwoFactor
);

export default router;
