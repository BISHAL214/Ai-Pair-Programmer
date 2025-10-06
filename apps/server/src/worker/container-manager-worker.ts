import { ContainerConfig, ContainerManager } from "@repo/orchestrator";
import { connection } from "@repo/redis";
import { Worker } from "bullmq";
import { io } from "socket.io-client";
import { produceEvent } from "../inngest/utils/inngestEventProducer";

const SOCKET_SERVER_URL =
  process.env.SOCKET_SERVER_URL || "http://localhost:3001";

// Test Socket.IO connection
const socketCLient = io(SOCKET_SERVER_URL, {
  transports: ["websocket"], // skip polling
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socketCLient.on("connect", () => {
  console.log("✅ Container Worker Socket connected:", socketCLient.id);
});

socketCLient.on("connect_error", (err) => {
  console.error("❌ Container Worker Socket connection error:", err);
});

console.log("👷 Container Manager Worker started and waiting for jobs...");

const worker = new Worker(
  "container-manager",
  async (job) => {
    const { userId, projectId, template, cpu, memoryMB }: ContainerConfig =
      job.data;
    console.log(`Processing job ${job.id}...`);
    const containerManager = new ContainerManager();

    // start container
    console.log(`Starting container for job ${job.id}...`);
    const info = await containerManager.startContainer({
      userId,
      projectId,
      template,
      cpu,
      memoryMB,
    });
    console.log(`Container started for job ${job.id}:`, info);
    console.log(`Emitting container_ready event for job ${job.id}...`);
    produceEvent({
      name: "container_ready",
      id: `${userId}:${projectId}:container_ready`,
      data: {
        userId,
        projectId,
        containerInfo: info,
      },
    });
    return {
      userId,
      projectId,
      containerInfo: info,
    };
  },
  { connection, concurrency: 2 }
);
worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
  const { userId, projectId, containerInfo } = job.returnvalue;
  console.log({ userId, projectId, containerInfo });

  if (!socketCLient.connected) {
    console.error("❌ Socket client is not connected. Cannot emit event.");
    return;
  }

  // Notify the client about job completion via WebSocket
  const room = `${projectId}:${userId}`;
  try {
    socketCLient.emit("container", {
      status: "completed",
      jobId: job.id,
      containerId: containerInfo?.id,
      containerStatus: containerInfo?.status,
      room, // include the room in the payload
    });
    console.log(`Job ${job.id} output:`, containerInfo);
  } catch (error) {
    console.error("⚠️ Socket.IO not initialized (is server running?)", error);
  }
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});
