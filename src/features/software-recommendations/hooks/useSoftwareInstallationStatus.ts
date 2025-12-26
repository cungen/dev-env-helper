import { useState, useCallback } from "react";
import { detectInstalledSoftware } from "../api/software-commands";
import type { SoftwareRecommendation } from "../types/software-recommendation";
import { toast } from "sonner";

export interface SoftwareInstallationStatus {
  [softwareId: string]: boolean;
}

export function useSoftwareInstallationStatus() {
  const [status, setStatus] = useState<SoftwareInstallationStatus>({});
  const [isDetecting, setIsDetecting] = useState(false);

  const detectStatus = useCallback(
    async (software: SoftwareRecommendation[], showLoading = true) => {
      if (showLoading) {
        setIsDetecting(true);
      }
      try {
        const results = await detectInstalledSoftware(software);
        const statusMap: SoftwareInstallationStatus = {};

        for (const [id, installed] of results) {
          statusMap[id] = installed;
        }

        setStatus(statusMap);
        return statusMap;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to detect installation status";
        toast.error(`Detection failed: ${errorMessage}`);
        throw error;
      } finally {
        if (showLoading) {
          setIsDetecting(false);
        }
      }
    },
    []
  );

  const refreshStatus = useCallback(
    async (software: SoftwareRecommendation[]) => {
      return detectStatus(software, true);
    },
    [detectStatus]
  );

  const updateSoftwareWithStatus = useCallback(
    (software: SoftwareRecommendation[]): SoftwareRecommendation[] => {
      return software.map((s) => ({
        ...s,
        installed: status[s.id] ?? false,
      }));
    },
    [status]
  );

  return {
    status,
    isDetecting,
    detectStatus,
    refreshStatus,
    updateSoftwareWithStatus,
  };
}

