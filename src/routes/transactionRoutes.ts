<<<<<<< HEAD
import { Router } from "express";
import { createTransaction, getTransactions, exportTransactions } from "../controllers/transactionController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticate, createTransaction);
router.get("/", authenticate, getTransactions);
router.get("/export", authenticate, exportTransactions);
=======
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
>>>>>>> origin/main

export default router;
