import { useState, useEffect } from "react";
import { detectCliTools } from "../api/cli-commands";
import type { CliToolDetection } from "../types/cli-tool";

export function useCliDetection() {
  const [tools, setTools] = useState<CliToolDetection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const detected = await detectCliTools();
      setTools(detected);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to detect CLI tools");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    tools,
    isLoading,
    error,
    refresh,
  };
}
