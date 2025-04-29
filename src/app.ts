import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import transactionRoutes from "./routes/transactionRoutes";

const app: Express = express();

app.use(
cors({
origin: process.env.FRONTEND_URL || "http://localhost:5173",
credentials: true,
})
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api", transactionRoutes);

export default app;
