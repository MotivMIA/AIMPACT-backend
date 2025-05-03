require('dotenv').config({ path: '/Users/nathanwilliams/Documents/projects/aim-backend/.env' });
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json"],
  transform: { "^.+\\.ts$": "ts-jest" },
  testMatch: ["**/src/tests/**/*.test.ts"]
};
