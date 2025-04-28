import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import User from "../models/User";
import { sendError } from "../utils/response";

const router = Router();

router.get("/profile", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.userId).select("-password -twoFactorSecret");
    if (!user) {
      sendError(res, 404, { message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    sendError(res, 500, { message: "Failed to fetch profile" });
    return;
  }
});

export default router;
