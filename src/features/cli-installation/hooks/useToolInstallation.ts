import { useCallback, useState } from "react";
import { useBrewInstall } from "./useBrewInstall";
import { useDmgDownload } from "./useDmgDownload";
import type { InstallMethod } from "@/features/cli-management/types/cli-tool";

export interface ToolInstallationState {
  isInstalling: boolean;
  currentTool: string | null;
  progress: number;
  error: string | null;
  completedTools: string[];
  totalTools?: number;
}

export function useToolInstallation(options?: {
  onAllComplete?: () => void;
}) {
  const [state, setState] = useState<ToolInstallationState>({
    isInstalling: false,
    currentTool: null,
    progress: 0,
    error: null,
    completedTools: [],
  });

  const brewInstall = useBrewInstall({
    onSuccess: () => {
      setState((prev) => {
        const newCompleted = [...prev.completedTools, prev.currentTool!];
        if (newCompleted.length >= (state.totalTools || 0)) {
          // All tools installed
          options?.onAllComplete?.();
          return {
            ...prev,
            isInstalling: false,
            completedTools: newCompleted,
            currentTool: null,
            progress: 100,
          };
        }
        return {
          ...prev,
          completedTools: newCompleted,
        };
      });
    },
    onError: (error) => {
      setState((prev) => ({
        ...prev,
        isInstalling: false,
        error,
      }));
    },
  });

  const dmgDownload = useDmgDownload({
    onSuccess: () => {
      setState((prev) => {
        const newCompleted = [...prev.completedTools, prev.currentTool!];
        if (newCompleted.length >= (state.totalTools || 0)) {
          // All tools installed
          options?.onAllComplete?.();
          return {
            ...prev,
            isInstalling: false,
            completedTools: newCompleted,
            currentTool: null,
            progress: 100,
          };
        }
        return {
          ...prev,
          completedTools: newCompleted,
        };
      });
    },
    onError: (error) => {
      setState((prev) => ({
        ...prev,
        isInstalling: false,
        error,
      }));
    },
  });

  const installTools = useCallback(
    async (tools: Array<{ id: string; installMethods: InstallMethod[] }>) => {
      setState({
        isInstalling: true,
        currentTool: tools[0]?.id || null,
        progress: 0,
        error: null,
        completedTools: [],
        totalTools: tools.length,
      });

      for (const tool of tools) {
        setState((prev) => ({
          ...prev,
          currentTool: tool.id,
        }));

        // Prefer brew over dmg if both are available
        const brewMethod = tool.installMethods.find((m) => m.type === "brew");
        const dmgMethod = tool.installMethods.find((m) => m.type === "dmg");

        if (brewMethod?.caskName) {
          await brewInstall.install(brewMethod.caskName);
        } else if (dmgMethod?.dmgUrl) {
          await dmgDownload.download(dmgMethod.dmgUrl);
        } else {
          setState((prev) => ({
            ...prev,
            isInstalling: false,
            error: `No installation method available for ${tool.id}`,
          }));
          return;
        }

        // Check if installation failed
        if (brewInstall.error || dmgDownload.error) {
          return;
        }
      }
    },
    [brewInstall, dmgDownload, options]
  );

  const reset = useCallback(() => {
    setState({
      isInstalling: false,
      currentTool: null,
      progress: 0,
      error: null,
      completedTools: [],
    });
    brewInstall.reset();
    dmgDownload.reset();
  }, [brewInstall, dmgDownload]);

  return {
    ...state,
    installTools,
    reset,
    brewState: brewInstall,
    dmgState: dmgDownload,
  };
}
