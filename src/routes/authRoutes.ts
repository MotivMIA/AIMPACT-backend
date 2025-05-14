import { Router } from "express";
import { register, login, setupTwoFactor, verifyTwoFactor } from "../controllers/authController.js";
import { validateRegister, validateLogin, validateTwoFactor } from "../middleware/validationMiddleware.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/two-factor/setup", authenticate, setupTwoFactor);
router.post("/two-factor/verify", validateTwoFactor, verifyTwoFactor);

export default router;
// This code defines the authentication routes for the application. It includes routes for user registration, login, and two-factor authentication setup and verification. The routes are protected by middleware that validates the input data and checks if the user is authenticated.