     import express from "express";
     import cors from "cors";
     import cookieParser from "cookie-parser";
     import { rateLimit } from "express-rate-limit";

     const app = express();

     app.use(cors());
     app.use(cookieParser());
     app.use(express.json());
     app.use(rateLimit({
       windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
       max: parseInt(process.env.RATE_LIMIT_MAX || "100")
     }));

     app.get("/api/v1/health", (req, res) => {
       res.json({ status: "OK", timestamp: new Date().toISOString() });
     });

     export default app;