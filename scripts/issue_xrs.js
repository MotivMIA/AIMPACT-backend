import xrpl from "xrpl";

async function issueXRS() {
  try {
    const client = new xrpl.Client("wss://testnet.xrpl-labs.com");
    await client.connect();
    const wallet = xrpl.Wallet.fromSeed("sEdStfck4mGAgPvKBTSPSXjg3ApAkMF");
    const tx = {
      TransactionType: "Payment",
      Account: wallet.address,
      Destination: wallet.address,
      Amount: {
        currency: "XRS",
        value: "1000000000",
        issuer: wallet.address
      }
    };
    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    console.log("Issuance Result:", JSON.stringify(result, null, 2));
    await client.disconnect();
  } catch (err) {
    console.error("Issuance error:", err);
  }
}

issueXRS();