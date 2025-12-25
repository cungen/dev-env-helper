import { useState, useCallback, useEffect } from "react";
import { getSoftwareRecommendations } from "../api/software-commands";
import type { SoftwareRecommendationsConfig } from "../types/software-recommendation";

export function useSoftwareRecommendations() {
  const [config, setConfig] = useState<SoftwareRecommendationsConfig | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getSoftwareRecommendations();
      setConfig(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load software recommendations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    config,
    isLoading,
    error,
    reload: load,
  };
}

