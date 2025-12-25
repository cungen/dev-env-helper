import { useState, useCallback, useEffect } from "react";
import { getGitHubLatestRelease } from "../api/software-commands";
import type { GitHubReleaseInfo } from "../types/software-recommendation";

export function useGitHubRelease(
  owner: string | undefined,
  repo: string | undefined,
  assetPattern: string | undefined
) {
  const [release, setRelease] = useState<GitHubReleaseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRelease = useCallback(async () => {
    if (!owner || !repo) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getGitHubLatestRelease(owner, repo, assetPattern);
      setRelease(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch GitHub release");
    } finally {
      setIsLoading(false);
    }
  }, [owner, repo, assetPattern]);

  useEffect(() => {
    fetchRelease();
  }, [fetchRelease]);

  return {
    release,
    isLoading,
    error,
    refetch: fetchRelease,
  };
}

