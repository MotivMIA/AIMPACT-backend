import { Request, Response } from "express";
import Transaction from "../models/Transaction";
import { sendError } from "../utils/response";
import { validationResult } from "express-validator";

export const recordTransaction = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, 400, { message: errors.array()[0].msg });
    return;
  }

  const { userId } = req.user!;
  const { txHash, from, to, amount, currency } = req.body;

  try {
    const transaction = new Transaction({
      userId,
      txHash,
      from,
      to,
      amount,
      currency,
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    sendError(res, 400, { message: "Failed to record transaction" });
    return;
  }
};

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.user;
  try {
    const transactions = await Transaction.find({ userId });
    res.json(transactions);
  } catch (error) {
    sendError(res, 500, { message: "Failed to fetch transactions" });
    return;
  }
};

export const someTransactionFunction = (req: Request, res: Response): void => {
  const { userId } = req.user!;
  // Use userId as needed
};
