import xrpl from "xrpl";

async function issueXNRPayment() {
  try {
    const client = new xrpl.Client("wss://testnet.xrpl-labs.com");
    await client.connect();
    console.log("Connected to XRPL Testnet");

    const issuingWallet = xrpl.Wallet.fromSeed("sEdVw9nTnJUFbqy8WsvqmZnwHYnByDW");
    const operationalWallet = xrpl.Wallet.fromSeed("sEdStfck4mGAgPvKBTSPSXjg3ApAkMF");

    // Issue 1 billion XNR tokens
    const paymentTx = {
      TransactionType: "Payment",
      Account: issuingWallet.address,
      Destination: operationalWallet.address,
      Amount: {
        currency: "XNR",
        issuer: issuingWallet.address,
        value: "1000000000"
      }
    };
    const preparedPayment = await client.autofill(paymentTx);
    const signedPayment = issuingWallet.sign(preparedPayment);
    const paymentResult = await client.submitAndWait(signedPayment.tx_blob);
    console.log("XNR Issued:", JSON.stringify(paymentResult, null, 2));

    await client.disconnect();
    console.log("Disconnected from XRPL Testnet");
  } catch (err) {
    console.error("Error issuing XNR:", err);
  }
}

issueXNRPayment();
