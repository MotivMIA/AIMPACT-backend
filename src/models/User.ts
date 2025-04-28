import mongoose, { Schema } from "mongoose";

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  twoFactorSecret?: string;
  isTwoFactorEnabled: boolean;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  twoFactorSecret: { type: String },
  isTwoFactorEnabled: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IUser>("User", userSchema);
