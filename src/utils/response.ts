import { Response } from "express";

export const sendError = (res: Response, statusCode: number, error: object): void => {
  res.status(statusCode).json(error);
};
