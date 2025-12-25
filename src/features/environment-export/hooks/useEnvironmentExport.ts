import { useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { EnvironmentExport } from "@/shared/types/environment-export";

export function useEnvironmentExport() {
  const exportEnvironment = useCallback(async (data: EnvironmentExport) => {
    try {
      // Call the backend export command
      const result = await invoke<string>("export_environment", { data });

      // Create a blob and trigger download
      const blob = new Blob([result], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dev-env-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to export environment",
      };
    }
  }, []);

  return {
    exportEnvironment,
  };
}
