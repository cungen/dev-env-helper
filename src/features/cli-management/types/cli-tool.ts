export interface InstallMethod {
  type: "brew" | "dmg" | "script";
  caskName?: string;
  dmgUrl?: string;
  dmgInstallSteps?: string[];
}

export interface ConfigFileLocation {
  path: string;
  type?: "home" | "absolute";
  description?: string;
  exists?: boolean;
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
}

export interface CliToolDetection {
  templateId: string;
  installed: boolean;
  version?: string;
  executablePath?: string;
  configFiles: ConfigFileLocation[];
  detectedAt: string;
}
