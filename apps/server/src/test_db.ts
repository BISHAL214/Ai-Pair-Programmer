import "../../../.env"; // Loads the shared .env (one line only!)
import db from "@ai_pair_programmer/db/index";

async function main() {
  const users = await db.query.users.findMany();
  console.log(users);
}

main();
