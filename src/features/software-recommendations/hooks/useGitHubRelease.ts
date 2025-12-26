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

    console.log("[GitHub Release] Fetching:", { owner, repo, assetPattern });

    try {
      const data = await getGitHubLatestRelease(owner, repo, assetPattern);
      console.log("[GitHub Release] Success:", data);
      setRelease(data);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Failed to fetch GitHub release";
      console.error("[GitHub Release] Error:", errorMsg, e);
      setError(errorMsg);
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


