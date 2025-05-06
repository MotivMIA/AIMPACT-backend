import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes";
import authRoutes from "./routes/authRoutes"; // Adjust based on your routes

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "https://motivmia.github.io/aim/",
  credentials: true
}));
app.use(express.json());

app.use("/api/v1", healthRoutes);
app.use("/api/v1/auth", authRoutes); // Adjust based on your routes

export default app;
