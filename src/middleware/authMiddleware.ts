import { Request, Response, NextFunction, Router } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/response";

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

router.get(
  "/profile",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    // Route logic
  }
);
