import dotenv from "dotenv";
import AWS from "aws-sdk";
import { createServer } from "http";
import app from "./app";
import connectDB from "./db";
import { setupWebSocket } from "./websocket";

dotenv.config();

const secretsManager = new AWS.SecretsManager({ region: process.env.AWS_REGION || "us-east-1" });

async function getSecrets() {
  // Skip AWS Secrets Manager in local development
  if (process.env.NODE_ENV === "development") {
    console.log("Running in development mode, using local .env variables");
    return;
  }
  try {
    const data = await secretsManager.getSecretValue({ SecretId: process.env.SECRETS_ID || "aim-backend-secrets" }).promise();
    if (data.SecretString) {
      const secrets = JSON.parse(data.SecretString);
      Object.assign(process.env, secrets);
    }
  } catch (err) {
    console.error("Using local env vars; secrets fetch failed:", err);
  }
}

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}?authSource=admin`;

(async () => {
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