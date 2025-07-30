import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";
dotenv.config();

export default defineConfig({
  out: "./migrations",
  schema: "./schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
