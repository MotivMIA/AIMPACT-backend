import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/profile", authMiddleware, (req: express.Request, res: express.Response) => {
  res.json({ message: "User profile", userId: req.user!.userId });
});

export default router;
