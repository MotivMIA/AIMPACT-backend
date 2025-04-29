import { Request, Response } from "express";
// Removed unused and incorrect import of UserDocument
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import User from "../models/User";
import { validationResult } from "express-validator";

export const register = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  console.log("Request body:", req.body);
  console.log("Validation errors:", errors.array());

  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }

  const { email, password } = req.body;

  if (!email || !password) {
    console.log("Missing email or password");
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const existingUser = await User.findOne({ email });
  console.log("Existing user:", existingUser);

  if (existingUser) {
    sendError(res, 400, { message: "User already exists" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Hashed password:", hashedPassword);

  const user = new User({ email, password: hashedPassword });
  await user.save();
  console.log("User saved:", user);

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
    console.log("Validation errors:", errors.array());    res.status(400).json({ message: errors.array()[0].msg });
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
  const { userId } = req.user!; // Use the `user` property
  const user = await User.findById(userId);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const secret = speakeasy.generateSecret({
    name: `AimCrypto:${user.email}`,
  });

  user.twoFactorSecret = secret.base32;
  user.isTwoFactorEnabled = true;
  await user.save();

  res.json({ qrCode: secret.otpauth_url });
};

export const verifyTwoFactor = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array());    res.status(400).json({ message: errors.array()[0].msg });
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

  res.json({ message: "2FA verified" });
};

export const someControllerFunction = (req: Request, res: Response): void => {
  const { userId } = req.user!;
  // Use userId as needed
};

export const someAuthFunction = (req: Request, res: Response): void => {
  const { userId } = req.user!;
  // Use userId as needed
};

const sendError = (res: Response, statusCode: number, error: object): void => {
  res.status(statusCode).json(error);
};

import request from "supertest";
import app from "../app"; // Adjust the path to your Express app file

it("should register a new user", async () => {
  const res = await request(app).post("/api/auth/register").send({
    email: "test@example.com",
    password: "password123", // Ensure password meets the minimum length requirement
  });
  console.log("Response body:", res.body); // Debugging
  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty("message", "Registration successful");
});

it("should return 400 if email or password is missing", async () => {
  const res = await request(app).post("/api/auth/register").send({});
  console.log("Response body:", res.body); // Debugging
  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty("message", "Invalid email"); // Adjust based on validation logic
});
