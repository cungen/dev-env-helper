import { useState, useCallback } from "react";
import {
  downloadGitHubReleaseAsset,
  type GitHubDownloadEvent,
} from "../api/software-commands";

export interface GitHubDownloadState {
  isDownloading: boolean;
  progress: number;
  downloaded: number;
  total: number;
  error: string | null;
  success: boolean;
  filePath: string | null;
}

export function useGitHubDownload(options?: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) {
  const [state, setState] = useState<GitHubDownloadState>({
    isDownloading: false,
    progress: 0,
    downloaded: 0,
    total: 0,
    error: null,
    success: false,
    filePath: null,
  });

  const download = useCallback(
    async (url: string) => {
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
        const filePath = await downloadGitHubReleaseAsset(
          url,
          (event: GitHubDownloadEvent) => {
            setState((prev) => ({
              ...prev,
              downloaded: event.downloaded,
              total: event.total,
              progress: event.percentage,
            }));
          }
        );

        setState({
          isDownloading: false,
          progress: 100,
          downloaded: state.total,
          total: state.total,
          error: null,
          success: true,
          filePath,
        });

        setTimeout(() => {
          options?.onSuccess?.();
        }, 0);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Download failed";
        setState({
          isDownloading: false,
          progress: 0,
          downloaded: 0,
          total: 0,
          error: errorMessage,
          success: false,
          filePath: null,
        });

        setTimeout(() => {
          options?.onError?.(errorMessage);
        }, 0);
      }
    },
    [options]
  );

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


