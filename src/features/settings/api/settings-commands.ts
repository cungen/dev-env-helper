import { invoke } from "@tauri-apps/api/core";
import type { AppSettings } from "../types/settings";

export async function getSettings(): Promise<AppSettings> {
  return await invoke<AppSettings>("get_settings");
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  return await invoke<void>("save_settings", { settings });
}

export async function resetSettings(): Promise<AppSettings> {
  return await invoke<AppSettings>("reset_settings");
}


