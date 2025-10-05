require("dotenv-mono").load({ path: "../../.env" });
import { RedisOptions } from "bullmq";

export const connection: RedisOptions = {
  url: process.env.UPSTASH_REDIS_URL,
};
