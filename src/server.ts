import dotenv from "dotenv";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { createServer } from "http";
import app from "./app.js";
import connectDB from "./db.js";
import { setupWebSocket } from "./websocket.js";
import xrpl from "xrpl";

dotenv.config();

const secretsManager = new SecretsManagerClient({ region: process.env.AWS_REGION || "us-east-1" });

async function getSecrets() {
  if (process.env.NODE_ENV === "development") {
    console.log("Running in development mode, using local .env variables");
    return;
  }
  try {
    const command = new GetSecretValueCommand({ SecretId: process.env.SECRETS_ID || "xnr-backend-secrets" });
    const data = await secretsManager.send(command);
    if (data.SecretString) {
      const secrets = JSON.parse(data.SecretString);
      Object.assign(process.env, secrets);
    }
  } catch (err) {
    console.error("Using local env vars; secrets fetch failed:", err);
  }
}

const xrplClient = new xrpl.Client("wss://testnet.xrpl-labs.com"); // Testnet
async function initXRPL() {
  await xrplClient.connect();
  console.log("Connected to XRPL Testnet");
}

const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

(async () => {
  await initXRPL();
  await getSecrets();
  if (!MONGO_URI) throw new Error("MongoDB URI not provided");
  await connectDB();
  const server = createServer(app);
  const wss = setupWebSocket(server);
  app.set('wss', wss);
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please stop the process using this port or use a different port.`);
      console.error(`To find the process, run: lsof -i :${PORT}`);
      process.exit(1);
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})().catch(err => {
  console.error("Startup failed:", err);
  process.exit(1);
});