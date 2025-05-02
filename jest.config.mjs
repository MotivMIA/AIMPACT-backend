export default {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json"],
<<<<<<< HEAD
  transform: { "^.+\\.ts$": "ts-jest" },
=======
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
>>>>>>> origin/main
  testMatch: ["**/src/tests/**/*.test.ts"]
};
