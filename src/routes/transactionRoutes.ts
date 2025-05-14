import { Router } from "express";
import { createTransaction, getTransactions, updateTransactionStatus, exportTransactions } from "../controllers/transactionController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateTransaction, validateTransactionStatus } from "../middleware/validationMiddleware.js";

const router = Router();

router.post("/", authenticate, validateTransaction, createTransaction);
router.get("/", authenticate, getTransactions);
router.patch("/status", authenticate, validateTransactionStatus, updateTransactionStatus);
router.get("/export", authenticate, exportTransactions);

export default router;
