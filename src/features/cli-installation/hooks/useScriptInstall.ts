import { useState, useCallback } from "react";
import { installToolScript, type ScriptInstallEvent } from "../api/installation-commands";

export interface ScriptInstallState {
  isInstalling: boolean;
  output: string[];
  error: string | null;
  success: boolean;
}

export function useScriptInstall(options?: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) {
  const [state, setState] = useState<ScriptInstallState>({
    isInstalling: false,
    output: [],
    error: null,
    success: false,
  });

  const install = useCallback(async (commands: string[]) => {
    setState({
      isInstalling: true,
      output: [],
      error: null,
      success: false,
    });

    try {
      await installToolScript(commands, (event: ScriptInstallEvent) => {
        setState((prev) => {
          switch (event.type) {
            case "status":
              return {
                ...prev,
                output: [...prev.output, event.message || ""],
              };
            case "output":
              return {
                ...prev,
                output: [...prev.output, event.line || ""],
              };
            case "success":
              // Trigger success callback after state update
              setTimeout(() => {
                options?.onSuccess?.();
              }, 0);
              return {
                ...prev,
                output: [...prev.output, event.message || ""],
                success: true,
                isInstalling: false,
              };
            case "error":
              // Trigger error callback after state update
              setTimeout(() => {
                options?.onError?.(event.message || "Installation failed");
              }, 0);
              return {
                ...prev,
                output: [...prev.output, event.message || ""],
                error: event.message || "Installation failed",
                isInstalling: false,
              };
            default:
              return prev;
          }
        });
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to start installation";
      setState({
        isInstalling: false,
        output: [],
        error: errorMessage,
        success: false,
      });
      options?.onError?.(errorMessage);
    }
  }, [options]);

  const reset = useCallback(() => {
    setState({
      isInstalling: false,
      output: [],
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    install,
    reset,
  };
}


