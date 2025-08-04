import { extractQueue } from "./queue";

async function clearQueue() {
  await extractQueue
    .obliterate({ force: true })
    .then(() => {
      console.log("✅ Queue cleared successfully");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Failed to clear queue:", err);
        process.exit(1)
    });
}

clearQueue()