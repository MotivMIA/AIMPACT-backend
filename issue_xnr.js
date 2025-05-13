import xrpl from "xrpl";

     async function issueXNR() {
       try {
         const client = new xrpl.Client("wss://testnet.xrpl-labs.com");
         await client.connect();
         console.log("Connected to XRPL Testnet");

         const issuingWallet = xrpl.Wallet.fromSeed("sEdVw9nTnJUFbqy8WsvqmZnwHYnByDW"); // Issuing account
         const operationalWallet = xrpl.Wallet.fromSeed("sEdStfck4mGAgPvKBTSPSXjg3ApAkMF"); // Operational account

         // Configure issuing account to disallow direct XRP payments
         const accountSetTx = {
           TransactionType: "AccountSet",
           Account: issuingWallet.address,
           SetFlag: 8 // DisallowXRP flag
         };
         const preparedAccountSet = await client.autofill(accountSetTx);
         const signedAccountSet = issuingWallet.sign(preparedAccountSet);
         const accountSetResult = await client.submitAndWait(signedAccountSet.tx_blob);
         console.log("AccountSet Result:", JSON.stringify(accountSetResult, null, 2));

         // Wait to ensure ledger update
         await new Promise(resolve => setTimeout(resolve, 4000));

         // Set trust line from operational to issuing account
         const trustSetTx = {
           TransactionType: "TrustSet",
           Account: operationalWallet.address,
           LimitAmount: {
             currency: "XNR",
             issuer: issuingWallet.address,
             value: "1000000000" // 1 billion XNR
           }
         };
         const preparedTrustSet = await client.autofill(trustSetTx);
         const signedTrustSet = operationalWallet.sign(preparedTrustSet);
         const trustSetResult = await client.submitAndWait(signedTrustSet.tx_blob);
         console.log("TrustSet Result:", JSON.stringify(trustSetResult, null, 2));

         // Wait to ensure ledger update
         await new Promise(resolve => setTimeout(resolve, 4000));

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

     issueXNR();