export interface DependencyNode {
  toolId: string;
  name: string;
  installed: boolean;
  dependencies: DependencyNode[];
  requiredBy: string[];
}

export interface DependencyTree {
  root: DependencyNode;
  totalTools: number;
  installedCount: number;
  missingCount: number;
}

export interface InstallQueueItem {
  toolId: string;
  name: string;
  isDependency: boolean;
  status: "pending" | "installing" | "completed" | "failed";
  error?: string;
}
