export interface InstallMethod {
  type: "brew" | "dmg" | "script";
  caskName?: string;
  formulaName?: string;
  brewTap?: string;
  dmgUrl?: string;
  dmgInstallSteps?: string[];
  scriptCommands?: string[];
}

export interface ConfigFileLocation {
  path: string;
  type?: "home" | "absolute";
  description?: string;
  exists?: boolean;
  can_read?: boolean;
  fullPath?: string;
}

export interface CliToolTemplate {
  id: string;
  name: string;
  executable: string;
  versionCommand: string;
  versionParser: "stdout" | "stderr" | "stdout-first-line";
  configFiles: ConfigFileLocation[];
  installMethods?: InstallMethod[];
  dependencies?: string[];
  category?: string;
  emoji?: string;
}

export interface CliToolDetection {
  templateId: string;
  installed: boolean;
  version?: string;
  executablePath?: string;
  configFiles: ConfigFileLocation[];
  detectedAt: string;
}
