import { Worker } from "bullmq";
import { extractFileFromUploadedZip, extractFilesFromGitAndUpload } from "../extractor";
import { connection } from "@ai_pair_programmer/redis";

console.log("👷 Worker started and waiting for jobs...");

const worker = new Worker(
  "extract-jobs",
  async (job) => {
    const {
      repoUrl,
      repoName,
      branches,
      token,
      userId,
      sourceType,
      zipPath,
      projectName,
    } = job.data;
    console.log(`Processing job ${job.id}...`);
    if (sourceType === "github") {
      console.log(
        `Extracting files from GitHub repo: ${repoName} (${repoUrl})`
      );
      await extractFilesFromGitAndUpload(
        repoUrl,
        repoName,
        userId,
        branches,
        token
      );
    } else if(sourceType === "zip") {
      console.log(`Extracting files from uploaded zip: ${projectName}`);
      await extractFileFromUploadedZip(zipPath, userId, projectName);
    }
    console.log(`Finished job ${job.id}`);
    return { status: "done" };
  },
  { connection }
);
worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});
