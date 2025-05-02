import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  isTwoFactorEnabled: boolean;
  twoFactorSecret?: string;
}

const userSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isTwoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String }
});

export default mongoose.model<IUser>("User", userSchema);
