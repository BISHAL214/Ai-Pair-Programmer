require("dotenv-mono").load({ path: "../../.env" });
import { Hono } from "hono";
import { extractQueue } from "./queue";
import { cors } from "hono/cors";
import { readableStreamToArrayBuffer } from "bun";
import * as path from "node:path";
import * as os from "node:os";
import { promises as fs } from "node:fs";

const app = new Hono();
app.use(
  "*",
  cors({
    origin: "*", // Allow all origins
    allowMethods: ["GET", "POST"], // Allow specific methods
    allowHeaders: ["Content-Type", "Authorization"], // Allow specific headers
  })
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/api/github-extract", async (c) => {
  const body = await c.req.json();
  console.log("Received body:", body);
  const { repoUrl, branches, token, repoName, userId } = body;
  const sourceType = "github";

  const job = await extractQueue.add("extract", {
    repoUrl,
    branches,
    token,
    repoName,
    userId,
    sourceType,
  });

  return c.json({ jobId: job.id });
});

app.post("/api/upload-zip", async (c) => {
  const formdata = await c.req.formData();
  console.log("from server", formdata);
  const zipFile = formdata.get("zip") as File;
  const userId = formdata.get("userId") as string;
  const projectName = formdata.get("projectName") as string;
  const sourceType = "zip";

  if (!zipFile || !userId || !projectName) {
    return c.json({ error: "Missing fields" }, 400);
  }

  const jobId = crypto.randomUUID();
  const zipBuffer = await readableStreamToArrayBuffer(zipFile.stream());
  const zipPath = path.join(os.tmpdir(), `upload-${jobId}.zip`);
  await fs.writeFile(zipPath, Buffer.from(zipBuffer));

  const job = await extractQueue.add("extract-zip", {
    zipPath,
    userId,
    projectName,
    sourceType,
  });

  return c.json({ jobId: job.id });
});

export default app;
