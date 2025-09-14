import { kafka } from "@ai_pair_programmer/kafka";
import { Consumer } from "kafkajs";

type ManagedConsumer = {
  id: string;
  groupId: string;
  instance: Consumer;
};

export class ConsumerManager {
  private consumers: ManagedConsumer[] = [];
  private partitions = 0;
  private topic: string;

  constructor(topic: string) {
    this.topic = topic;
  }

  async init() {
    this.partitions = await this.getPartitionCount(this.topic);
    console.log(`📊 Topic "${this.topic}" has ${this.partitions} partitions`);
  }

  private async getPartitionCount(topic: string): Promise<number> {
    const admin = kafka.admin();
    await admin.connect();
    const metadata = await admin.fetchTopicMetadata({ topics: [topic] });
    await admin.disconnect();
    return metadata.topics[0].partitions.length;
  }

  private async createConsumer(groupId: string, consumerId: string) {
    const consumer = kafka.consumer({ groupId });
    await consumer.connect();
    await consumer.subscribe({ topic: this.topic, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(
          `📥 [Consumer ${consumerId}] Group=${groupId} | Partition=${partition} | ${message.value?.toString()}`
        );
      },
    });

    return consumer;
  }

  async addConsumer() {
    const consumerId = `consumer-${this.consumers.length + 1}`;

    // Count consumers per group
    const groupCounts: Record<string, number> = {};
    this.consumers.forEach((c) => {
      groupCounts[c.groupId] = (groupCounts[c.groupId] || 0) + 1;
    });

    // Pick group with available slot
    let assignedGroup = "";
    for (let i = 0; ; i++) {
      const groupId = `dynamic-group-${i}`;
      const count = groupCounts[groupId] || 0;
      if (count < this.partitions) {
        assignedGroup = groupId;
        break;
      }
    }

    const instance = await this.createConsumer(assignedGroup, consumerId);
    this.consumers.push({ id: consumerId, groupId: assignedGroup, instance });

    console.log(`✅ Added ${consumerId} → ${assignedGroup}`);
  }

  async removeConsumer() {
    const consumer = this.consumers.pop();
    if (!consumer) {
      console.log("⚠️ No consumers to remove");
      return;
    }
    await consumer.instance.disconnect();
    console.log(`❌ Removed ${consumer.id} from ${consumer.groupId}`);
  }
}
