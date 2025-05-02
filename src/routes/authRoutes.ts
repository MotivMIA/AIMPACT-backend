import { Router } from "express";
import { register, login, setupTwoFactor, verifyTwoFactor } from "../controllers/authController";
import { validateRegister, validateLogin, validateTwoFactor } from "../middleware/validationMiddleware";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/two-factor/setup", authenticate, setupTwoFactor);
router.post("/two-factor/verify", validateTwoFactor, verifyTwoFactor);

export default router;
