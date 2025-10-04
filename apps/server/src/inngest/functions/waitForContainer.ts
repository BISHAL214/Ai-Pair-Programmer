/**
 * @file This file defines an Inngest function that waits for a container to be ready
 * after a project has been extracted. It listens for `project_extracted` events and
 * then waits for a corresponding `container_ready` event.
 * @requires @ai_pair_programmer/inngest
 */
import { inngest } from "@ai_pair_programmer/inngest";

/**
 * An Inngest function that waits for a container to become ready.
 * This function is triggered by the `project_extracted` event. It then waits for
 * a `container_ready` event that matches the `userId` and `projectId` from the
 * initial event. If the container becomes ready within the timeout, it sends a
 * `sync_ready` event. If it times out, it sends a `sync.failed` event.
 * @param {object} config - The function configuration.
 * @param {string} config.id - The unique ID for this function.
 * @param {object} trigger - The event that triggers this function.
 * @param {string} trigger.event - The name of the trigger event.
 * @param {function} handler - The async function to execute when the event is received.
 * @param {object} handler.event - The event payload from the `project_extracted` event.
 * @param {object} handler.step - The Inngest step control object.
 */
export const waitForContainer = inngest.createFunction(
  { id: "wait-for-container" },
  { event: "project_extracted" },
  async ({ event, step }) => {
    // wait up to 10 minutes for the container.ready event matching both userId+projectId
    const containerEvent = await step.waitForEvent("wait-for-container", {
      event: "container_ready",
      timeout: "10m",
      // Use CEL expression to match both properties
      if: "event.data.userId == async.data.userId && event.data.projectId == async.data.projectId",
    });

    if (!containerEvent) {
      // no container signal -> emit failure event or take action
      await step.sendEvent("sync.failed", {
        name: "sync.failed",
        data: {
          userId: event.data.userId,
          projectId: event.data.projectId,
          reason: "container-timeout",
        },
      });
      return;
    }

    // both events matched -> request sync
    await step.sendEvent("sync_ready", {
      name: "sync_ready",
      data: {
        userId: event.data.userId,
        projectId: event.data.projectId,
        containerId: containerEvent.data.containerInfo.id,
        containerStatus: containerEvent.data.containerInfo.status,
        supaPath: event.data.supaPath,
        branches: event.data.branches,
        zipPath: event.data.zipPath,
        types: event.data.types,
        tools: event.data.tools,
        monorepo: event.data.monorepo,
        containerJobId: event.data.containerJobId,
      },
    });
  }
);
