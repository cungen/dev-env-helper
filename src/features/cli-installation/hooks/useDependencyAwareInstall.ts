import { useState, useCallback } from "react";
import { resolveInstallationOrder } from "@/features/cli-management/api/cli-commands";

export function useDependencyAwareInstall(options?: {
  onSuccess?: () => void;
}) {
  const [pendingInstallation, setPendingInstallation] = useState<{
    targetTool: string;
    allTools: string[];
  } | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const prepareInstallation = useCallback(async (toolId: string) => {
    setIsResolving(true);
    try {
      const orderedTools = await resolveInstallationOrder([toolId]);
      const targetIndex = orderedTools.indexOf(toolId);
      const dependencies = targetIndex > 0 ? orderedTools.slice(0, targetIndex) : [];

      if (dependencies.length > 0) {
        // Show preview with dependencies
        setPendingInstallation({
          targetTool: toolId,
          allTools: orderedTools,
        });
        return { showPreview: true, orderedTools };
      } else {
        // No dependencies, proceed directly
        return { showPreview: false, orderedTools };
      }
    } catch (error) {
      console.error("Failed to resolve dependencies:", error);
      throw error;
    } finally {
      setIsResolving(false);
    }
  }, []);

  const confirmInstallation = useCallback(() => {
    if (!pendingInstallation) return null;
    const result = pendingInstallation.allTools;
    setPendingInstallation(null);
    return result;
  }, [pendingInstallation]);

  const cancelInstallation = useCallback(() => {
    setPendingInstallation(null);
  }, []);

  const markInstallationComplete = useCallback(() => {
    options?.onSuccess?.();
  }, [options]);

  return {
    pendingInstallation,
    isResolving,
    prepareInstallation,
    confirmInstallation,
    cancelInstallation,
    markInstallationComplete,
  };
}
