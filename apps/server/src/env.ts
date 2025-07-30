import * as dotenv from "dotenv";
import { resolve } from "path";

// Load from root `.env` always
dotenv.config({ path: resolve(__dirname, "../../../.env") });

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  NODE_ENV: process.env.NODE_ENV || "development",
};
