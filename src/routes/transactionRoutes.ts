import { Router } from "express";
import { createTransaction, getTransactions, updateTransactionStatus, exportTransactions } from "../controllers/transactionController";
import { authenticate } from "../middleware/authMiddleware";
import { validateTransaction, validateTransactionStatus } from "../middleware/validationMiddleware";

const router = Router();

router.post("/", authenticate, validateTransaction, createTransaction);
router.get("/", authenticate, getTransactions);
router.patch("/status", authenticate, validateTransactionStatus, updateTransactionStatus);
router.get("/export", authenticate, exportTransactions);

export default router;
