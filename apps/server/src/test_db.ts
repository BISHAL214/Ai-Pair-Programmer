import "../../../.env"; // Loads the shared .env (one line only!)
import { db } from "@repo/db";

async function main() {
  const users = await db.query.users.findMany();
  console.log(users);
}

main();
