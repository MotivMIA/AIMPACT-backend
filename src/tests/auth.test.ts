import request from "supertest";
import app from "../app";
import connectDB from "../db";
import mongoose from "mongoose";

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("POST /api/auth/register", () => {
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@example.com",
        password: "password123",
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Registration successful");
  });
});
