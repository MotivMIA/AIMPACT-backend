import xrpl from "xrpl";

async function setTrustLine() {
  try {
    const client = new xrpl.Client("wss://testnet.xrpl-labs.com");
    await client.connect();
    const wallet = xrpl.Wallet.fromSeed("sEd7oRTvfBhTnriQExRjUzN2e5ag1er");
    const tx = {
      TransactionType: "TrustSet",
      Account: wallet.address,
      LimitAmount: {
        currency: "XNR",
        issuer: "r9x1fYx6gZetG7wTtFCtWvWtA2B995eQVq",
        value: "1000000000"
      }
    };
    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    console.log("TrustSet Result:", JSON.stringify(result, null, 2));
    await client.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
}

setTrustLine();