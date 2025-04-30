import express from "express";
import {
  register,
  login,
  setupTwoFactor,
  verifyTwoFactor,
} from "../controllers/authController";
import {
  registerValidation,
  loginValidation,
  twoFactorValidation,
} from "../middleware/validationMiddleware";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/setup-2fa", authMiddleware, setupTwoFactor);
router.post("/verify-2fa", twoFactorValidation, verifyTwoFactor);

export default router;
