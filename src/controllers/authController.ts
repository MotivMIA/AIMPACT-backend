import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import User from "../models/User";
import { sendError } from "../utils/response";
import { validationResult } from "express-validator";

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> origin/main
export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { email, password } = req.body;
  if (!email || !password) return sendError(res, 400, { message: "Email and password required" });

  const userExists = await User.findOne({ email });
  if (userExists) return sendError(res, 400, { message: "User already exists" });
<<<<<<< HEAD
=======
=======
export const register = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }

  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    sendError(res, 400, { message: "User already exists" });
    return;
  }
>>>>>>> origin/main
>>>>>>> origin/main

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> origin/main
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
  res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 3600000 });
  res.status(201).json({ message: "Registration successful" });
};

export const login = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) return sendError(res, 401, { message: "Invalid credentials" });

  if (user.isTwoFactorEnabled) {
    const token = jwt.sign({ userId: user._id, requiresTwoFactor: true }, process.env.JWT_SECRET!, { expiresIn: "5m" });
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 300000 });
    return res.json({ requiresTwoFactor: true });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
  res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 3600000 });
  res.json({ message: "Login successful" });
};

export const setupTwoFactor = async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const user = await User.findById(userId);
  if (!user) return sendError(res, 404, { message: "User not found" });

  const secret = speakeasy.generateSecret({ name: `AimCrypto:${user.email}` });
<<<<<<< HEAD
=======
=======
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600000,
  });

  res.status(201).json({ message: "Registration successful" });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    sendError(res, 401, { message: "Invalid credentials" });
    return;
  }

  if (user.isTwoFactorEnabled) {
    const token = jwt.sign(
      { userId: user._id, requiresTwoFactor: true },
      process.env.JWT_SECRET!,
      { expiresIn: "5m" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 300000,
    });

    res.json({ requiresTwoFactor: true });
    return;
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600000,
  });

  res.json({ message: "Login successful" });
};

export const setupTwoFactor = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.user!;
  const user = await User.findById(userId);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const secret = speakeasy.generateSecret({
    name: `AimCrypto:${user.email}`
  });

>>>>>>> origin/main
>>>>>>> origin/main
  user.twoFactorSecret = secret.base32;
  user.isTwoFactorEnabled = true;
  await user.save();

  res.json({ qrCode: secret.otpauth_url });
};

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> origin/main
export const verifyTwoFactor = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { userId, twoFactorCode } = req.body;
  const user = await User.findById(userId);
  if (!user || !user.isTwoFactorEnabled) return sendError(res, 400, { message: "2FA not enabled" });

  const verified = speakeasy.totp.verify({ secret: user.twoFactorSecret!, encoding: "base32", token: twoFactorCode });
  if (!verified) return sendError(res, 401, { message: "Invalid 2FA code" });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
  res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 3600000 });
<<<<<<< HEAD
=======
=======
export const verifyTwoFactor = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }

  const { userId, twoFactorCode } = req.body;
  const user = await User.findById(userId);

  if (!user || !user.isTwoFactorEnabled) {
    sendError(res, 400, { message: "2FA not enabled" });
    return;
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret!,
    encoding: "base32",
    token: twoFactorCode,
  });

  if (!verified) {
    sendError(res, 401, { message: "Invalid 2FA code" });
    return;
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600000,
  });

>>>>>>> origin/main
>>>>>>> origin/main
  res.json({ message: "2FA verified" });
};
