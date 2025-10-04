/**
 * @file This file configures and exports environment variables for the application.
 * It loads environment variables from a .env file located in the root of the project.
 * @requires dotenv
 * @requires path
 */
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables from the root .env file.
dotenv.config({ path: resolve(__dirname, "../../../.env") });

/**
 * An object containing the environment variables for the application.
 * @property {string} DATABASE_URL - The URL for connecting to the database.
 * @property {string} NODE_ENV - The current node environment (e.g., 'development', 'production').
 */
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  NODE_ENV: process.env.NODE_ENV || "development",
};
