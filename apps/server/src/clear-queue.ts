import { extractQueue, containerManagerQueue, syncReadyQueue } from "./queue";

async function clearQueue(queueName: string) {
  const queue =
    queueName === "extract"
      ? extractQueue
      : queueName === "container"
        ? containerManagerQueue
        : queueName === "file-sync"
          ? syncReadyQueue
          : null;

  if (!queue) {
    console.error(`❌ Unknown queue name: ${queueName}`);
    process.exit(1);
  }
  await queue
    .obliterate({ force: true })
    .then(() => {
      console.log(`✅ Queue "${queueName}" cleared successfully`);
      process.exit(0);
    })
    .catch((err) => {
      console.error(`❌ Failed to clear queue "${queueName}":`, err);
      process.exit(1);
    });
}

const queueName = process.argv[2];
if (!queueName) {
  console.error("❌ Please provide a queue name as an argument.");
  process.exit(1);
}

clearQueue(queueName);
