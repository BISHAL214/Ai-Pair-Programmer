import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";
dotenv.config();

console.log("DATABASE_URL:", process.env.DATABASE_URL);

export default defineConfig({
  out: "./migrations",
  schema: "./schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
