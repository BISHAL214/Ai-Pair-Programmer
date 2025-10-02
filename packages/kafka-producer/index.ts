// import { kafka } from "@ai_pair_programmer/kafka";

// export class ProducerManager {
//   private producer = kafka.producer();

//   async connect() {
//     await this.producer.connect();
//     console.log("🚀 Producer connected");
//   }

//   async sendMessage(topic: string, message: string, key?: string) {
//     await this.producer.send({
//       topic,
//       messages: [
//         {
//           key,
//           value: message,
//         },
//       ],
//     });
//     console.log(`📤 Sent message → ${message}`);
//   }

//   async disconnect() {
//     await this.producer.disconnect();
//     console.log("❌ Producer disconnected");
//   }
// }
