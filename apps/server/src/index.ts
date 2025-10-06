import { db, Schema } from "@repo/db";
import { inngest } from "@repo/inngest";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "inngest/hono";
import { promises as fs } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { startFileSync } from "./inngest/functions/startFileSync";
import { waitForContainer } from "./inngest/functions/waitForContainer";
import { extractQueue } from "./queue";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "http://localhost:3000", // Allow specific origin
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
    .insert(Schema.projects)
    .values({
      name: repoName,
      userId: userId,
      sourceType: sourceType,
      githubUrl: repoUrl,
    })
    .returning({ projectId: Schema.projects.id });
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

// Helper function to convert a ReadableStream to a Buffer, replacing Bun's implementation
async function readableStreamToBuffer(
  stream: ReadableStream<Uint8Array>
): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (value) {
      chunks.push(value);
    }
  }
  return Buffer.concat(chunks);
}

app.post("/api/upload-zip", async (c) => {
  const formdata = await c.req.formData();
  console.log("from server", formdata);
  const zipFile = formdata.get("zip") as File;
  const userId = formdata.get("userId") as string;
  const projectName = formdata.get("projectName") as string;
  const sourceType = "zip";

  const newProject = await db
    .insert(Schema.projects)
    .values({
      name: projectName,
      userId: userId,
      sourceType: sourceType,
    })
    .returning({ projectId: Schema.projects.id });
  const projectId = newProject[0].projectId;

  if (!zipFile || !userId || !projectName) {
    return c.json({ error: "Missing fields" }, 400);
  }

  const jobId = crypto.randomUUID();
  const zipBuffer = await readableStreamToBuffer(zipFile.stream());
  const zipPath = path.join(os.tmpdir(), `upload-${jobId}.zip`);
  await fs.writeFile(zipPath, zipBuffer);

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

// A basic OpenAPI document
// const openApiDoc = {
//   openapi: "3.0.0", // This is the required version field
//   info: {
//     title: "API Documentation For Ai Powered Pair Programmer",
//     version: "1.0.0",
//     description: "This is the API documentation for the Ai Powered Pair Programmer server.",
//   },
//   paths: {
//     // Add your API paths here
//     "/health": {
//       get: {
//         summary: "Health check",
//         responses: {
//           "200": {
//             description: "OK",
//           },
//         },
//       },
//     },
//     // Add more endpoints as needed
//     "/api/github-extract": {
//       post: {
//         summary: "Extract GitHub repository",
//         requestBody: {
//           required: true,
//           content: {
//             "application/json": {
//               schema: {
//                 type: "object",
//                 properties: {
//                   repoUrl: { type: "string" },
//                   branches: { type: "array", items: { type: "string" } },
//                   token: { type: "string" },
//                   repoName: { type: "string" },
//                   userId: { type: "string" },
//                 },
//                 required: [
//                   "repoUrl",
//                   "branches",
//                   "token",
//                   "repoName",
//                   "userId",
//                 ],
//               },
//             },
//           },
//         },
//         responses: {
//           "200": {
//             description: "Job created successfully",
//             content: {
//               "application/json": {
//                 schema: {
//                   type: "object",
//                   properties: {
//                     jobInfo: {
//                       type: "object",
//                       properties: {
//                         status: { type: "string" },
//                         jobId: { type: "string" },
//                       },
//                     },
//                     projectId: { type: "string" },
//                     userId: { type: "string" },
//                   },
//                 },
//               },
//             },
//           },
//           "400": {
//             description: "Bad Request",
//           },
//         },
//       },
//     },
//   },
// };

// // Serve the OpenAPI document
// app.get("/doc", (c) => c.json(openApiDoc));

// app.get("/health", (c) => c.json({ description: "ok" }));

// // Use the middleware to serve Swagger UI at /ui
// app.get("/ui", swaggerUI({ url: "/doc" }));

// app.get("/health", (c) => c.text("OK"));

export default app;
