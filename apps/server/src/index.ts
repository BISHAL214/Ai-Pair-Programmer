/**
 * @file Main entry point for the Hono server application.
 * This file sets up the server, defines API routes, and configures middleware.
 * @requires dotenv-mono
 * @requires hono
 * @requires ./queue
 * @requires hono/cors
 * @requires bun
 * @requires node:path
 * @requires node:os
 * @requires node:fs
 * @requires @ai_pair_programmer/db
 * @requires inngest/hono
 * @requires @ai_pair_programmer/inngest
 * @requires ./inngest/functions/waitForContainer
 * @requires ./inngest/functions/startFileSync
 */
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
import { waitForContainer } from "./inngest/functions/waitForContainer";
import { startFileSync } from "./inngest/functions/startFileSync";
import { swaggerUI, SwaggerUI } from "@hono/swagger-ui";

/**
 * The main Hono application instance.
 * @type {Hono}
 */
const app = new Hono();

/**
 * Middleware to handle Cross-Origin Resource Sharing (CORS).
 * @param {string} "*" - The path to apply the middleware to.
 * @param {object} options - CORS options.
 * @param {string} options.origin - The allowed origin.
 * @param {string[]} options.allowMethods - The allowed HTTP methods.
 * @param {string[]} options.allowHeaders - The allowed HTTP headers.
 */
app.use(
  "*",
  cors({
    origin: "http://localhost:3000", // Allow specific origin
    allowMethods: ["GET", "POST"], // Allow specific methods
    allowHeaders: ["Content-Type", "Authorization"], // Allow specific headers
  })
);

/**
 * Route for the root path.
 * @param {string} "/" - The path.
 * @param {function} handler - The route handler.
 * @returns {Response} A text response.
 */
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

/**
 * Inngest route for handling background jobs.
 * @param {string[]} methods - The allowed HTTP methods.
 * @param {string} path - The path for the Inngest API.
 * @param {function} handler - The Inngest serve function.
 */
app.on(
  ["GET", "PUT", "POST"],
  "/api/inngest",
  serve({ client: inngest, functions: [waitForContainer, startFileSync] })
);

/**
 * Endpoint to extract a GitHub repository.
 * It receives repository information, creates a new project in the database,
 * and adds a job to the extraction queue.
 * @param {string} "/api/github-extract" - The path.
 * @param {function} handler - The async route handler.
 * @returns {Response} A JSON response with job information, project ID, and user ID.
 */
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

/**
 * Endpoint to upload and extract a zip file.
 * It receives a zip file, user ID, and project name, creates a new project,
 * saves the zip file to a temporary location, and adds a job to the extraction queue.
 * @param {string} "/api/upload-zip" - The path.
 * @param {function} handler - The async route handler.
 * @returns {Response} A JSON response with the job ID or an error message.
 */
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
