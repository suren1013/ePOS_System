import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Turns off the "Unexpected any" errors
      "@typescript-eslint/no-explicit-any": "off",
      // Turns off the "@ts-ignore" errors
      "@typescript-eslint/ban-ts-comment": "off",
      // Turns off the unescaped apostrophe/quote errors in HTML text
      "react/no-unescaped-entities": "off",
      // Suppresses warnings about defined variables you haven't used yet
      "@typescript-eslint/no-unused-vars": "off"
    }
  }
];

export default eslintConfig;