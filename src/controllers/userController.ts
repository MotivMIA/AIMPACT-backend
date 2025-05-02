import { Request, Response } from "express";

export const getProfile = async (req: Request, res: Response) => {
  res.json({ message: "User profile", userId: req.user!.userId });
};
