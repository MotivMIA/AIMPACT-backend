import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> origin/main
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import { setupSwagger } from "./swagger";

const app: Express = express();

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
<<<<<<< HEAD
=======
=======
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
>>>>>>> origin/main
>>>>>>> origin/main
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
<<<<<<< HEAD
app.use("/api/transactions", transactionRoutes);

setupSwagger(app);
=======
<<<<<<< HEAD
app.use("/api/transactions", transactionRoutes);

setupSwagger(app);
=======
app.use("/api", transactionRoutes);
>>>>>>> origin/main
>>>>>>> origin/main

export default app;
