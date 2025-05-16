// src/routes/walletsRoutes.ts
import { Router, Request, Response } from "express";
import User from "../models/User.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/balance", authenticate, async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user.userId); // Extend Request type if needed
    res.json({ balance: user?.wallet?.balance || 0 });
  } catch (err) {
    console.error("Balance error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;