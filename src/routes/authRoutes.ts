<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> origin/main
import { Router } from "express";
import { register, login, setupTwoFactor, verifyTwoFactor } from "../controllers/authController";
import { validateRegister, validateLogin, validateTwoFactor } from "../middleware/validationMiddleware";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/two-factor/setup", authenticate, setupTwoFactor);
router.post("/two-factor/verify", validateTwoFactor, verifyTwoFactor);
<<<<<<< HEAD
=======
=======
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
>>>>>>> origin/main
>>>>>>> origin/main

export default router;
