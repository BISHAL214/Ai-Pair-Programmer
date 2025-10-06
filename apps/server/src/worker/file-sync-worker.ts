import { ContainerManager } from "@repo/orchestrator";
import { connection } from "@repo/redis";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Worker } from "bullmq";
import { io } from "socket.io-client";

console.log("👷 File Sync Worker started and waiting for jobs...");
const socketClient = io(
  process.env.SOCKET_SERVER_URL || "http://localhost:3001",
  {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  }
);
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

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabase_service_role_key = process.env.SERVICE_ROLE_KEY!;

console.log("Supabase URL:", supabase_url ? "Loaded" : "Missing");
console.log(
  "Supabase Service Role Key:",
  supabase_service_role_key ? "Loaded" : "Missing"
);

if (!supabase_url || !supabase_service_role_key) {
  throw new Error("Supabase URL or Service Role Key is not set in env vars");
}

export const supabase: SupabaseClient = createClient(
  supabase_url,
  supabase_service_role_key
);

const worker = new Worker(
  "sync-supabase-to-container",
  async (job) => {
    const {
      userId,
      projectId,
      supaPath,
      branches,
      types,
      tools,
      monorepo,
      containerId,
      containerStatus,
      zipPath,
    } = job.data;
    console.log(`Processing job ${job.id}...`);
    if (!zipPath) {
      throw new Error("zipPath is missing in job data");
    }
    const containerManager = new ContainerManager();
    const docker = containerManager.getDockerInstance();
    if (containerStatus === "running") {
      const container = docker.getContainer(containerId);
      // const ngnixContainer = containerManager.startNginxProxy(userId);
      if (!container) {
        throw new Error(`Container with ID ${containerId} not found`);
      }
      // if (!ngnixContainer) {
      //   throw new Error(`Nginx Proxy Container not found`);
      // }

      try {
        console.log(
          `Syncing files from Supabase path ${zipPath} to container ${containerId}...`
        );
        const { data } = await supabase.storage
          .from("projects")
          .createSignedUrl(
            zipPath,
            60 // URL valid for 60 seconds
          );
        if (!data || !data.signedUrl) {
          throw new Error("Failed to get signed URL for zip file");
        }

        //   const proxyUrl = data.signedUrl?.replace(
        //     "https://mpgobcyypxiriumryrdu.supabase.co",
        //     `http://aipp-nginx-${userId}/supabase/${zipPath}`
        //   );

        //   console.log("proxy-URL ->>>>", proxyUrl);
        const cmd = [
          "bash",
          "-c",
          `curl -L "${data.signedUrl}" | unzip -o -d /workspace -`,
        ];

        const exec = await container.exec({
          Cmd: cmd,
          AttachStdout: true,
          AttachStderr: true,
        });

        const stream = await exec.start({}); // later: hijack: true, stdin: false
        container.modem.demuxStream(stream, process.stdout, process.stderr);

        await new Promise((resolve, reject) => {
          stream.on("end", resolve);
          stream.on("error", reject);
        });

        // changing the network to internal true
        const networkName = await containerManager.ensureUserNetwork(
          userId,
          true
        );
        await docker
          .getNetwork(networkName)
          .connect({ Container: containerId });

        console.log(
          `✅ Files synced to container ${containerId} for job ${job.id}`
        );
        //   (await ngnixContainer).stop().catch((err) => {
        //     console.error("Failed to stop Nginx Proxy container:", err);
        //   });
        //   (await ngnixContainer).remove().catch((err) => {
        //     console.error("Failed to remove Nginx Proxy container:", err);
        //   });
      } catch (error) {
        console.error(
          `Failed to create command for container ${containerId}:`,
          error
        );
      }
    }

    console.log(`✅ syncing files for job ${job.id} complete`);
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
