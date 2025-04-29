import { Request, Response, NextFunction, Router } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/response";
import { body } from "express-validator";

const router = Router();

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    req.user = { userId: decoded.userId }; // Assign `user` to the `Request` object
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};

export const registerValidation = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
];

router.get(
  "/profile",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    // Route logic
  }
);
