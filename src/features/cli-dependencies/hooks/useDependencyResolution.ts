import { useState, useCallback } from "react";
import { resolveInstallationOrder } from "../api/dependency-commands";

export function useDependencyResolution() {
  const [order, setOrder] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolve = useCallback(async (toolIds: string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await resolveInstallationOrder(toolIds);
      setOrder(result);
      return result;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to resolve dependencies";
      setError(message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    order,
    isLoading,
    error,
    resolve,
  };
}
