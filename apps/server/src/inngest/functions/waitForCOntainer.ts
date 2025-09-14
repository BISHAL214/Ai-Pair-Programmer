import { inngest } from "@ai_pair_programmer/inngest";

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
        supaPath: event.data.supaPath,
        types: event.data.types,
        tools: event.data.tools,
        monorepo: event.data.monorepo,
        containerJobId: event.data.containerJobId,
      },
    });
  }
);
