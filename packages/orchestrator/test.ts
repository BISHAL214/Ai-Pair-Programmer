import { ContainerManager, ContainerConfig } from "./containerManager";

async function testContainerLifecycle() {
  const manager = new ContainerManager();

  const config: ContainerConfig = {
    userId: "ec9d5e2f-2327-460b-ba70-d34bc60acf8e",
    projectId: "36332904-aae8-44f2-a7fd-85f522d87333",
    template: "node",
    cpu: 1,
    memoryMB: 512,
  };

  try {
    console.log("🚀 Testing container lifecycle...");

    // 1. Start container
    console.log("\n1️⃣  Starting container...");
    const info = await manager.startContainer(config);
    console.log("Container info:", info);

    // 2. Check status
    console.log("\n2️⃣  Checking status...");
    const status = await manager.getContainerStatus(
      config.userId,
      config.projectId
    );
    console.log("Status:", status);

    // 3. List user containers
    console.log("\n3️⃣  Listing user containers...");
    const containers = await manager.listUserContainers(config.userId);
    console.log("User containers:", containers);

    // 4. Stop container
    console.log("\n4️⃣  Stopping container...");
    await manager.stopContainer(config.userId, config.projectId);

    // 5. Check status again
    console.log("\n5️⃣  Checking status after stop...");
    const stoppedStatus = await manager.getContainerStatus(
      config.userId,
      config.projectId
    );
    console.log("Status:", stoppedStatus);

    // 6. Remove container
    console.log("\n6️⃣  Removing container...");
    await manager.removeContainer(config.userId, config.projectId);

    // 7. Final status check
    console.log("\n7️⃣  Final status check...");
    const finalStatus = await manager.getContainerStatus(
      config.userId,
      config.projectId
    );
    console.log("Status:", finalStatus);
    console.log("\n✅ Container lifecycle test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testContainerLifecycle();
