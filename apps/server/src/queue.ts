/**
 * @file This file defines and exports BullMQ queues for handling various background jobs.
 * It sets up queues for extraction, container management, and synchronization tasks.
 * @requires bullmq
 * @requires @ai_pair_programmer/redis
 */
import { Queue } from "bullmq";
import { connection } from "@ai_pair_programmer/redis";

/**
 * Queue for handling file extraction jobs from repositories.
 * Jobs in this queue are responsible for cloning or downloading repositories
 * and extracting their file contents.
 * @type {Queue}
 */
export const extractQueue = new Queue("extract-jobs", {
  connection,
  defaultJobOptions: { removeOnComplete: true, attempts: 3 },
});

/**
 * Queue for managing Docker containers.
 * Jobs in this queue handle the lifecycle of containers, such as
 * setting up environments, starting, and stopping them.
 * @type {Queue}
 */
export const containerManagerQueue = new Queue("container-manager", {
  connection,
  defaultJobOptions: { removeOnComplete: true, attempts: 3 },
});

/**
 * Queue for synchronizing files from Supabase to a running container.
 * Jobs in this queue are triggered when a project's files need to be
 * updated in the development container.
 * @type {Queue}
 */
export const syncReadyQueue = new Queue("sync-supabase-to-container", {
  connection,
  defaultJobOptions: { removeOnComplete: true, attempts: 3 },
});
