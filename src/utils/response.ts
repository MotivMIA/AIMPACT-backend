import { Response } from "express";

interface ErrorResponse {
  message: string;
  code?: string;
}

export const sendError = (res: Response, status: number, error: ErrorResponse) => {
  return res.status(status).json({ error });
};
