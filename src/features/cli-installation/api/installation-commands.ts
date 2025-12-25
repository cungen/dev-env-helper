import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export interface BrewInstallEvent {
  type: "status" | "output" | "success" | "error";
  message?: string;
  line?: string;
}

export interface DmgDownloadEvent {
  type: "progress";
  downloaded: number;
  total: number;
  percentage: number;
}

export async function checkBrewAvailable(): Promise<void> {
  return await invoke("check_brew_available");
}

export async function installToolBrew(
  caskName: string,
  onProgress: (event: BrewInstallEvent) => void
): Promise<void> {
  const unlisten = await listen<BrewInstallEvent>("brew-install-progress", (event) => {
    onProgress(event.payload);
  });

  try {
    await invoke("install_tool_brew", { caskName });
  } finally {
    unlisten();
  }
}

export async function getInstalledCasks(): Promise<string[]> {
  return await invoke("get_installed_casks");
}

export async function downloadAndOpenDmg(
  url: string,
  onProgress: (event: DmgDownloadEvent) => void
): Promise<string> {
  const unlisten = await listen<DmgDownloadEvent>("dmg-download-progress", (event) => {
    onProgress(event.payload);
  });

  try {
    return await invoke("download_and_open_dmg", { url });
  } finally {
    unlisten();
  }
}
