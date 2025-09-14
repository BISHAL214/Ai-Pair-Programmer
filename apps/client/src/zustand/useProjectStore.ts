import { create } from "zustand";

export type STATUS = "pending" | "completed" | "failed";
export type JOB = "extraction" | "container" | "fileSync";
export type CONTAINER_STATUS = "running" | "stopped" | "created" | "paused";

export type INFO = {
  extraction?: {
    status: STATUS;
    jobId: string | null;
  };
  container?: {
    status: STATUS;
    jobId: string | null;
    containerId?: string | null;
    containerStatus?: CONTAINER_STATUS | null;
  };
  fileSync?: {
    status: STATUS;
    jobId: string | null;
  };
};

export interface ProjectState {
  userId: string | null;
  projectId: string | null;
  info: INFO;
  setProjectUserId: (userId: string, projectId: string) => void;
  setInfo: (job: JOB, info: INFO[JOB]) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  userId: null,
  projectId: null,
  info: {},
  setProjectUserId: (userId, projectId) => set(() => ({ userId, projectId })),
  setInfo: (job, jobInfo) =>
    set((state) => ({
      info: {
        ...state.info,
        [job]: jobInfo,
      },
    })),
}));
