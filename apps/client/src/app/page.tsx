/**
 * @file This file defines the main page of the application.
 * It serves as the primary interface for users to select a project source (GitHub or zip upload),
 * initiate the project analysis, and view the results. It handles user authentication,
 * GitHub API interactions, and state management for the project setup process.
 * @requires @/__components-app/ai-chatInput
 * @requires @/__components-app/pixel-blast
 * @requires @/components/asternity/navbar
 * @requires @/lib/auth
 * @requires @/lib/github
 * @requires @/lib/upload-zip
 * @requires @/zustand/useProjectStore
 * @requires @tanstack/react-query
 * @requires next/navigation
 * @requires react
 */
"use client";

import { AnimatedAIChat } from "@/__components-app/ai-chatInput";
import PixelBlast from "@/__components-app/pixel-blast";
import { NavigationBar } from "@/components/asternity/navbar";
import { useAuth } from "@/lib/auth";
import {
  extractGithubFiles,
  fetchGitHubBranches,
  fetchGitHubRepos,
} from "@/lib/github";
import { handleZipUpload } from "@/lib/upload-zip";
import { INFO, useProjectStore } from "@/zustand/useProjectStore";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * The main page component of the application.
 * This component allows users to:
 * - Connect their GitHub account.
 * - Select a repository and branches for analysis.
 * - Upload a project as a zip file.
 * - Start the analysis process which triggers background jobs.
 * It uses `useAuth` for user authentication, `useQuery` for data fetching from GitHub,
 * and `useProjectStore` to manage the state of the project analysis.
 * @returns {JSX.Element} The rendered main page.
 */
export default function Page() {
  const router = useRouter();
  const { user, loading, supabase, session } = useAuth();
  const githubToken = session?.provider_token ?? null;
  const isGitHubConnected = !!githubToken;

  /**
   * State to hold the currently selected GitHub repository object.
   * @type {[any | null, React.Dispatch<React.SetStateAction<any | null>>]}
   */
  const [selectedRepo, setSelectedRepo] = useState<any | null>(null);
  /**
   * State to hold the array of selected branch names for the chosen repository.
   * @type {[string[], React.Dispatch<React.SetStateAction<string[]>>]}
   */
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  /**
   * State to track if the initial chat/analysis process has been started by the user.
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [isTheChatStarted, setIsTheChatStarted] = useState(false);
  /**
   * State to determine the source of the project, either 'github' or 'zip'.
   * @type {[ "github" | "zip" | "", React.Dispatch<React.SetStateAction<"github" | "zip" | "">>]}
   */
  const [projectSourceType, setProjectSourceType] = useState<
    "github" | "zip" | ""
  >("");
  /**
   * State to hold the form data for a zip file upload.
   * @type {[FormData | null, React.Dispatch<React.SetStateAction<FormData | null>>]}
   */
  const [zipUploadFormData, setZipUploadFormData] = useState<FormData | null>(
    null
  );

  const { setProjectUserId, setInfo, info, projectId } = useProjectStore();
  //   useProjectSocket();

  /**
   * Handles user logout by signing them out of Supabase.
   */
  const handleLogout = () => supabase.auth.signOut();

  /**
   * Fetches the list of the authenticated user's GitHub repositories.
   * The query is enabled only if a GitHub token is available.
   */
  const { data: repos = [] } = useQuery({
    queryKey: ["githubRepos"],
    queryFn: () => fetchGitHubRepos(githubToken!),
    enabled: !!githubToken,
    staleTime: 1000 * 60 * 5,
  });

  /**
   * Fetches the branches for the selected GitHub repository.
   * The query is enabled only if a GitHub token and a repository are selected.
   */
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

  /**
   * Triggers the GitHub repository extraction job on the server.
   * This query is only enabled when the chat is started and the project source is 'github'.
   */
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

  /**
   * Effect to update the project store with the extraction job details
   * once the job has been created on the server.
   */
  useEffect(() => {
    if (extractJob) {
      setProjectUserId(
        extractJob.userId as string,
        extractJob.projectId as string
      );
      setInfo("extraction", extractJob.jobInfo as INFO["extraction"]);
    }
  }, [extractJob, setProjectUserId, setInfo]);

  /**
   * Initiates the GitHub OAuth flow for connecting a user's account.
   */
  const handleConnectGitHub = () => {
    supabase.auth.signInWithOAuth({
      provider: "github",
      options: { scopes: "repo", redirectTo: window.location.origin },
    });
  };

  /**
   * Toggles the selection of a branch.
   * Adds the branch to the list if not present, otherwise removes it.
   * @param {string} branch - The name of the branch to toggle.
   */
  const toggleBranch = (branch: string) =>
    setSelectedBranches((prev) =>
      prev.includes(branch)
        ? prev.filter((b) => b !== branch)
        : [...prev, branch]
    );

  /**
   * Handles the start of the analysis process.
   * It determines the project source type (GitHub or zip) and triggers the
   * corresponding action.
   */
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

  /**
   * Handles the change event for the zip file input.
   * It validates the file type and sets the form data in the state.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
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

  // The main UI is rendered here. It includes the navigation bar,
  // the animated chat interface for project setup, and a background animation.
  return (
    <div className="min-h-screen relative flex flex-col">
      <NavigationBar user={user} handleLogout={handleLogout} />
      <AnimatedAIChat
        handleGithubConnect={handleConnectGitHub}
        githubToken={githubToken}
        branches={branches}
        repos={repos}
        selectRepo={setSelectedRepo}
        selectedRepo={selectedRepo}
      />
      <div className="w-full h-[100vh] absolute hidden dark:block">
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color="#B19EEF"
          patternScale={3}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.25}
          transparent
        />
      </div>
    </div>
  );
}
