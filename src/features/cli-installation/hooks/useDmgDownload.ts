import { useState, useCallback } from "react";
import { downloadAndOpenDmg, type DmgDownloadEvent } from "../api/installation-commands";

export interface DmgDownloadState {
  isDownloading: boolean;
  progress: number;
  downloaded: number;
  total: number;
  error: string | null;
  success: boolean;
  filePath: string | null;
}

export function useDmgDownload(options?: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) {
  const [state, setState] = useState<DmgDownloadState>({
    isDownloading: false,
    progress: 0,
    downloaded: 0,
    total: 0,
    error: null,
    success: false,
    filePath: null,
  });

  const download = useCallback(async (url: string) => {
    setState({
      isDownloading: true,
      progress: 0,
      downloaded: 0,
      total: 0,
      error: null,
      success: false,
      filePath: null,
    });

    try {
      const filePath = await downloadAndOpenDmg(url, (event: DmgDownloadEvent) => {
        setState((prev) => ({
          ...prev,
          downloaded: event.downloaded,
          total: event.total,
          progress: event.percentage,
        }));
      });

      setState({
        isDownloading: false,
        progress: 100,
        downloaded: state.total,
        total: state.total,
        error: null,
        success: true,
        filePath,
      });

      // Trigger success callback after state update
      setTimeout(() => {
        options?.onSuccess?.();
      }, 0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Download failed";
      setState({
        isDownloading: false,
        progress: 0,
        downloaded: 0,
        total: 0,
        error: errorMessage,
        success: false,
        filePath: null,
      });

      // Trigger error callback after state update
      setTimeout(() => {
        options?.onError?.(errorMessage);
      }, 0);
    }
  }, [options]);

  const reset = useCallback(() => {
    setState({
      isDownloading: false,
      progress: 0,
      downloaded: 0,
      total: 0,
      error: null,
      success: false,
      filePath: null,
    });
  }, []);

  return {
    ...state,
    download,
    reset,
  };
}
