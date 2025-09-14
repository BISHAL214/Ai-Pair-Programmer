import { connection } from "@ai_pair_programmer/redis";
import { Worker } from "bullmq";
import { io } from "socket.io-client";

const socketClient = io(
  process.env.SOCKET_SERVER_URL || "http://localhost:3001",
  {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  }
);

console.log("👷 File Sync Worker started and waiting for jobs...");

socketClient.on("connect", () => {
  console.log(
    "File Sync Worker connected to socket server with ID:",
    socketClient.id
  );
});

socketClient.on("connect_error", (err) => {
  console.error(
    "❌ File Sync Worker failed to connect to server via WebSocket:",
    err
  );
});
const worker = new Worker(
  "sync-supabase-to-container",
  async (job) => {
    const { userId, projectId, supaPath, types, tools, monorepo, containerId } =
      job.data;
    console.log(`Processing job ${job.id}...`);

    console.log(
      `Syncing files for user ${userId}, project ${projectId}... to container ${containerId}, supaPath: ${supaPath}, types: ${types}, tools: ${tools}, monorepo: ${monorepo}`
    );
    return { success: true };
  },
  { connection, concurrency: 2 }
);
worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
  const { userId, projectId, containerId } = job.data;
  if (!socketClient.connected) {
    console.warn("Socket client not connected, cannot emit file sync event");
    return;
  }
  try {
    const room = `${projectId}:${userId}`;
    socketClient.emit("fileSync", {
      status: "completed",
      jobId: job.id,
      // containerId,
      room, // include the room in the payload
    });
    console.log(`Emitted file sync event for job ${job.id} to room ${room}`);
  } catch (error) {
    console.error(
      `❌ Failed to emit file sync event for job ${job.id}:`,
      error
    );
  }
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});
