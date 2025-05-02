import { Response } from "express";

<<<<<<< HEAD
export const sendError = (res: Response, status: number, error: any) => {
  res.status(status).json(error);
=======
<<<<<<< HEAD
export const sendError = (res: Response, status: number, error: any) => {
  res.status(status).json(error);
=======
export const sendError = (res: Response, statusCode: number, error: object): void => {
  res.status(statusCode).json(error);
>>>>>>> origin/main
>>>>>>> origin/main
};
