import { Response } from "express";

interface ErrorResponse {
  message: string;
  code?: string;
}

export const sendError = (res: Response, status: number, error: ErrorResponse): void => {
  res.status(status).json({ error });
};
