require("dotenv-mono").load({ path: "../../.env" });
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.string().default("development"),
  REDIS_URL: z.string(),
  HOST_PROJECTS_ROOT: z.string().default("/srv/aipp/projects"),
  DOCKER_HOST: z.string().optional(), // leave empty to use /var/run/docker.sock
  DOCKER_SOCKET: z.string().default("/var/run/docker.sock"),
  DEFAULT_NETWORK: z.string().default("aipp_net"),
});

export const env = schema.parse(process.env);
