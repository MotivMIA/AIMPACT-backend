// src/routes/xrsRoutes.ts
import { Request, Response } from "express";
import xrpl from "xrpl";

const router = Router();

router.post("/send-xrs", async (req: Request, res: Response) => {
  const { senderSeed, destination, amount } = req.body;
  try {
    console.log("Sending XRS:", { senderSeed, destination, amount });
    const client = new xrpl.Client("wss://testnet.xrpl-labs.com");
    await client.connect();
    const wallet = xrpl.Wallet.fromSeed(senderSeed);
    const tx = {
      TransactionType: "Payment",
      Account: wallet.address,
      Destination: destination,
      Amount: {
        currency: "XRS", // Changed from XNR
        value: amount.toString(),
        issuer: "r9x1fYx6gZetG7wTtFCtWvWtA2B995eQVq"
      }
    };
    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    await client.disconnect();
    res.json({ success: true, result });
  } catch (err) {
    console.error("Send XRS error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/balance", async (req: Request, res: Response) => {
  try {
    const { address } = req.query;
    console.log("Fetching balance for address:", address);
    const client = new xrpl.Client("wss://testnet.xrpl-labs.com");
    await client.connect();
    const balances = await client.getBalances(address);
    const xrsBalance = balances.find(b => b.currency === "XRS" && b.issuer === "r9x1fYx6gZetG7wTtFCtWvWtA2B995eQVq");
    await client.disconnect();
    res.json({ balance: xrsBalance ? xrsBalance.value : "0" });
  } catch (err) {
    console.error("Balance error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;