"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProjectSocket } from "@/hooks/use-projectSocket";
import { useAuth } from "@/lib/auth";
import {
  extractGithubFiles,
  fetchGitHubBranches,
  fetchGitHubRepos,
} from "@/lib/github";
import { handleZipUpload } from "@/lib/upload-zip";
import { INFO, useProjectStore } from "@/zustand/useProjectStore";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavigationBar } from "@/components/asternity/navbar";

export default function Page() {
  const router = useRouter();
  const { user, loading, supabase, session } = useAuth();
  const githubToken = session?.provider_token ?? null;
  const isGitHubConnected = !!githubToken;

  const [selectedRepo, setSelectedRepo] = useState<any | null>(null);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [isTheChatStarted, setIsTheChatStarted] = useState(false);
  const [projectSourceType, setProjectSourceType] = useState<
    "github" | "zip" | ""
  >("");
  const [zipUploadFormData, setZipUploadFormData] = useState<FormData | null>(
    null
  );

  const { setProjectUserId, setInfo, info, projectId } = useProjectStore();
  useProjectSocket();

  const handleLogout = () => supabase.auth.signOut();

  // ✅ GitHub repos
  const { data: repos = [] } = useQuery({
    queryKey: ["githubRepos"],
    queryFn: () => fetchGitHubRepos(githubToken!),
    enabled: !!githubToken,
    staleTime: 1000 * 60 * 5,
  });

  // ✅ GitHub branches
  const { data: branches = [] } = useQuery({
    queryKey: ["githubBranches", selectedRepo?.full_name],
    queryFn: () =>
      fetchGitHubBranches(
        githubToken!,
        selectedRepo?.owner?.login,
        selectedRepo?.name
      ),
    enabled: !!githubToken && !!selectedRepo,
    staleTime: 1000 * 60 * 5,
  });

  // ✅ Extraction job
  const { data: extractJob } = useQuery<{
    jobInfo: INFO["extraction"] | null;
    projectId: string | null;
    userId: string | null;
  }>({
    queryKey: ["githubExtractJob", selectedRepo?.name, selectedBranches],
    queryFn: () =>
      extractGithubFiles(
        selectedRepo?.clone_url,
        selectedRepo?.name,
        user?.id as string,
        selectedBranches,
        githubToken!
      ),
    enabled: isTheChatStarted && projectSourceType === "github",
    staleTime: 1000 * 60 * 5,
  });

  // ✅ Update store when job starts
  useEffect(() => {
    if (extractJob) {
      setProjectUserId(
        extractJob.userId as string,
        extractJob.projectId as string
      );
      setInfo("extraction", extractJob.jobInfo as INFO["extraction"]);
    }
  }, [extractJob, setProjectUserId, setInfo]);

  // ✅ Define stages
  const stages = useMemo(
    () => [
      {
        key: "extraction",
        title: "Extracting Project",
        subtitle: "Analyzing repository & preparing files...",
      },
      {
        key: "container",
        title: "Creating Environment",
        subtitle: "Spinning up Docker container...",
      },
      {
        key: "fileSync",
        title: "Syncing Files",
        subtitle: "Finalizing project workspace...",
      },
    ],
    []
  );

  // ✅ Determine current stage
  const currentStage = useMemo(() => {
    if (!info.extraction) return null;

    if (info.fileSync?.status === "completed") return "done";
    if (info.fileSync) return "fileSync";
    if (info.container) return "container";
    return "extraction";
  }, [info.extraction, info.container, info.fileSync]);

  // ✅ Redirect after completion
  useEffect(() => {
    if (currentStage === "done") {
      const timer = setTimeout(() => {
        setIsTheChatStarted(false);
        router.push(`/workspace/${projectId}`);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentStage, router, projectId]);

  const handleConnectGitHub = () => {
    supabase.auth.signInWithOAuth({
      provider: "github",
      options: { scopes: "repo", redirectTo: window.location.origin },
    });
  };

  const toggleBranch = (branch: string) =>
    setSelectedBranches((prev) =>
      prev.includes(branch)
        ? prev.filter((b) => b !== branch)
        : [...prev, branch]
    );

  const handleChatStarted = async () => {
    if (selectedRepo && selectedBranches.length > 0) {
      setProjectSourceType("github");
    } else {
      if (!zipUploadFormData) {
        alert("Please upload a zip file");
        return;
      }
      setProjectSourceType("zip");
      await handleZipUpload(zipUploadFormData);
      setZipUploadFormData(null);
    }
    setIsTheChatStarted(true);
  };

  const handleZipInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (
      !file ||
      (file.type !== "application/zip" &&
        file.type !== "application/x-zip-compressed")
    ) {
      alert("Please upload a valid zip file");
      return;
    }
    const formData = new FormData();
    formData.append("zip", file);
    formData.append("userId", user?.id!);
    formData.append("projectName", file.name.replace(".zip", ""));
    setZipUploadFormData(formData);
  };

  if (loading) return <p>Loading...</p>;

  // ✅ Animated stages screen
  if (isTheChatStarted) {
    if (currentStage === null) {
      return (
        <StageScreen title="Starting..." subtitle="Preparing project..." />
      );
    }
    if (currentStage === "done") {
      return (
        <StageScreen
          title="Workspace Ready"
          subtitle="Redirecting to editor..."
          success
        />
      );
    }

    const stage = stages.find((s) => s.key === currentStage);
    return <StageScreen title={stage?.title!} subtitle={stage?.subtitle!} />;
  }

  // ✅ Main UI
  return (
    <div className="min-h-[400vh] relative flex flex-col">
      <NavigationBar user={user} handleLogout={handleLogout} />

      {/* Chat + Upload */}
      <main className="flex flex-1 justify-center items-center p-6 bg-gray-800">
        <Card className="w-full max-w-2xl p-4 shadow-lg border rounded-2xl">
          <CardContent className="flex flex-col gap-4">
            <Textarea
              placeholder="Type your message here..."
              className="h-32"
            />
            <div className="flex gap-4">
              <Button onClick={handleChatStarted}>Send</Button>
              <Input
                onChange={handleZipInputChange}
                type="file"
                accept=".zip"
                className="cursor-pointer"
              />
            </div>

            {!isGitHubConnected ? (
              <Button onClick={handleConnectGitHub}>Connect GitHub</Button>
            ) : (
              <>
                <Label className="mt-4">Select GitHub Repo</Label>
                <select
                  onChange={(e) => setSelectedRepo(JSON.parse(e.target.value))}
                  className="border p-2 rounded"
                  value={selectedRepo ? JSON.stringify(selectedRepo) : ""}
                >
                  <option value="">Select a repo...</option>
                  {repos.map((repo: any) => (
                    <option key={repo.id} value={JSON.stringify(repo)}>
                      {repo.name}
                    </option>
                  ))}
                </select>

                {branches.length > 0 && (
                  <>
                    <Label className="mt-4">Select Branches</Label>
                    <div className="flex flex-col gap-1">
                      {branches.map((branch: any) => (
                        <label
                          key={branch.name}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            checked={selectedBranches.includes(branch.name)}
                            onCheckedChange={() => toggleBranch(branch.name)}
                          />
                          {branch.name}
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

/* ✅ Animated Stage Screen Component */
function StageScreen({
  title,
  subtitle,
  success = false,
}: {
  title: string;
  subtitle: string;
  success?: boolean;
}) {
  return (
    <div className="h-screen flex justify-center items-center bg-gray-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.h2
            className={`text-2xl font-bold ${
              success ? "text-green-600" : "text-gray-800"
            }`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: success ? 0 : Infinity, duration: 2 }}
          >
            {title}
          </motion.h2>
          <p className="mt-2 text-gray-500">{subtitle}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

{
  /* Navbar */
}
{
  /* <nav className="w-full px-6 py-4 bg-gray-700 flex justify-between items-center border-b">
        <h1 className="text-xl font-bold">My AI App</h1>
        <div className="flex gap-4 items-center">
          {!user ? (
            <Button>
              <Link href="/auth">Login</Link>
            </Button>
          ) : (
            <>
              <span className="text-sm">Welcome, {user.email}</span>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </div>
      </nav> */
}
