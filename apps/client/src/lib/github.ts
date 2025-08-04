import { serverUrl } from "@/constants";
import axios from "axios";

const GITHUB_API_BASE_URL = "https://api.github.com";

export const fetchGitHubRepos = async (token: string) => {
  try {
    const res = await axios.get(`${GITHUB_API_BASE_URL}/user/repos`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    return res.data;
  } catch (error) {
    // You can handle different types of errors here
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(
          `Failed to fetch GitHub repositories: ${error.response.statusText}`
        );
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error("No response received from GitHub API.");
      }
    }
    // Something else happened while setting up the request
    throw new Error(
      "An unexpected error occurred while fetching GitHub repositories."
    );
  }
};

export const fetchGitHubBranches = async (
  token: string,
  owner: string,
  repo: string
) => {
  try {
    const res = await axios.get(
      `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/branches`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          `Failed to fetch branches: ${error.response.statusText}`
        );
      } else if (error.request) {
        throw new Error("No response received from GitHub API.");
      }
    }
    throw new Error("An unexpected error occurred while fetching branches.");
  }
};

export const extractGithubFiles = async (
  repoUrl: string,
  repoName: string,
  userId: string,
  branches: string[],
  token: string
) => {
  try {
    const response = await axios.post(`${serverUrl}/github-extract`, {
      repoUrl,
      repoName,
      userId,
      branches,
      token,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          `Failed to extract files: ${error.response.statusText}`
        );
      } else if (error.request) {
        throw new Error("No response received from HONO API.");
      }
    }
  }
};
