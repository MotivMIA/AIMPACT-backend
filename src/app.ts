import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { validationResult } from "express-validator";
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import xrsRoutes from "./routes/xrsRoutes.js"; // Changed from xnrRoutes.js
const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
  max: parseInt(process.env.RATE_LIMIT_MAX || "100")
}));

console.log("Mounting routes...");
app.use("/api/v1", healthRoutes);
console.log("Mounted healthRoutes");
app.use("/api/v1", authRoutes);
console.log("Mounted authRoutes");
app.use("/api/v1", xrsRoutes);
console.log("Mounted xrsRoutes");

app.get("/api/v1/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Validation error handling
app.use((req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  next();
});

// General error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ error: "Internal server error" });
});

export default app;