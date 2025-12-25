import { invoke } from "@tauri-apps/api/core";
import type { CliToolDetection, CliToolTemplate } from "../types/cli-tool";
import type { DependencyTree } from "../../cli-dependencies/types/dependency";

export async function detectCliTools(): Promise<CliToolDetection[]> {
  return await invoke<CliToolDetection[]>("detect_cli_tools");
}

export async function getCliConfigContent(path: string): Promise<string> {
  return await invoke<string>("get_cli_config_content", { path });
}

export async function listCustomTemplates(): Promise<CliToolTemplate[]> {
  return await invoke<CliToolTemplate[]>("list_custom_templates");
}

export async function saveCustomTemplate(template: CliToolTemplate): Promise<void> {
  return await invoke("save_custom_template", { template });
}

export async function deleteCustomTemplate(id: string): Promise<void> {
  return await invoke("delete_custom_template", { id });
}

export async function resolveInstallationOrder(toolIds: string[]): Promise<string[]> {
  return await invoke<string[]>("resolve_installation_order", { toolIds });
}

export async function getDependencyTree(toolId: string): Promise<DependencyTree> {
  return await invoke<DependencyTree>("get_dependency_tree", { toolId });
}
