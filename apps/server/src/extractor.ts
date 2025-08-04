import * as dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import db, { schema } from "@ai_pair_programmer/db";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import * as crypto from "node:crypto";
import * as os from "node:os";
import * as path from "node:path";
import { simpleGit } from "simple-git";
import * as unzipper from "unzipper";

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabase_service_role_key = process.env.SERVICE_ROLE_KEY!;

export const createSupabaseServerClient: SupabaseClient = createClient(
  supabase_url,
  supabase_service_role_key
);

export async function extractFilesFromGitAndUpload(
  repoUrl: string,
  repoName: string,
  userId: string,
  branches: string[],
  token: string
): Promise<void> {
  const jobId = crypto.randomUUID();
  const baseDir = path.join(os.tmpdir(), `git-job-${jobId}`);
  const repoWithAuth = repoUrl.replace("https://", `https://${token}@`);

  try {
    const git = simpleGit();
    const newProject = await db
      .insert(schema.projects)
      .values({
        name: repoName,
        userId: userId,
        sourceType: "github",
        githubUrl: repoUrl,
      })
      .returning({ projectId: schema.projects.id });
    const projectId = newProject[0].projectId;

    await git.clone(repoWithAuth, baseDir);

    for (const branch of branches) {
      const branchGit = simpleGit(baseDir);
      // Checkout each specified branch sequentially.
      await branchGit.checkout(branch);

      const files = await walkFiles(baseDir, baseDir);
      for (const relativePath of files) {
        const absPath = path.join(baseDir, relativePath);
        const content = await fs.readFile(absPath, "utf8");
        const extension = path.extname(relativePath).slice(1);
        const supaPath = `projects/${projectId}/${branch}/${relativePath}`;

        // Upload to Supabase Storage
        await createSupabaseServerClient.storage
          .from("projects")
          .upload(supaPath, content, {
            contentType: "text/plain",
            upsert: true,
          })
          .then(() => {
            console.log(`Uploaded ${supaPath} to Supabase Storage`);
          })
          .catch((error) => {
            console.error(`Failed to upload ${supaPath}:`, error);
          });

        // Store in Supabase DB
        await db
          .insert(schema.files)
          .values({
            path: relativePath,
            content: content,
            projectId: projectId,
            branch: branch,
            language: extension,
          })
          .then(() => {
            console.log(`Stored file ${relativePath} in database`);
          })
          .catch((error) => {
            console.error(
              `Failed to store file ${relativePath} in database:`,
              error
            );
          });
      }
    }
  } finally {
    await fs.rm(baseDir, { recursive: true, force: true });
  }
}

export async function extractFileFromUploadedZip(
  zipPath: string,
  userId: string,
  projectName: string
) {
  const tmpDir = path.join(os.tmpdir(), `unzipped-${crypto.randomUUID()}`);

  await fs.mkdir(tmpDir, { recursive: true });

  try {
    // ✅ CORRECT: Use `await` instead of `.then()`
    const directory = await unzipper.Open.file(zipPath);

    await Promise.all(
      directory.files.map(async (file) => {
        const destPath = path.join(tmpDir, file.path);
        if (file.type === "Directory") {
          await fs.mkdir(destPath, { recursive: true });
        } else {
          await fs.mkdir(path.dirname(destPath), { recursive: true });
          const writeStream = await fs.open(destPath, "w");
          const contentStream = file.stream();
          for await (const chunk of contentStream) {
            await writeStream.write(chunk);
          }
          await writeStream.close();
        }
      })
    );

    const newProject = await db
      .insert(schema.projects)
      .values({
        name: projectName,
        userId,
        sourceType: "zip",
      })
      .returning({ projectId: schema.projects.id });

    const projectId = newProject[0].projectId;

    const files = await walkFiles(tmpDir, tmpDir);

    for (const relativePath of files) {
      const absPath = path.join(tmpDir, relativePath);
      const content = await fs.readFile(absPath, "utf8");
      const extension = path.extname(relativePath).slice(1);
      const supaPath = `projects/${projectName}/zip/${relativePath}`;

      // Upload to Supabase Storage
      try {
        await createSupabaseServerClient.storage
          .from("projects")
          .upload(supaPath, content, {
            contentType: "text/plain",
            upsert: true,
          });
        console.log(`✅ Uploaded to ${supaPath}`);
      } catch (error) {
        console.error(`❌ Failed to upload ${supaPath}:`, error);
      }

      // Store in Supabase DB
      try {
        await db.insert(schema.files).values({
          path: relativePath,
          content,
          projectId,
          language: extension,
        });
        console.log(`✅ Stored ${relativePath} in DB`);
      } catch (error) {
        console.error(`❌ Failed to insert ${relativePath} into DB:`, error);
      }
    }
  } catch (error) {
    console.error("❌ Error extracting files from zip:", error);
    throw error;
  } finally {
    await fs.rm(zipPath, { force: true });
    await fs.rm(tmpDir, { recursive: true, force: true });
    console.log(`🧼 Cleaned up temporary files from ${tmpDir}`);
  }
}

async function walkFiles(dir: string, baseDir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const res = path.resolve(dir, entry.name);
      // Exclude the .git directory
      if (entry.isDirectory() && entry.name !== ".git") {
        return walkFiles(res, baseDir);
      } else if (entry.isFile()) {
        return path.relative(baseDir, res);
      }
      return []; // Return an empty array for the .git folder or any other non-file entry
    })
  );
  return files.flat().filter(Boolean) as string[]; // filter out any empty entries
}
