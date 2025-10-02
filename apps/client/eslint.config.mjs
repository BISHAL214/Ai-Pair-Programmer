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

  // v-- ADD THIS OBJECT TO THE ARRAY --v
  {
    rules: {
      // This will turn the rule off for the entire project
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // ^-- END OF ADDED OBJECT --^
];

export default eslintConfig;
