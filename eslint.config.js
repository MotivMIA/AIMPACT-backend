import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig({
  files: ["**/*.{js,mjs,cjs,ts}"],
  plugins: ["@typescript-eslint"], // Corrected: plugins should be an array of strings
  languageOptions: {
    globals: globals.browser,
    parser: "@typescript-eslint/parser",
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
});