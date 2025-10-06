import { Redis } from "@upstash/redis";
import { ConnectionOptions } from "bullmq";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const connection: ConnectionOptions = {
  url: process.env.UPSTASH_REDIS_REST_URL!,
};
