import { inngest } from "@ai_pair_programmer/inngest";
import { syncReadyQueue } from "../../queue";

export const startFileSync = inngest.createFunction(
  { id: "start-file-sync" },
  { event: "sync_ready" },
  async ({ event, step }) => {
    await step.run("enqueue-file-sync", async () => {
      await syncReadyQueue.add(
        "sync-files",
        {
          userId: event.data.userId,
          projectId: event.data.projectId,
          containerId: event.data.containerId,
          containerStatus: event.data.containerStatus,
          supaPath: event.data.supaPath,
          zipPath: event.data.zipPath,
          branches: event.data.branches,
          types: event.data.types,
          tools: event.data.tools,
          monorepo: event.data.monorepo,
        },
        { attempts: 5, removeOnComplete: true }
      );
    });
  }
);
