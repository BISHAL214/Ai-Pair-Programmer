/**
 * @file This file defines the BullMQ worker for extracting files from Git repositories and zip archives.
 * It processes jobs from the `extract-jobs` queue, using helper functions from `extractor.ts`,
 * and communicates status updates via Socket.IO.
 * @requires @ai_pair_programmer/redis
 * @requires bullmq
 * @requires socket.io-client
 * @requires ../extractor
 */
import { connection } from "@ai_pair_programmer/redis";
import { Worker } from "bullmq";
import { io } from "socket.io-client";
import {
  extractFileFromUploadedZip,
  extractFilesFromGitAndUpload,
} from "../extractor";

const SERVER_SOCKET_URL =
  process.env.SERVER_SOCKET_URL || "http://localhost:3001";

/**
 * The Socket.IO client instance for this worker.
 * It connects to the main server to send real-time updates about the extraction process.
 * @type {import("socket.io-client").Socket}
 */
const socketClient = io(SERVER_SOCKET_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

console.log("👷 Extract Worker started and waiting for jobs...");

socketClient.on("connect", () => {
  console.log(
    "🤖 Extract Worker connected to server via WebSocket:",
    socketClient.id
  );
});

socketClient.on("connect_error", (err) => {
  console.error(
    "❌ Extract Extract Worker failed to connect to server via WebSocket:",
    err
  );
});

/**
 * The BullMQ worker for the 'extract-jobs' queue.
 * This worker processes jobs for extracting files from either a GitHub repository or a zip file.
 * It calls the appropriate extraction function based on the `sourceType` in the job data.
 * @param {string} "extract-jobs" - The name of the queue to process.
 * @param {function} processor - The async function that processes each job.
 * @param {object} options - The worker options.
 */
const worker = new Worker(
  "extract-jobs",
  async (job) => {
    const {
      repoUrl,
      repoName,
      branches,
      token,
      userId,
      sourceType,
      zipPath,
      projectName,
      projectId,
    } = job.data;
    console.log(`Processing job ${job.id}...`);
    if (sourceType === "github") {
      console.log(
        `Extracting files from GitHub repo: ${repoName} (${repoUrl})`
      );
      await extractFilesFromGitAndUpload(
        repoUrl,
        repoName,
        userId,
        branches,
        token,
        projectId
      );
    } else if (sourceType === "zip") {
      console.log(`Extracting files from uploaded zip: ${projectName}`);
      await extractFileFromUploadedZip(zipPath, userId, projectName, projectId);
    }
    console.log(`Finished job ${job.id}`);
    return { status: "done" };
  },
  { connection, concurrency: 2 }
);

/**
 * Event listener for when a job is completed successfully.
 * It emits an 'extraction' event via Socket.IO to notify the client.
 * @param {string} "completed" - The event name.
 * @param {function} listener - The callback function.
 */
worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
  try {
    if (!socketClient.connected) {
      console.error("❌ Socket client is not connected. Cannot emit event.");
      return;
    }
    const { userId, projectId } = job.data;
    const room = `${projectId}:${userId}`;
    socketClient.emit("extraction", {
      status: "completed",
      jobId: job.id,
      room, // include the room in the payload
    });
  } catch (error) {
    console.error("⚠️ Error emitting socket event:", error);
  }
});

/**
 * Event listener for when a job fails.
 * Logs the error to the console.
 * @param {string} "failed" - The event name.
 * @param {function} listener - The callback function.
 */
worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});
