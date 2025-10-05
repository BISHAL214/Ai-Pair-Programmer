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
import { produceEvent } from "./inngest/utils/inngestEventProducer";
import { containerManagerQueue } from "./queue";
import JsZip from "jszip";

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabase_service_role_key = process.env.SERVICE_ROLE_KEY!;

export const createSupabaseServerClient: SupabaseClient = createClient(
  supabase_url,
  supabase_service_role_key,
);

// --- Project detection helpers ---
function detectProjectType(file: string): string | null {
  const patterns: Record<string, RegExp[]> = {
    node: [/package\.json$/],
    python: [/(requirements\.txt|pyproject\.toml|setup\.py)$/],
    rust: [/Cargo\.toml$/],
    go: [/go\.mod$/],
    java: [/pom\.xml$/, /build\.gradle$/],
    cpp: [/CMakeLists\.txt$/, /\.cpp$/],
    php: [/composer\.json$/],
    ruby: [/Gemfile$/],
  };

  for (const [type, regexes] of Object.entries(patterns)) {
    if (regexes.some((re) => re.test(file))) return type;
  }
  return null;
}

function mapTypeToTools(type: string): string[] {
  switch (type) {
    case "node":
      return ["nodejs", "npm"];
    case "python":
      return ["python3", "pip"];
    case "rust":
      return ["rustc", "cargo"];
    case "go":
      return ["golang"];
    case "java":
      return ["openjdk-17"];
    case "cpp":
      return ["g++", "make"];
    case "php":
      return ["php"];
    case "ruby":
      return ["ruby", "bundler"];
    default:
      return [];
  }
}

export async function extractFilesFromGitAndUpload(
  repoUrl: string,
  repoName: string,
  userId: string,
  branches: string[],
  token: string,
  projectId: string,
): Promise<void> {
  const jobId = crypto.randomUUID();
  const baseDir = path.join(os.tmpdir(), `git-job-${jobId}`);
  const repoWithAuth = repoUrl.replace("https://", `https://${token}@`);

  try {
    const git = simpleGit();
    const zip = new JsZip();
    // clone the repo
    await git.clone(repoWithAuth, baseDir);
    let supaPath = "";
    const detectedTypes = new Set<string>();
    const detectedTools = new Set<string>();

    for (const branch of branches) {
      const branchGit = simpleGit(baseDir); // get the branch.
      await branchGit.checkout(branch); // Checkout each specified branch sequentially

      const files = await walkFiles(baseDir, baseDir);
      for (const relativePath of files) {
        const absPath = path.join(baseDir, relativePath);
        const content = await fs.readFile(absPath, "utf8");
        const extension = path.extname(relativePath).slice(1);
        supaPath = `projects/${projectId}/${branch}/${relativePath}`;
        zip.file(`${branch}/${relativePath}`, content);
        // Upload to Supabase Storage
        //   await createSupabaseServerClient.storage
        //     .from("projects")
        //     .upload(supaPath, content, {
        //       contentType: "text/plain",
        //       upsert: true,
        //     })
        //     .then(() => {
        //       console.log(`Uploaded ${supaPath} to Supabase Storage`);
        //     })
        //     .catch((error) => {
        //       console.error(`Failed to upload ${supaPath}:`, error);
        //     });

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
              error,
            );
          });

        const detected = detectProjectType(relativePath);
        if (detected) {
          detectedTypes.add(detected);
          const tools = mapTypeToTools(detected);
          tools.forEach((tool) => detectedTools.add(tool));
        }
      }
    }
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    const zipPath = `projects/${projectId}/${repoName}.zip`;
    await createSupabaseServerClient.storage
      .from("projects")
      .upload(zipPath, zipBuffer, {
        contentType: "application/zip",
        upsert: true,
      })
      .then(() => {
        console.log(`✅ Uploaded zip to ${zipPath}`);
      })
      .catch((error) => {
        console.error(`❌ Failed to upload zip ${zipPath}:`, error);
      });
    console.log(
      `Extraction and upload complete for project ${repoName} from github, branches: ${branches.join(", ")}`,
    );
    console.log("Detected types:", Array.from(detectedTypes));
    console.log("Detected tools:", Array.from(detectedTools));
    console.log("sending job to container manager queue");

    const containerJob = await containerManagerQueue.add(
      "setup-environment",
      {
        userId,
        projectId,
        template: Array.from(detectedTypes)[0], // Default template, can be enhanced to be dynamic based on detectedTypes
        cpu: 1,
        memoryMB: 512,
      },
      { attempts: 3, removeOnComplete: true },
    );

    console.log("sending event to inngest");
    produceEvent({
      name: "project_extracted",
      id: `${userId}:${projectId}:project_extracted`,
      data: {
        projectId,
        userId,
        supaPath,
        zipPath,
        branches, // include branches in the event data for later syncing the files from the correct branch
        types: Array.from(detectedTypes),
        tools: Array.from(detectedTools),
        monorepo: detectedTypes.size > 1,
        containerJobId: containerJob.id,
      },
    });
  } finally {
    await fs.rm(baseDir, { recursive: true, force: true });
  }
}

export async function extractFileFromUploadedZip(
  zipPath: string,
  userId: string,
  projectName: string,
  projectId: string,
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
      }),
    );

    const files = await walkFiles(tmpDir, tmpDir);
    let supaPath = "";

    for (const relativePath of files) {
      const absPath = path.join(tmpDir, relativePath);
      const content = await fs.readFile(absPath, "utf8");
      const extension = path.extname(relativePath).slice(1);
      supaPath = `projects/${projectName}/zip/${relativePath}`;

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

    console.log(
      `Extraction and upload complete for project ${projectName} from zip`,
    );
    console.log("sending event to inngest");

    produceEvent({
      name: "project_extracted",
      id: `${userId}:${projectId}:project_extracted`,
      data: {
        projectId,
        userId,
        supaPath,
      },
    });
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
    }),
  );
  return files.flat().filter(Boolean) as string[]; // filter out any empty entries
}
