import { Request, Response, NextFunction } from "express";
import client from "prom-client";

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 10]
});

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "code"]
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();
  res.on("finish", () => {
    const duration = process.hrtime(start);
    const durationSeconds = duration[0] + duration[1] / 1e9;
    httpRequestDuration.labels(req.method, req.path, res.statusCode.toString()).observe(durationSeconds);
    httpRequestsTotal.labels(req.method, req.path, res.statusCode.toString()).inc();
  });
  next();
};

export const setupMetrics = (app: Express) => {
  client.collectDefaultMetrics();
  app.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  });
};
