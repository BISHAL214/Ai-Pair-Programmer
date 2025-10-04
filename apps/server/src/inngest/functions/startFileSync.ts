/**
 * @file This file defines an Inngest function that triggers the file synchronization process.
 * It listens for a `sync_ready` event and adds a job to the `syncReadyQueue`.
 * @requires @ai_pair_programmer/inngest
 * @requires ../../queue
 */
import { inngest } from "@ai_pair_programmer/inngest";
import { syncReadyQueue } from "../../queue";

/**
 * An Inngest function that starts the file synchronization process.
 * This function is triggered by the `sync_ready` event. It takes the event
 * payload and adds a new job to the `syncReadyQueue` to handle the actual
 * file synchronization from Supabase to the development container.
 * @param {object} config - The function configuration.
 * @param {string} config.id - The unique ID for this function.
 * @param {object} trigger - The event that triggers this function.
 * @param {string} trigger.event - The name of the trigger event.
 * @param {function} handler - The async function to execute when the event is received.
 * @param {object} handler.event - The event payload.
 * @param {object} handler.step - The Inngest step control object.
 */
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
