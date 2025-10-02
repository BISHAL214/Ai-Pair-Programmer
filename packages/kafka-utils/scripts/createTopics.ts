// import { kafka } from "@ai_pair_programmer/kafka";

// const topics = [
//   { topic: "project_extracted", numPartitions: 3, replicationFactor: 1 },
//   { topic: "container_ready", numPartitions: 3, replicationFactor: 1 },
//   { topic: "sync_ready", numPartitions: 3, replicationFactor: 1 },
//   { topic: "sync_failed", numPartitions: 3, replicationFactor: 1 },
// ];

// async function createTopics() {
//   const admin = kafka.admin();
//   await admin.connect();

//   console.log("⏳ Checking/creating topics...");

//   await admin.createTopics({
//     topics,
//     waitForLeaders: true,
//   });

//   console.log(
//     "✅ Topics created or already exist:",
//     topics.map((t) => t.topic)
//   );
//   await admin.disconnect();
// }

// createTopics().catch((err) => {
//   console.error("❌ Error creating topics:", err);
//   process.exit(1);
// });



// // {
// //   "scripts": {
// //     "create-topics": "bun run scripts/createTopics.ts"
// //   }
// // }
