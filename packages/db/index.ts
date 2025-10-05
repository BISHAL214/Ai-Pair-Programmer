import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" }); // Load environment variables from .env file

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("❌ DATABASE_URL is not set in environment variables");
}

const pool = new Pool({ connectionString });

const db = drizzle(pool, { schema });
export { db as default, schema };

// const migrateDB = async() => {
//   try {
//     console.log("Starting database migration...");
//     await migrate(db, { migrationsFolder: "./migrations" });
//   } catch (error) {
//     console.error("Error during database migration:", error);
//   }
// }
// migrateDB()
//   .then(() => console.log("Database migration completed successfully."))
//   .catch((error) => console.error("Error during database migration:", error));

// export default db;
