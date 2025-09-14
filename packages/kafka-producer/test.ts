import { ConsumerManager } from "@ai_pair_programmer/kafka-consumer";
import { ProducerManager } from "./index";

(async () => {
  const topic = "project_extracted";

  // Setup consumer manager
  const manager = new ConsumerManager(topic);
  await manager.init();

  await new Promise(r => setTimeout(r, 3000));

  // Add initial consumers
  await manager.addConsumer();
  await manager.addConsumer();

  // Setup producer
  const producer = new ProducerManager();
  await producer.connect();

  // Periodically send messages
  let counter = 1;
  setInterval(async () => {
    await producer.sendMessage(topic, `Message ${counter}`);
    counter++;
  }, 2000);

  // Simulate scaling consumers dynamically
  setTimeout(() => manager.addConsumer(), 5000); // add after 5s
  setTimeout(() => manager.addConsumer(), 10000); // add after 10s
  setTimeout(() => manager.removeConsumer(), 15000); // remove after 15s
})();
