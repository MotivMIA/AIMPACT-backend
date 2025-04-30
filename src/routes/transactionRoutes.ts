import express from "express";
import {
  recordTransaction,
  getTransactions,
} from "../controllers/transactionController";
import { transactionValidation } from "../middleware/validationMiddleware";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/transactions", authMiddleware, transactionValidation, recordTransaction);
router.get("/transactions", authMiddleware, getTransactions);

export default router;
