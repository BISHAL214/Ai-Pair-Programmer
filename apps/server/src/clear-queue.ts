/**
 * @file A script to clear a specified BullMQ queue.
 * This script takes a queue name as a command-line argument and obliterates it.
 * @requires ./queue
 */
import { extractQueue, containerManagerQueue, syncReadyQueue } from "./queue";

/**
 * Clears all jobs from a specified queue.
 * The queue name is used to identify which queue to clear.
 * It supports 'extract', 'container', and 'file-sync' queues.
 * Exits the process after completion or on error.
 * @param {string} queueName - The name of the queue to clear.
 * @returns {Promise<void>} A promise that resolves when the queue is cleared or the process exits.
 */
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

// Get the queue name from the command-line arguments.
const queueName = process.argv[2];
if (!queueName) {
  console.error("❌ Please provide a queue name as an argument.");
  process.exit(1);
}

// Execute the clearQueue function.
clearQueue(queueName);
