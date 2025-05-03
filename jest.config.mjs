import dotenv from 'dotenv';

dotenv.config({ path: '/Users/nathanwilliams/Documents/projects/aim-backend/.env' });

export default {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json"],
  transform: { "^.+\\.ts$": "ts-jest" },
  testMatch: ["**/src/tests/**/*.test.ts"]
};
