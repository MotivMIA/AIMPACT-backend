import xrpl from "xrpl";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

// Initialize Secrets Manager client
const secretsManager = new SecretsManagerClient({ region: process.env.AWS_REGION || "us-east-1" });

async function getSecrets() {
  try {
    const command = new GetSecretValueCommand({ SecretId: process.env.SECRETS_ID || "xrs-backend-secrets" });
    const data = await secretsManager.send(command);
    console.log("AWS Secrets Response:", JSON.stringify(data, null, 2));
    if (data.SecretString) {
      const secrets = JSON.parse(data.SecretString);
      process.env.ISSUING_SEED = secrets.ISSUING_SEED;
      process.env.OPERATIONAL_SEED = secrets.OPERATIONAL_SEED;
      process.env.NODE_ENV = process.env.NODE_ENV || "development";
      console.log("Fetched ISSUING_SEED:", process.env.ISSUING_SEED ? "Set" : "Missing");
      console.log("Fetched OPERATIONAL_SEED:", process.env.OPERATIONAL_SEED ? "Set" : "Missing");
    } else {
      throw new Error("No SecretString found in AWS Secrets Manager");
    }
  } catch (err) {
    console.error("Secrets fetch failed:", err);
    throw new Error("Failed to load secrets from AWS Secrets Manager");
  }
}

async function checkAccountExists(client, address, role) {
  try {
    const response = await client.request({
      command: "account_info",
      account: address,
      ledger_index: "current"
    });
    console.log(`${role} Account Balance: ${response.result.account_data.Balance} drops`);
    return true;
  } catch (err) {
    if (err.data?.error === "actNotFound") {
      console.error(`${role} Account not found: ${address}. Please fund with at least 10 XRP at https://testnet.xrpl.org/faucets.`);
      return false;
    }
    throw err;
  }
}

async function issueXRS() {
  try {
    await getSecrets();
    if (!process.env.ISSUING_SEED || !process.env.OPERATIONAL_SEED) {
      throw new Error("Missing ISSUING_SEED or OPERATIONAL_SEED from AWS Secrets Manager");
    }

    const network = process.env.NODE_ENV === "production" ? "wss://xrplcluster.com" : "wss://testnet.xrpl-labs.com";
    const client = new xrpl.Client(network);
    await client.connect();
    console.log(`Connected to XRPL ${network.includes("testnet") ? "Testnet" : "Mainnet"}`);

    const issuingWallet = xrpl.Wallet.fromSeed(process.env.ISSUING_SEED);
    const operationalWallet = xrpl.Wallet.fromSeed(process.env.OPERATIONAL_SEED);
    console.log("Issuing Address:", issuingWallet.address);
    console.log("Operational Address:", operationalWallet.address);

    // Validate wallet funding
    const issuingFunded = await checkAccountExists(client, issuingWallet.address, "Issuing");
    const operationalFunded = await checkAccountExists(client, operationalWallet.address, "Operational");
    if (!issuingFunded || !operationalFunded) {
      throw new Error("One or both wallets are unfunded. Please fund and retry.");
    }

    // Configure issuing account to disallow direct XRP payments
    const accountSetTx = {
      TransactionType: "AccountSet",
      Account: issuingWallet.address,
      SetFlag: 8 // DisallowXRP flag
    };
    const preparedAccountSet = await client.autofill(accountSetTx);
    const signedAccountSet = issuingWallet.sign(preparedAccountSet);
    console.log("Please approve AccountSet transaction in Xaman...");
    const accountSetResult = await client.submitAndWait(signedAccountSet.tx_blob);
    console.log("AccountSet Result:", JSON.stringify(accountSetResult, null, 2));

    await new Promise(resolve => setTimeout(resolve, 4000));

    // Set trustline from operational to issuing account
    const trustSetTx = {
      TransactionType: "TrustSet",
      Account: operationalWallet.address,
      LimitAmount: {
        currency: "XRS",
        issuer: issuingWallet.address,
        value: "1000000000"
      }
    };
    const preparedTrustSet = await client.autofill(trustSetTx);
    const signedTrustSet = operationalWallet.sign(preparedTrustSet);
    console.log("Please approve TrustSet transaction in Xaman...");
    const trustSetResult = await client.submitAndWait(signedTrustSet.tx_blob);
    console.log("TrustSet Result:", JSON.stringify(trustSetResult, null, 2));

    await new Promise(resolve => setTimeout(resolve, 4000));

    // Issue 1 billion XRS tokens
    const paymentTx = {
      TransactionType: "Payment",
      Account: issuingWallet.address,
      Destination: operationalWallet.address,
      Amount: {
        currency: "XRS",
        issuer: issuingWallet.address,
        value: "1000000000"
      }
    };
    const preparedPayment = await client.autofill(paymentTx);
    const signedPayment = issuingWallet.sign(preparedPayment);
    console.log("Please approve Payment transaction in Xaman...");
    const paymentResult = await client.submitAndWait(signedPayment.tx_blob);
    console.log("XRS Issued:", JSON.stringify(paymentResult, null, 2));

    await client.disconnect();
    console.log("Disconnected from XRPL");
  } catch (err) {
    console.error("Error issuing XRS:", err);
    throw err;
  }
}

issueXRS();