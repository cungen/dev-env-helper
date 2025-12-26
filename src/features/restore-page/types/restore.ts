import type { CliToolTemplate } from "@/features/cli-management/types/cli-tool";

export interface RestoreState {
  exportedAt: string;
  hostname?: string;
  tools: RestoreTool[];
  software: RestoreSoftware[];
  customTemplates: CliToolTemplate[];
}

export interface RestoreTool {
  templateId: string;
  installed: boolean;
  version?: string;
  executablePath?: string;
  configFiles: Array<{
    path: string;
    exists?: boolean;
    can_read?: boolean;
  }>;
  detectedAt: string;
  // Restore-specific fields
  template?: CliToolTemplate;
  installMethods?: Array<{
    type: "brew" | "dmg" | "script";
    caskName?: string;
    formulaName?: string;
    brewTap?: string;
    dmgUrl?: string;
    dmgInstallSteps?: string[];
    scriptCommands?: string[];
  }>;
}

export interface RestoreSoftware {
  id: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  installMethods: Array<{
    type: "brew" | "github";
    cask?: string;
    owner?: string;
    repo?: string;
    assetPattern?: string;
  }>;
  installed?: boolean;
}

export type RestoreItem = RestoreToolItem | RestoreSoftwareItem;

export interface RestoreToolItem {
  type: "tool";
  id: string;
  data: RestoreTool;
}

export interface RestoreSoftwareItem {
  type: "software";
  id: string;
  data: RestoreSoftware;
}

