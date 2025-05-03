import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  amount: number;
  type: string;
  date: Date;
  category?: string;
  status: string;
  description?: string;
}

const transactionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  date: { type: Date, default: Date.now },
  category: { type: String },
  status: { type: String, default: "Pending" },
  description: { type: String }
});

export default mongoose.model<ITransaction>("Transaction", transactionSchema);
