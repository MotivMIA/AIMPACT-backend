import { Router, Request, Response, NextFunction } from "express";
import { register, login, setupTwoFactor, verifyTwoFactor } from "../controllers/authController.js";
import { validateRegister, validateLogin, validateTwoFactor } from "../middleware/validationMiddleware.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", validateRegister, (req: Request, res: Response, next: NextFunction) => {
  console.log("Register route hit:", req.body);
  register(req, res); // Remove next, as register doesn't use it
});
router.post("/login", validateLogin, login);
router.post("/two-factor/setup", authenticate, setupTwoFactor);
router.post("/two-factor/verify", validateTwoFactor, verifyTwoFactor);

export default router;