import { Response } from "express";

export const sendError = (res: Response, status: number, error: any) => {
  res.status(status).json(error);
};
