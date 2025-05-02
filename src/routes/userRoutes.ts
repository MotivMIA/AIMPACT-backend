<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> origin/main
import { Router } from "express";
import { getProfile } from "../controllers/userController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/profile", authenticate, getProfile);
<<<<<<< HEAD
=======
=======
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/profile", authMiddleware, (req: express.Request, res: express.Response) => {
  res.json({ message: "User profile", userId: req.user!.userId });
});
>>>>>>> origin/main
>>>>>>> origin/main

export default router;
