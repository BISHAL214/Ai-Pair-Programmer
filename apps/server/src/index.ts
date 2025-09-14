require("dotenv-mono").load({ path: "../../.env" });
import { Hono } from "hono";
import { extractQueue } from "./queue";
import { cors } from "hono/cors";
import { readableStreamToArrayBuffer } from "bun";
import * as path from "node:path";
import * as os from "node:os";
import { promises as fs } from "node:fs";
import db, { schema } from "@ai_pair_programmer/db";
import { serve } from "inngest/hono";
import { inngest } from "@ai_pair_programmer/inngest";
import { waitForContainer } from "./inngest/functions/waitForCOntainer";
import { startFileSync } from "./inngest/functions/startFileSync";

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

// inngest route
app.on(
  ["GET", "PUT", "POST"],
  "/api/inngest",
  serve({ client: inngest, functions: [waitForContainer, startFileSync] })
);

app.post("/api/github-extract", async (c) => {
  const body = await c.req.json();
  console.log("Received body:", body);
  const { repoUrl, branches, token, repoName, userId } = body;
  const sourceType = "github";

  const newProject = await db
    .insert(schema.projects)
    .values({
      name: repoName,
      userId: userId,
      sourceType: sourceType,
      githubUrl: repoUrl,
    })
    .returning({ projectId: schema.projects.id });
  const projectId = newProject[0].projectId;

  const job = await extractQueue.add(
    "extract",
    {
      repoUrl,
      branches,
      token,
      repoName,
      userId,
      sourceType,
      projectId,
    },
    { attempts: 3, removeOnComplete: true }
  );

  return c.json({
    jobInfo: { status: "pending", jobId: job.id },
    projectId,
    userId,
  });
});

app.post("/api/upload-zip", async (c) => {
  const formdata = await c.req.formData();
  console.log("from server", formdata);
  const zipFile = formdata.get("zip") as File;
  const userId = formdata.get("userId") as string;
  const projectName = formdata.get("projectName") as string;
  const sourceType = "zip";

  const newProject = await db
    .insert(schema.projects)
    .values({
      name: projectName,
      userId: userId,
      sourceType: sourceType,
    })
    .returning({ projectId: schema.projects.id });
  const projectId = newProject[0].projectId;

  if (!zipFile || !userId || !projectName) {
    return c.json({ error: "Missing fields" }, 400);
  }

  const jobId = crypto.randomUUID();
  const zipBuffer = await readableStreamToArrayBuffer(zipFile.stream());
  const zipPath = path.join(os.tmpdir(), `upload-${jobId}.zip`);
  await fs.writeFile(zipPath, Buffer.from(zipBuffer));

  const job = await extractQueue.add(
    "extract-zip",
    {
      zipPath,
      userId,
      projectName,
      sourceType,
      projectId,
    },
    { attempts: 3, removeOnComplete: true }
  );

  return c.json({ jobId: job.id });
});

export default app;
