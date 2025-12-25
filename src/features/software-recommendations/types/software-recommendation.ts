export interface SoftwareCategory {
  id: string;
  name: string;
  emoji: string;
}

export interface SoftwareInstallMethod {
  type: "brew" | "github";
  cask?: string;
  owner?: string;
  repo?: string;
  assetPattern?: string;
}

export interface SoftwareRecommendation {
  id: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  installMethods: SoftwareInstallMethod[];
}

export interface SoftwareRecommendationsConfig {
  categories: SoftwareCategory[];
  software: SoftwareRecommendation[];
}

export interface GitHubReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

export interface GitHubReleaseInfo {
  tag_name: string;
  name: string | null;
  assets: GitHubReleaseAsset[];
  published_at: string;
}

