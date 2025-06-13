import xrpl from "xrpl";
import fs from "fs/promises";
import path from "path";

async function generateAddressWithPrefix(prefix, maxAttempts = 100000) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    const wallet = xrpl.Wallet.generate();
    const classicAddress = wallet.address;
    if (classicAddress.toLowerCase().startsWith(prefix.toLowerCase())) {
      const xAddressMainnet = xrpl.classicAddressToXAddress(classicAddress, null, false);
      const xAddressTestnet = xrpl.classicAddressToXAddress(classicAddress, null, true);
      const walletData = {
        classicAddress,
        xAddressMainnet,
        xAddressTestnet,
        seed: wallet.seed,
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey,
        attempts: attempts + 1,
        generatedAt: new Date().toISOString()
      };
      console.log("Generated Wallet:", JSON.stringify(walletData, null, 2));
      return walletData;
    }
    attempts++;
    if (attempts % 1000 === 0) {
      console.log(`Attempts: ${attempts}, still searching...`);
    }
  }
  console.log(`No address found after ${maxAttempts} attempts.`);
  return null;
}

async function saveWalletData(walletData, role) {
  try {
    const filePath = path.join(process.cwd(), `wallet_${role}_${Date.now()}.json`);
    await fs.writeFile(filePath, JSON.stringify(walletData, null, 2));
    console.log(`Wallet data saved to: ${filePath}`);
    console.log("WARNING: Store the seed on Ledger Flex via Xaman and delete this file after transferring.");
  } catch (err) {
    console.error("Failed to save wallet data:", err);
  }
}

async function main() {
  const prefix = "rs"; // Feasible prefix for Resonance branding
  console.log(`Generating wallets with prefix: ${prefix}`);
  
  // Generate issuing wallet
  console.log("Generating Issuing Wallet...");
  const issuingWallet = await generateAddressWithPrefix(prefix);
  if (issuingWallet) {
    await saveWalletData(issuingWallet, "issuing");
    console.log("Please fund Issuing Wallet:");
    console.log(`Address: ${issuingWallet.classicAddress}`);
    console.log("Use Testnet faucet: https://testnet.xrpl.org/faucets");
    console.log("Store seed on Ledger Flex using Xaman or Ledger Live.");
  }

  // Generate operational wallet
  console.log("\nGenerating Operational Wallet...");
  const operationalWallet = await generateAddressWithPrefix(prefix);
  if (operationalWallet) {
    await saveWalletData(operationalWallet, "operational");
    console.log("Please fund Operational Wallet:");
    console.log(`Address: ${operationalWallet.classicAddress}`);
    console.log("Use Testnet faucet: https://testnet.xrpl.org/faucets");
    console.log("Store seed on Ledger Flex using Xaman or Ledger Live.");
  }

  if (issuingWallet && operationalWallet) {
    console.log("\nNext Steps:");
    console.log("1. Fund both wallets with ~1000 XRP on Testnet.");
    console.log("2. Store seeds on Ledger Flex using Xaman.");
    console.log("3. Update AWS Secrets Manager and .env with new seeds.");
    console.log("4. Configure Regular Key in Xaman/XRPToolkit for read-only access.");
    console.log("5. Run issue_xrs.js to issue $XRS tokens.");
  } else {
    console.log("Failed to generate one or both wallets.");
  }
}

main().catch(err => console.error("Error:", err));