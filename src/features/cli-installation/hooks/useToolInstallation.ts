import { useCallback, useState } from "react";
import { useBrewInstall } from "./useBrewInstall";
import { useDmgDownload } from "./useDmgDownload";
import { useScriptInstall } from "./useScriptInstall";
import { installToolBrewFormula, installToolBrewTap } from "../api/installation-commands";
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

  const scriptInstall = useScriptInstall({
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

        // Find the appropriate install method
        const brewMethod = tool.installMethods.find((m) => m.type === "brew");
        const dmgMethod = tool.installMethods.find((m) => m.type === "dmg");
        const scriptMethod = tool.installMethods.find((m) => m.type === "script");

        try {
          if (scriptMethod?.scriptCommands) {
            await scriptInstall.install(scriptMethod.scriptCommands);
            if (scriptInstall.error) {
              return;
            }
            // Script install completion is handled in scriptInstall.onSuccess
            // Wait a bit for the state to update
            await new Promise(resolve => setTimeout(resolve, 100));
            continue;
          } else if (brewMethod?.brewTap && brewMethod?.caskName) {
            // Brew tap cask
            await new Promise<void>((resolve, reject) => {
              installToolBrewTap(
                brewMethod.brewTap!,
                brewMethod.caskName!,
                true,
                (event) => {
                  if (event.type === "success") {
                    resolve();
                  } else if (event.type === "error") {
                    reject(new Error(event.message || "Installation failed"));
                  }
                }
              ).catch(reject);
            });
          } else if (brewMethod?.brewTap && brewMethod?.formulaName) {
            // Brew tap formula
            await new Promise<void>((resolve, reject) => {
              installToolBrewTap(
                brewMethod.brewTap!,
                brewMethod.formulaName!,
                false,
                (event) => {
                  if (event.type === "success") {
                    resolve();
                  } else if (event.type === "error") {
                    reject(new Error(event.message || "Installation failed"));
                  }
                }
              ).catch(reject);
            });
          } else if (brewMethod?.caskName) {
            // Regular brew cask
            await brewInstall.install(brewMethod.caskName);
            if (brewInstall.error) {
              return;
            }
            // Brew install completion is handled in brewInstall.onSuccess
            // Wait a bit for the state to update
            await new Promise(resolve => setTimeout(resolve, 100));
            continue;
          } else if (brewMethod?.formulaName) {
            // Regular brew formula
            await new Promise<void>((resolve, reject) => {
              installToolBrewFormula(brewMethod.formulaName!, (event) => {
                if (event.type === "success") {
                  resolve();
                } else if (event.type === "error") {
                  reject(new Error(event.message || "Installation failed"));
                }
              }).catch(reject);
            });
          } else if (dmgMethod?.dmgUrl) {
            await dmgDownload.download(dmgMethod.dmgUrl);
            if (dmgDownload.error) {
              return;
            }
            // DMG download completion is handled in dmgDownload.onSuccess
            // Wait a bit for the state to update
            await new Promise(resolve => setTimeout(resolve, 100));
            continue;
          } else {
            setState((prev) => ({
              ...prev,
              isInstalling: false,
              error: `No installation method available for ${tool.id}`,
            }));
            return;
          }

          // Mark tool as completed
          setState((prev) => {
            const newCompleted = [...prev.completedTools, tool.id];
            if (newCompleted.length >= (prev.totalTools || 0)) {
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
        } catch (error) {
          setState((prev) => ({
            ...prev,
            isInstalling: false,
            error: error instanceof Error ? error.message : "Installation failed",
          }));
          return;
        }
      }
    },
    [brewInstall, dmgDownload, scriptInstall, options]
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
    scriptInstall.reset();
  }, [brewInstall, dmgDownload, scriptInstall]);

  // Get current log output from active installation method
  const currentLogOutput = useCallback(() => {
    if (state.currentTool && state.isInstalling) {
      if (brewInstall.isInstalling) return brewInstall.output;
      if (dmgDownload.isDownloading) return dmgDownload.output;
      if (scriptInstall.isInstalling) return scriptInstall.output;
    }
    return [];
  }, [state.currentTool, state.isInstalling, brewInstall, dmgDownload, scriptInstall]);

  return {
    ...state,
    installTools,
    reset,
    brewState: brewInstall,
    dmgState: dmgDownload,
    scriptState: scriptInstall,
    logOutput: currentLogOutput(),
  };
}
