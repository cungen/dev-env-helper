import { useState, useEffect, useRef, useCallback } from "react";
import { detectCliTools } from "../api/cli-commands";
import type { CliToolDetection } from "../types/cli-tool";

export function useCliDetection() {
  const [tools, setTools] = useState<CliToolDetection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const refresh = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const detected = await detectCliTools();
      setTools(detected);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to detect CLI tools");
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Run initial detection in background without blocking
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      refresh(false).catch(() => {
        // Error already handled in refresh
      });
    }
  }, [refresh]);

  return {
    tools,
    isLoading,
    error,
    refresh,
  };
}
