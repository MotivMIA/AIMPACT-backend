import { body } from "express-validator";
import request from "supertest";
import app from "../app"; // Adjust the path to your Express app file

export const registerValidation = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
];

it("should register a new user", async () => {
  const res = await request(app).post("/api/auth/register").send({
    email: "test@example.com",
    password: "password123", // Ensure password meets the minimum length requirement
  });
  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty("message", "Registration successful");
});