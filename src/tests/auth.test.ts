import request from "supertest";
import app from "../app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("POST /api/auth/register", () => {
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "password123" });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Registration successful");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should fail if email is invalid", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "invalid", password: "password123" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid email");
  });
});
