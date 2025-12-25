import { useState, useEffect } from "react";
import { getDependencyTree } from "../api/dependency-commands";
import type { DependencyTree } from "../types/dependency";

export function useDependencyTree(toolId: string) {
  const [data, setData] = useState<DependencyTree | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!toolId) return;

    setIsLoading(true);
    setError(null);

    getDependencyTree(toolId)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load dependency tree"))
      .finally(() => setIsLoading(false));
  }, [toolId]);

  return {
    data,
    isLoading,
    error,
  };
}
