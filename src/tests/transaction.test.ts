import request from "supertest";
import app from "../app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Transaction from "../models/Transaction";

jest.mock("ws");

let mongoServer: MongoMemoryServer;
let token: string;
let transactionId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  const user = new User({ email: "test@example.com", password: "hashed" });
  await user.save();
  token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
  const transaction = new Transaction({ userId: user._id, amount: 100, type: "deposit", status: "Pending" });
  await transaction.save();
  transactionId = transaction._id.toString();

  // Mock WebSocketServer
  const mockWss = { clients: new Set([{ readyState: 1, send: jest.fn() }]) };
  app.set('wss', mockWss);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  jest.clearAllMocks();
});

describe("POST /api/v1/transactions", () => {
  it("should create a transaction", async () => {
    const res = await request(app)
      .post("/api/v1/transactions")
      .set("Cookie", `token=${token}`)
      .send({ amount: 100, type: "deposit", category: "test", description: "Test transaction" });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Transaction created");
  });

  it("should fail if amount is missing", async () => {
    const res = await request(app)
      .post("/api/v1/transactions")
      .set("Cookie", `token=${token}`)
      .send({ type: "deposit", category: "test", description: "Test transaction" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Amount must be a number");
  });

  it("should fail if amount is negative", async () => {
    const res = await request(app)
      .post("/api/v1/transactions")
      .set("Cookie", `token=${token}`)
      .send({ amount: -100, type: "deposit", category: "test", description: "Test transaction" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Amount must be positive");
  });

  it("should fail if type is invalid", async () => {
    const res = await request(app)
      .post("/api/v1/transactions")
      .set("Cookie", `token=${token}`)
      .send({ amount: 100, type: "invalid", category: "test", description: "Test transaction" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Type must be 'deposit' or 'withdrawal'");
  });
});

describe("GET /api/v1/transactions", () => {
  it("should return paginated transactions", async () => {
    const res = await request(app)
      .get("/api/v1/transactions?page=1&limit=2")
      .set("Cookie", `token=${token}`);
    expect(res.status).toBe(200);
    expect(res.body.transactions).toBeInstanceOf(Array);
    expect(res.body.pagination).toHaveProperty("page", 1);
    expect(res.body.pagination).toHaveProperty("limit", 2);
  });
});

describe("PATCH /api/v1/transactions/status", () => {
  it("should update transaction status", async () => {
    const res = await request(app)
      .patch("/api/v1/transactions/status")
      .set("Cookie", `token=${token}`)
      .send({ transactionId, status: "Completed" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Transaction status updated");
    expect(res.body.transaction.status).toBe("Completed");
    expect(app.get('wss').clients.values().next().value.send).toHaveBeenCalled();
  });

  it("should fail if status is invalid", async () => {
    const res = await request(app)
      .patch("/api/v1/transactions/status")
      .set("Cookie", `token=${token}`)
      .send({ transactionId, status: "Invalid" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Status must be 'Pending', 'Completed', or 'Failed'");
  });
});
