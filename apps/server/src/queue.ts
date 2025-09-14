import { Queue } from "bullmq";
import { connection } from "@ai_pair_programmer/redis";

export const extractQueue = new Queue("extract-jobs", {
  connection,
  defaultJobOptions: { removeOnComplete: true, attempts: 3 },
});

export const containerManagerQueue = new Queue("container-manager", {
  connection,
  defaultJobOptions: { removeOnComplete: true, attempts: 3 },
});

export const syncReadyQueue = new Queue("sync-supabase-to-container", {
  connection,
  defaultJobOptions: { removeOnComplete: true, attempts: 3 },
});
