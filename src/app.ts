import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import healthRoutes from "./routes/healthRoutes";
import { metricsMiddleware, setupMetrics } from "./middleware/metricsMiddleware";
import { loggerMiddleware } from "./middleware/loggerMiddleware";
import { errorMiddleware } from "./middleware/errorMiddleware";
import { setupSwagger } from "./swagger";

const app: Express = express();

app.use(rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS!) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX!) || 100
}));
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(metricsMiddleware);
app.use(loggerMiddleware);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1", healthRoutes);

setupSwagger(app);
setupMetrics(app);
app.use(errorMiddleware);

export default app;
