import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  isTwoFactorEnabled: boolean;
  twoFactorSecret?: string;
  wallet: { balance: { type: Number, default: 0 }, address: { type: String } },
  createdAt: Date;
}

const userSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isTwoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  wallet: { balance: { type: Number, default: 0 }, address: { type: String } },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>("User", userSchema);
