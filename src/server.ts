import dotenv from "dotenv";
import { createServer } from "http";
import app from "./app";
import connectDB from "./db";
import { setupWebSocket } from "./websocket";

dotenv.config();

const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

(async () => {
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
