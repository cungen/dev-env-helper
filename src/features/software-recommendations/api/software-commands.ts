import { invoke } from "@tauri-apps/api/core";
import type {
  SoftwareRecommendationsConfig,
  GitHubReleaseInfo,
} from "../types/software-recommendation";

export async function getSoftwareRecommendations(): Promise<SoftwareRecommendationsConfig> {
  return await invoke("get_software_recommendations");
}

export async function getGitHubLatestRelease(
  owner: string,
  repo: string,
  assetPattern?: string
): Promise<GitHubReleaseInfo> {
  return await invoke("get_github_latest_release", {
    owner,
    repo,
    assetPattern: assetPattern || null,
  });
}

export interface GitHubDownloadEvent {
  type: "progress";
  downloaded: number;
  total: number;
  percentage: number;
}

export async function downloadGitHubReleaseAsset(
  url: string,
  onProgress: (event: GitHubDownloadEvent) => void
): Promise<string> {
  const { listen } = await import("@tauri-apps/api/event");

  const unlisten = await listen<GitHubDownloadEvent>(
    "github-download-progress",
    (event) => {
      onProgress(event.payload);
    }
  );

  try {
    const filePath = await invoke<string>("download_github_release_asset", {
      url,
    });
    return filePath;
  } finally {
    unlisten();
  }
}

