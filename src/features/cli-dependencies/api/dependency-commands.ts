import { invoke } from "@tauri-apps/api/core";
import type { DependencyTree } from "../types/dependency";

export async function getDependencyTree(toolId: string): Promise<DependencyTree> {
  return await invoke("get_dependency_tree", { toolId });
}

export async function resolveInstallationOrder(toolIds: string[]): Promise<string[]> {
  return await invoke("resolve_installation_order", { toolIds });
}

export async function getReverseDependencies(toolId: string): Promise<[string, string][]> {
  return await invoke("get_reverse_dependencies", { toolId });
}
