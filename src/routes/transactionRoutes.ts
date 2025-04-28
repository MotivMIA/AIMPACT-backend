import { Router } from "express";
import { recordTransaction, getTransactions } from "../controllers/transactionController";
import { authMiddleware } from "../middleware/authMiddleware";
import { body } from "express-validator";

const router = Router();

router.post(
  "/transactions",
  authMiddleware,
  [
    body("txHash").notEmpty().withMessage("Transaction hash is required"),
    body("from").notEmpty().withMessage("Sender address is required"),
    body("to").notEmpty().withMessage("Recipient address is required"),
    body("amount").isFloat({ min: 0 }).withMessage("Amount must be a positive number"),
    body("currency").notEmpty().withMessage("Currency is required"),
  ],
  recordTransaction
);

router.get("/transactions", authMiddleware, getTransactions);

export default router;
