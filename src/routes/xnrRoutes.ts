import { Router } from "express";
import xrpl from "xrpl";

const router = Router();

router.get("/balance", async (req: Request, res: Response) => {
  try {
    const { address } = req.query;
    console.log("Fetching balance for address:", address);
    const client = new xrpl.Client("wss://testnet.xrpl-labs.com");
    await client.connect();
    const balances = await client.getBalances(address);
    const xnrBalance = balances.find(b => b.currency === "XNR" && b.issuer === "r9x1fYx6gZetG7wTtFCtWvWtA2B995eQVq");
    await client.disconnect();
    res.json({ balance: xnrBalance ? xnrBalance.value : "0" });
  } catch (err) {
    console.error("Balance error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
/api/v1/profile: Link wallet address to optional profile (email).
javascript

Copy
router.post("/profile", async (req: Request, res: Response) => {
  const { walletAddress, email } = req.body;
  console.log("Creating profile for wallet:", walletAddress);
  // Verify wallet signature (xrpl.sign)
  // Save to MongoDB (optional)
  res.status(201).json({ message: "Profile created" });
});

router.post("/profile", async (req: Request, res: Response) => {
  const { walletAddress, email } = req.body;
  console.log("Creating profile for wallet:", walletAddress);
  // Verify wallet signature (xrpl.sign)
  // Save to MongoDB (optional)
  res.status(201).json({ message: "Profile created" });
});



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
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: errorMessage });
  }
});

export default router;