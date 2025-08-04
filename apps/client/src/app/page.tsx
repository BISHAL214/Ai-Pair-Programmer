"use client";

import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { extractGithubFiles, fetchGitHubBranches, fetchGitHubRepos } from "@/lib/github";
import { handleZipUpload } from "@/lib/upload-zip";

export default function Page() {
  const { user, loading, supabase, session } = useAuth();
  const githubToken = session?.provider_token ?? null;
  const isGitHubConnected = !!githubToken;

  const [selectedRepo, setSelectedRepo] = useState<any | null>(null);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [isTheChatStarted, setIsTheChatStarted] = useState(false);
  const [projectSourceType, setProjectSourceType] = useState<"github" | "zip" | "">("");
  const [zipUploadFormData, setZipUploadFormData] = useState<FormData | null>(null);

  // ✅ Safe query for GitHub repos
  const { data: repos = [] } = useQuery({
    queryKey: ["githubRepos"],
    queryFn: () => fetchGitHubRepos(githubToken!),
    enabled: !!githubToken,
    staleTime: 1000 * 60 * 5,
  });

  // ✅ Safe query for branches
  const { data: branches = [] } = useQuery({
    queryKey: ["githubBranches", selectedRepo?.full_name],
    queryFn: () =>
      fetchGitHubBranches(
        githubToken!,
        selectedRepo?.owner?.login,
        selectedRepo?.name,
      ),
    enabled: !!githubToken && !!selectedRepo,
    staleTime: 1000 * 60 * 5,
  });

  const { data: extractJob } = useQuery({
    queryKey: ["githubExtractJob", selectedRepo?.name, selectedBranches],
    queryFn: () => extractGithubFiles(selectedRepo?.clone_url, selectedRepo?.name, user?.id as string, selectedBranches, githubToken!),
    enabled: isTheChatStarted && projectSourceType === "github",
    staleTime: 1000 * 60 * 5,
  })

  const handleLogout = () => {
    supabase.auth.signOut();
  };

  const handleConnectGitHub = () => {
    supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "repo",
        redirectTo: window.location.origin,
      },
    });
  };

  const toggleBranch = (branch: string) => {
    setSelectedBranches((prev) =>
      prev.includes(branch)
        ? prev.filter((b) => b !== branch)
        : [...prev, branch],
    );
  };

  const handleChatStarted = async () => {
    if (selectedRepo && selectedBranches.length > 0) {
      setProjectSourceType("github");
    } else {
      setProjectSourceType("zip");
      await handleZipUpload(zipUploadFormData!);
      if (!zipUploadFormData) {
        alert("Please upload a zip file");
        return;
      }
      setZipUploadFormData(null);
    }
    setIsTheChatStarted(true);
  }

  const handleZipInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log(file)
    if (
      !file ||
      (file.type !== "application/zip" && file.type !== "application/x-zip-compressed")
    ) {
      alert("Please upload a zip file");
      return;
    }

    const formData = new FormData();
    formData.append("zip", file);
    formData.append("userId", user?.id!);
    formData.append("projectName", file.name.replace(".zip", ""));
    setZipUploadFormData(formData);
  }

  // console.log(githubToken)
  // console.log("Selected Repo:", selectedRepo);
  // console.log("Selected Branches:", selectedBranches);

  if (loading) return <p>Loading...</p>;
  console.log("extractJob:", extractJob);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="w-full px-6 py-4 bg-gray-100 flex justify-between items-center border-b">
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
      </nav>

      {/* Chat + Upload UI */}
      <main className="flex flex-1 justify-center items-center p-6 bg-gray-50">
        <Card className="w-full max-w-2xl p-4 shadow-lg border rounded-2xl">
          <CardContent className="flex flex-col gap-4">
            <Textarea
              placeholder="Type your message here..."
              className="h-32"
            />
            <div className="flex gap-4">
              <Button onClick={handleChatStarted}>Send</Button>
              <Input onChange={handleZipInputChange} type="file" accept=".zip" className="cursor-pointer" />
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
