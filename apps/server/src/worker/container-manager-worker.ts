/**
 * @file This file defines the BullMQ worker for managing Docker containers.
 * It processes jobs from the `container-manager` queue to start containers,
 * and communicates status updates via Socket.IO and Inngest events.
 * @requires @ai_pair_programmer/orchestrator
 * @requires @ai_pair_programmer/redis
 * @requires bullmq
 * @requires socket.io-client
 * @requires ../inngest/utils/inngestEventProducer
 */
import {
  ContainerConfig,
  ContainerManager,
} from "@ai_pair_programmer/orchestrator";
import { connection } from "@ai_pair_programmer/redis";
import { Worker } from "bullmq";
import { io } from "socket.io-client";
import { produceEvent } from "../inngest/utils/inngestEventProducer";

/**
 * The URL of the Socket.IO server for real-time communication.
 * @type {string}
 */
const SOCKET_SERVER_URL =
  process.env.SOCKET_SERVER_URL || "http://localhost:3001";

/**
 * The Socket.IO client instance for this worker.
 * It connects to the main server to send real-time updates about container status.
 * @type {import("socket.io-client").Socket}
 */
const socketCLient = io(SOCKET_SERVER_URL, {
  transports: ["websocket"], // skip polling
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

/**
 * Event listener for successful socket connection.
 */
socketCLient.on("connect", () => {
  console.log("✅ Container Worker Socket connected:", socketCLient.id);
});

/**
 * Event listener for socket connection errors.
 */
socketCLient.on("connect_error", (err) => {
  console.error("❌ Container Worker Socket connection error:", err);
});

console.log("👷 Container Manager Worker started and waiting for jobs...");

/**
 * The BullMQ worker for the 'container-manager' queue.
 * This worker is responsible for processing jobs that require Docker container
 * creation and management. For each job, it starts a new container using the
 * ContainerManager, produces an Inngest event upon success, and returns container info.
 * @param {string} "container-manager" - The name of the queue to process.
 * @param {function} processor - The async function that processes each job.
 * @param {object} options - The worker options.
 */
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

/**
 * Event listener for when a job is completed successfully.
 * It emits a 'container' event via Socket.IO to notify the client.
 * @param {string} "completed" - The event name.
 * @param {function} listener - The callback function.
 */
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

/**
 * Event listener for when a job fails.
 * Logs the error to the console.
 * @param {string} "failed" - The event name.
 * @param {function} listener - The callback function.
 */
worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});
