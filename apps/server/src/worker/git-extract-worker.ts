import { connection } from "@repo/redis";
import { Worker } from "bullmq";
import { io } from "socket.io-client";
import {
  extractFileFromUploadedZip,
  extractFilesFromGitAndUpload,
} from "../extractor";

const SERVER_SOCKET_URL =
  process.env.SERVER_SOCKET_URL || "http://localhost:3001";

// Function to get the initialized Socket.IO instance from the server
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

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});
