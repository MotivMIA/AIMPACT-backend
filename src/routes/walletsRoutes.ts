// src/routes/walletRoutes.ts
router.get("/balance", authenticate, async (req: Request, res: Response) => {
  const user = await User.findById(req.user.userId);
  res.json({ balance: user.wallet.balance });
});
