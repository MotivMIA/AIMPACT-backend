import { Router } from "express";
import { createTransaction, getTransactions, exportTransactions } from "../controllers/transactionController";
import { authenticate } from "../middleware/authMiddleware";
import { validateTransaction } from "../middleware/validationMiddleware";

const router = Router();

router.post("/", authenticate, validateTransaction, createTransaction);
router.get("/", authenticate, getTransactions);
router.get("/export", authenticate, exportTransactions);

export default router;
