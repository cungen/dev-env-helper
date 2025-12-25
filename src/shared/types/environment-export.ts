import type { CliToolDetection } from "../../features/cli-management/types/cli-tool";
import type { CliToolTemplate } from "../../features/cli-management/types/cli-tool";

export interface EnvironmentExport {
  schemaVersion: string;
  exportedAt: string;
  hostname?: string;
  tools: CliToolDetection[];
  customTemplates: CliToolTemplate[];
}
