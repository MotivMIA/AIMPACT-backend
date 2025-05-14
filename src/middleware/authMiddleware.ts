import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/response.js";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) return sendError(res, 401, { message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, requiresTwoFactor?: boolean };
    if (decoded.requiresTwoFactor) return sendError(res, 401, { message: "2FA required" });
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    sendError(res, 401, { message: "Invalid token" });
  }
};
