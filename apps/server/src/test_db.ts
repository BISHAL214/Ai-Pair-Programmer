/**
 * @file This script is for testing the database connection and querying users.
 * It loads environment variables, connects to the database, fetches all users,
 * and logs them to the console.
 * @requires ../../../.env
 * @requires @ai_pair_programmer/db/index
 */
import "../../../.env"; // Loads the shared .env (one line only!)
import db from "@ai_pair_programmer/db/index";

/**
 * The main function to test the database connection.
 * It fetches all users from the database and prints them to the console.
 * @returns {Promise<void>} A promise that resolves when the users have been logged.
 */
async function main() {
  const users = await db.query.users.findMany();
  console.log(users);
}

// Execute the main function to run the test.
main();
