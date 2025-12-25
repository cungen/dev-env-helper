import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface InstallationState {
  isInstalling: boolean;
  currentTool: string | null;
  toolIds: string[];
}

interface InstallationContextValue {
  state: InstallationState;
  startInstallation: (toolIds: string[]) => boolean;
  completeInstallation: () => void;
  failInstallation: (error: string) => void;
  setCurrentTool: (toolId: string) => void;
  resetInstallation: () => void;
}

const InstallationContext = createContext<InstallationContextValue | undefined>(undefined);

export function InstallationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InstallationState>({
    isInstalling: false,
    currentTool: null,
    toolIds: [],
  });

  const startInstallation = useCallback((toolIds: string[]) => {
    setState((prev) => {
      if (prev.isInstalling) {
        // Prevent concurrent installations
        return prev;
      }
      return {
        isInstalling: true,
        currentTool: toolIds[0] || null,
        toolIds,
      };
    });
    return true;
  }, []);

  const completeInstallation = useCallback(() => {
    setState({
      isInstalling: false,
      currentTool: null,
      toolIds: [],
    });
  }, []);

  const failInstallation = useCallback((error: string) => {
    console.error("Installation failed:", error);
    setState({
      isInstalling: false,
      currentTool: null,
      toolIds: [],
    });
  }, []);

  const setCurrentTool = useCallback((toolId: string) => {
    setState((prev) => ({
      ...prev,
      currentTool: toolId,
    }));
  }, []);

  const resetInstallation = useCallback(() => {
    setState({
      isInstalling: false,
      currentTool: null,
      toolIds: [],
    });
  }, []);

  return (
    <InstallationContext.Provider
      value={{
        state,
        startInstallation,
        completeInstallation,
        failInstallation,
        setCurrentTool,
        resetInstallation,
      }}
    >
      {children}
    </InstallationContext.Provider>
  );
}

export function useInstallationState() {
  const context = useContext(InstallationContext);
  if (!context) {
    throw new Error("useInstallationState must be used within InstallationProvider");
  }
  return context;
}
