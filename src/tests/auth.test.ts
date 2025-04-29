import request from "supertest";
import app from "../app";
import connectDB from "../db";
import mongoose from "mongoose";
import { validationResult } from "express-validator";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection is not established");
  }
  const collections = await db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

describe("POST /api/auth/register", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "password123", // Ensure password meets the minimum length requirement
    });
    console.log("Response body:", res.body); // Debugging
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Registration successful");
  });

  it("should return 400 if email or password is missing", async () => {
    const res = await request(app).post("/api/auth/register").send({});
    console.log("Response body:", res.body); // Debugging
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid email"); // Adjust based on validation logic
  });
});

test("should log validation errors", () => {
  const req = {
    body: {}, // Mock request body
  };

  const errors = validationResult(req as any); // Mock validation result
  console.log("Request body:", req.body);
  console.log("Validation errors:", errors.array());
});
