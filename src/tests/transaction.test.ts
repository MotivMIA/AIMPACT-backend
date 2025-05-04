import request from "supertest";
import app from "../app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Transaction from "../models/Transaction";
import { WebSocketServer, WebSocket } from "ws";

jest.mock("ws");

let mongoServer: MongoMemoryServer;
let token: string;
let transactionId: string;
let mockSend: jest.Mock;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  const user = new User({ email: "test@example.com", password: "hashed" });
  await user.save();
  // Ensure JWT_SECRET is set; fallback to a test secret if undefined
  const jwtSecret = process.env.JWT_SECRET || "test-secret";
  token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: "1h" });
  const transaction = new Transaction({ userId: user._id, amount: 100, type: "deposit", status: "Pending" });
  await transaction.save();
  transactionId = transaction._id.toString();

  // Mock WebSocketServer
  mockSend = jest.fn();
  const mockClient = { readyState: WebSocket.OPEN, send: mockSend };
  const mockClients = new Set([mockClient]);
  const mockWss = { clients: mockClients } as unknown as WebSocketServer;
  app.set('wss', mockWss);
});

afterAll(async () => {
  await mongoose.connection.close();
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
    expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('"type":"transactionUpdate"'));
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