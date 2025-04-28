import mongoose, { Schema } from "mongoose";

export interface ITransaction extends mongoose.Document {
  userId: string;
  txHash: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  status: "pending" | "confirmed" | "failed";
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  userId: { type: String, required: true },
  txHash: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, enum: ["pending", "confirmed", "failed"], default: "pending" },
}, { timestamps: true });

export default mongoose.model<ITransaction>("Transaction", transactionSchema);
