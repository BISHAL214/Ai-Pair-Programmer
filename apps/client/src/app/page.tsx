"use client";

import { AnimatedAIChat } from "@/__components-app/ai-chatInput";
import PixelBlast from "@/__components-app/pixel-blast";
import { TextShimmer } from "@/__components-app/text-shimmer";
import { NavigationBar } from "@/components/asternity/navbar";
import { useAuth } from "@/hooks/use-auth";
// import { useAuth } from "@/lib/auth";
import {
  extractGithubFiles,
  fetchGitHubBranches,
  fetchGitHubRepos,
} from "@/lib/github";
import { handleZipUpload } from "@/lib/upload-zip";
import { supabase } from "@/lib/utils";
import { authMutaions } from "@/tanstack/mutations/auth.mutations";
import { INFO, useProjectStore } from "@/zustand/useProjectStore";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();
  const { user, isLoading, session, isAuthenticated } = useAuth(supabase);
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
  //   useProjectSocket();

  console.log(user);

  const {
    mutate: logout,
    //  isPending: isLogoutLoading,
    //  error: logoutError,
  } = authMutaions.authLogoutMutation({ router });
  const handleLogout = () => {
    logout();
  };

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

  // ✅ Main UI
  return (
    <div className="min-h-screen relative flex flex-col">
      {/* {isLoading && (
        <div className="min-h-screen w-full flex justify-center items-center inset-0 bg-white/10 backdrop-blur-xs z-10">
          <TextShimmer className="font-mono text-sm" duration={1}>
            Authenticating...
          </TextShimmer>
        </div>
      )} */}
      <NavigationBar handleLogout={handleLogout} />
      <AnimatedAIChat
        handleGithubConnect={handleConnectGitHub}
        githubToken={githubToken}
        branches={branches}
        repos={repos}
        selectRepo={setSelectedRepo}
        selectedRepo={selectedRepo}
      />
      {/* <div className="w-full h-[100vh] absolute hidden dark:block">
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
      </div> */}
    </div>
  );
}

{
  /* Chat + Upload */
}
{
  /* <main className="flex flex-1 justify-center items-center p-6 bg-gray-800"> */
}
{
  /*   <Card className="w-full max-w-2xl p-4 shadow-lg border rounded-2xl z-10"> */
}
{
  /*     <CardContent className="flex flex-col gap-4"> */
}
{
  /*       <Textarea */
}
{
  /*         placeholder="Type your message here..." */
}
{
  /*         className="h-32" */
}
{
  /*       /> */
}
{
  /*       <div className="flex gap-4"> */
}
{
  /*         <Button onClick={handleChatStarted}>Send</Button> */
}
{
  /*         <Input */
}
{
  /*           onChange={handleZipInputChange} */
}
{
  /*           type="file" */
}
{
  /*           accept=".zip" */
}
{
  /*           className="cursor-pointer" */
}
{
  /*         /> */
}
{
  /*       </div> */
}
{
  /**/
}
{
  /*       {!isGitHubConnected ? ( */
}
{
  /*         <Button onClick={handleConnectGitHub}>Connect GitHub</Button> */
}
{
  /*       ) : ( */
}
{
  /*         <> */
}
{
  /*           <Label className="mt-4">Select GitHub Repo</Label> */
}
{
  /*           <select */
}
{
  /*             onChange={(e) => setSelectedRepo(JSON.parse(e.target.value))} */
}
{
  /*             className="border p-2 rounded" */
}
{
  /*             value={selectedRepo ? JSON.stringify(selectedRepo) : ""} */
}
{
  /*           > */
}
{
  /*             <option value="">Select a repo...</option> */
}
{
  /*             {repos.map((repo: any) => ( */
}
{
  /*               <option */
}
{
  /*                 className="bg-gray-700" */
}
{
  /*                 key={repo.id} */
}
{
  /*                 value={JSON.stringify(repo)} */
}
{
  /*               > */
}
{
  /*                 {repo.name} */
}
{
  /*               </option> */
}
{
  /*             ))} */
}
{
  /*           </select> */
}
{
  /**/
}
{
  /*           {branches.length > 0 && ( */
}
{
  /*             <> */
}
{
  /*               <Label className="mt-4">Select Branches</Label> */
}
{
  /*               <div className="flex flex-col gap-1"> */
}
{
  /*                 {branches.map((branch: any) => ( */
}
{
  /*                   <label */
}
{
  /*                     key={branch.name} */
}
{
  /*                     className="flex items-center gap-2" */
}
{
  /*                   > */
}
{
  /*                     <Checkbox */
}
{
  /*                       checked={selectedBranches.includes(branch.name)} */
}
{
  /*                       onCheckedChange={() => toggleBranch(branch.name)} */
}
{
  /*                     /> */
}
{
  /*                     {branch.name} */
}
{
  /*                   </label> */
}
{
  /*                 ))} */
}
{
  /*               </div> */
}
{
  /*             </> */
}
{
  /*           )} */
}
{
  /*         </> */
}
{
  /*       )} */
}
{
  /*     </CardContent> */
}
{
  /*   </Card> */
}
{
  /*   {isTheChatStarted && ( */
}
{
  /*     <MultiStageLoaderComplete setIsTheChatStarted={setIsTheChatStarted} /> */
}
{
  /*   )} */
}
{
  /* </main> */
}
