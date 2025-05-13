import { Router } from "express";
import xrpl from "xrpl";

const router = Router();

router.post("/send-xnr", async (req, res) => {
  const { senderSeed, destination, amount } = req.body as {
    senderSeed: string;
    destination: string;
    amount: string;
  };
  try {
    if (!senderSeed || !destination || !amount) {
      throw new Error("Missing required fields: senderSeed, destination, or amount");
    }
    const client = new xrpl.Client("wss://testnet.xrpl-labs.com");
    await client.connect();
    const wallet = xrpl.Wallet.fromSeed(senderSeed);
    const tx: xrpl.Payment = {
      TransactionType: "Payment",
      Account: wallet.address,
      Destination: destination,
      Amount: {
        currency: "XNR",
        issuer: "r9x1fYx6gZetG7wTtFCtWvWtA2B995eQVq",
        value: amount
      }
    };
    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    await client.disconnect();
    res.json({ success: true, result });
  } catch (err: Error) {
    res.status(500).json({ error: err.message });
  }
});

export default router;