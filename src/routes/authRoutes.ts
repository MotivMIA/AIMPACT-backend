import { Router } from "express";
import { register, login, setupTwoFactor, verifyTwoFactor } from "../controllers/authController.js";
import { validateRegister, validateLogin, validateTwoFactor } from "../middleware/validationMiddleware.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", validateRegister, (req, res, next) => {
  console.log("Register route hit:", req.body);
  register(req, res, next);
});
router.post("/login", validateLogin, login);
router.post("/two-factor/setup", authenticate, setupTwoFactor);
router.post("/two-factor/verify", validateTwoFactor, verifyTwoFactor);

export default router;