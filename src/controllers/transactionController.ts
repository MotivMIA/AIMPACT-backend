import { Request, Response } from "express";
import Transaction from "../models/Transaction";
import { sendError } from "../utils/response";
import { validationResult } from "express-validator";

<<<<<<< HEAD
export const createTransaction = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, 400, { message: errors.array()[0].msg });

  const { userId } = req.user!;
  const { amount, type, category, description } = req.body;

  const transaction = new Transaction({ userId, amount, type, category, description, status: "Pending", date: new Date() });
  await transaction.save();
  res.status(201).json({ message: "Transaction created", transaction });
};

export const getTransactions = async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const { startDate, endDate, category, status } = req.query;

  const query: any = { userId };
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate as string);
    if (endDate) query.date.$lte = new Date(endDate as string);
  }
  if (category) query.category = category;
  if (status) query.status = status;

  const transactions = await Transaction.find(query).sort({ date: -1 });
  res.json({ transactions });
};

export const exportTransactions = async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const transactions = await Transaction.find({ userId }).lean();
  const csv = transactions.map(t => `${t.date.toISOString()},${t.type},${t.amount},${t.category || ''},${t.status},${t.description || ''}`).join('\n');
  res.header('Content-Type', 'text/csv');
  res.attachment('transactions.csv');
  res.send(`Date,Type,Amount,Category,Status,Description\n${csv}`);
=======
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
  const { userId } = req.user!;
  try {
    const transactions = await Transaction.find({ userId });
    res.json(transactions);
  } catch (error) {
    sendError(res, 500, { message: "Failed to fetch transactions" });
    return;
  }
>>>>>>> origin/main
};
