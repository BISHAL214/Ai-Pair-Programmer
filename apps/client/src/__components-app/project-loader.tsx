"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  Trophy,
  Star,
} from "lucide-react";
import { useProjectStore } from "@/zustand/useProjectStore";

// Assume the `info` object from your store has this shape for each stage
interface StageInfo {
  status: "pending" | "completed" | "error";
  message?: string;
}

interface Stage {
  key: string;
  title: string;
  subtitle: string;
}

interface MultiStageLoaderProps {
  setIsTheChatStarted: (value: boolean) => void;
  onError?: (error: string) => void;
}

export function MultiStageLoaderComplete({
  setIsTheChatStarted,
  onError,
}: MultiStageLoaderProps) {
  const router = useRouter();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // The project info from your Zustand store is the single source of truth.
  const { info, projectId } = useProjectStore();

  // Define the stages of the loading process.
  const stages = useMemo<Stage[]>(
    () => [
      {
        key: "extraction",
        title: "Extracting Project",
        subtitle: "Analyzing repository & preparing files...",
      },
      {
        key: "container",
        title: "Creating Environment",
        subtitle: "Spinning up a secure container...",
      },
      {
        key: "fileSync",
        title: "Syncing Files",
        subtitle: "Finalizing project workspace...",
      },
      {
        key: "done",
        title: "All Set!",
        subtitle: "Redirecting to your workspace...",
      },
    ],
    []
  );

  // **FIX 1: Derive the current stage object directly from the store's `info` state.**
  // This avoids null pointer exceptions by always returning a valid stage object.
  // It defaults to the first stage if no info is available yet.
  const currentStage = useMemo(() => {
    if (info.fileSync?.status === "completed") return stages[3]; // "done"
    if (info.fileSync) return stages[2]; // "fileSync"
    if (info.container) return stages[1]; // "container"
    if (info.extraction) return stages[0]; // "extraction"
    return stages[0]; // Default to the first stage on initial load
  }, [info, stages]);

  // **FIX 2: Derive the stage index and completed stages from the `currentStage`.**
  // This eliminates the need for separate `useState` and manual updates,
  // making the component's state consistent and predictable.
  const stageIndex = useMemo(
    () => stages.findIndex((s) => s.key === currentStage.key),
    [currentStage, stages]
  );

  const completedStages = useMemo(() => {
    // A stage is considered complete if its instageInfodex is less than the current one.
    return new Set(Array.from({ length: stageIndex }, (_, i) => i));
  }, [stageIndex]);

  // **FIX 3: Removed the conflicting timer-based `useEffect` hook.**
  // The component is now 100% reactive to the `info` object from the store,
  // which is the correct pattern. The simulation logic has been removed.

  // This effect watches for errors in the incoming `info` object.
  useEffect(() => {
    const stageKeys = ["extraction", "container", "fileSync"] as const;
    let errorFound = false;
    for (const key of stageKeys) {
      const stageInfo = info[key as keyof typeof info] as StageInfo | undefined;
      if (stageInfo?.status === "error") {
        setHasError(true);
        const defaultMessage = `An error occurred during the '${key}' stage.`;
        setErrorMessage(stageInfo.message || defaultMessage);
        onError?.(stageInfo.message || defaultMessage);
        errorFound = true;
        break;
      }
    }
    // Automatically clear the error if the store state no longer shows an error.
    if (!errorFound && hasError) {
      setHasError(false);
      setErrorMessage("");
    }
  }, [info, onError, hasError]);

  // This effect handles the final success notification and redirection.
  useEffect(() => {
    const isDone = info.fileSync?.status === "completed";

    if (isDone && !hasError && !showSuccessNotification) {
      setShowSuccessNotification(true);

      const timer = setTimeout(() => {
        if (projectId) {
          // Navigate to the new page. This action will cause the loader
          // component to unmount automatically.
          console.log("Navigating to workspace with projectId:", projectId);
          router.push(`/workspace/${projectId}`);
        } else {
          console.error("Redirect failed: Project ID is missing.");
        }
      }, 2000);

      // Cleanup function to clear the timer if the component unmounts prematurely
      return () => clearTimeout(timer);
    }
  }, [info?.fileSync, projectId, hasError, showSuccessNotification]); // Dependency array is now cleaner

  const retry = () => {
    setHasError(false);
    setErrorMessage("");
    // IMPORTANT: To properly retry, you should call a function from your
    // Zustand store to reset the state and restart the process.
    // e.g., `useProjectStore.getState().retryProcess(projectId);`
  };

  console.log("Current Store Info:", JSON.stringify(info, null, 2));
  console.log("Current Stage Key:", currentStage.key);
  console.log("Project ID for redirect:", projectId);

  const getStageIcon = () => {
    if (hasError) {
      return <XCircle className="w-12 h-12 text-destructive" />;
    }
    if (currentStage.key === "done") {
      return <CheckCircle className="w-12 h-12 text-green-600" />;
    }
    return <Loader2 className="w-12 h-12 text-primary animate-spin" />;
  };

  return (
    <div className="fixed inset-0 w-full flex justify-center items-center z-50 bg-background/90 backdrop-blur-xl">
      <div className="w-full max-w-md mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center items-center space-x-4 mb-8"
        >
          {stages.slice(0, -1).map((stage, index) => (
            <div key={stage.key} className="flex items-center">
              <motion.div
                className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  completedStages.has(index)
                    ? "bg-green-100 dark:bg-green-950 border-green-500"
                    : index === stageIndex
                      ? "bg-primary/10 border-primary"
                      : "bg-muted border-muted-foreground/30"
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {completedStages.has(index) ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </motion.div>
                ) : index === stageIndex ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    <Loader2 className="w-4 h-4 text-primary" />
                  </motion.div>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                )}
              </motion.div>

              {index < stages.length - 2 && (
                <motion.div
                  className={`w-8 h-0.5 mx-2 ${
                    completedStages.has(index)
                      ? "bg-green-500"
                      : "bg-muted-foreground/30"
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{
                    scaleX: completedStages.has(index) ? 1 : 0,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "easeInOut",
                  }}
                />
              )}
            </div>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={hasError ? "error" : currentStage.key}
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -30 }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 100,
            }}
            className="text-center space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.2,
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                className="flex justify-center"
              >
                <div
                  className={`relative w-24 h-24 rounded-full flex items-center justify-center ${
                    hasError
                      ? "bg-destructive/10 border-2 border-destructive/30"
                      : currentStage.key === "done"
                        ? "bg-green-100 dark:bg-green-950 border-2 border-green-300 dark:border-green-700"
                        : "bg-primary/10 border-2 border-primary/30"
                  }`}
                >
                  {getStageIcon()}

                  {!hasError && currentStage.key !== "done" && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary/20"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    />
                  )}

                  {currentStage.key === "done" && !hasError && (
                    <>
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute"
                          style={{
                            top: "50%",
                            left: "50%",
                            transform: `rotate(${i * 60}deg) translateY(-40px)`,
                          }}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            delay: 0.5 + i * 0.1,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatDelay: 2,
                          }}
                        >
                          <Sparkles className="w-3 h-3 text-yellow-500" />
                        </motion.div>
                      ))}
                    </>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="space-y-4"
              >
                <h1
                  className={`text-3xl font-bold ${
                    hasError
                      ? "text-destructive"
                      : currentStage.key === "done"
                        ? "text-green-600"
                        : "text-foreground"
                  }`}
                >
                  {hasError ? "Something went wrong" : currentStage.title}
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto">
                  {hasError ? errorMessage : currentStage.subtitle}
                </p>
              </motion.div>
            </div>

            {!hasError && currentStage.key !== "done" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <div className="flex justify-center items-center space-x-2 text-sm text-muted-foreground">
                  <span className="font-medium">
                    Step {stageIndex + 1} of {stages.length}
                  </span>
                </div>
                <div className="relative w-full max-w-xs mx-auto h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-primary/80"
                    initial={{ width: "0%" }}
                    animate={{
                      width: `${(stageIndex / (stages.length - 1)) * 100}%`,
                    }}
                    transition={{
                      duration: 0.8,
                      ease: "easeOut",
                    }}
                  />
                </div>
              </motion.div>
            )}

            {hasError && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 justify-center mt-4"
              >
                <motion.button
                  onClick={retry}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Try Again
                </motion.button>
                <motion.button
                  onClick={() => router.push("/")}
                  className="px-6 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-all duration-200 font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </motion.div>
            )}

            {currentStage.key === "done" && !hasError && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <p className="text-muted-foreground font-medium">
                  Taking you to your workspace...
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showSuccessNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[60] bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center space-x-3">
              <Trophy className="w-6 h-6 text-green-600" />
              <div className="text-center">
                <h3 className="text-lg font-bold text-green-800 dark:text-green-200">
                  Workspace Ready!
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  All stages completed successfully.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
