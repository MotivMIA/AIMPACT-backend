import request from "supertest";
import app from "../app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import User from "../models/User";

let mongoServer: MongoMemoryServer;
let token: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  const user = new User({ email: "test@example.com", password: "hashed" });
  await user.save();
  token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("POST /api/transactions", () => {
  it("should create a transaction", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Cookie", `token=${token}`)
      .send({ amount: 100, type: "deposit", category: "test", description: "Test transaction" });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Transaction created");
  });

  it("should fail if amount is missing", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Cookie", `token=${token}`)
      .send({ type: "deposit", category: "test", description: "Test transaction" });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("validation");
  });
});
