import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal } from "lucide-react";
import { InstallButton } from "@/features/cli-installation/components/InstallButton";
import { InstallMethodBadge } from "@/features/cli-installation/components/InstallMethodBadge";
import { StatusBadge } from "./StatusBadge";
import { CollapsibleConfigFiles } from "./CollapsibleConfigFiles";

// Template data for dependencies and install methods
const TOOL_DATA: Record<string, { dependencies?: string[]; installMethods?: any[] }> = {
  node: { dependencies: [], installMethods: [{ type: "brew", caskName: "node" }] },
  python: { dependencies: [], installMethods: [{ type: "brew", caskName: "python" }] },
  uv: { dependencies: ["python"], installMethods: [{ type: "brew", caskName: "uv" }] },
  n: { dependencies: ["node"], installMethods: [{ type: "brew", caskName: "n" }] },
};

export interface CliToolCardProps {
  tool: {
    templateId: string;
    installed: boolean;
    version?: string;
    executablePath?: string;
    configFiles: any[];
    detectedAt: string;
  };
  onViewConfig: (path: string) => void;
  onInstall: (toolId: string) => void;
  isInstalling: boolean;
}

export function CliToolCard({ tool, onViewConfig, onInstall, isInstalling }: CliToolCardProps) {
  const getToolName = (id: string) => {
    const names: Record<string, string> = {
      node: "Node.js",
      python: "Python",
      uv: "uv",
      n: "n",
    };
    return names[id] || id;
  };

  const toolData = TOOL_DATA[tool.templateId] || { dependencies: [], installMethods: [] };
  const dependencies = toolData.dependencies || [];
  const installMethods = toolData.installMethods || [];

  return (
    <Card className="p-3 gap-0">
      {/* Main horizontal row - responsive layout */}
      <div className="flex flex-wrap items-center gap-2 lg:gap-3">
        {/* Left: Tool identity */}
        <div className="flex items-center gap-2 min-w-0">
          <Terminal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="font-semibold truncate text-sm sm:text-base">{getToolName(tool.templateId)}</span>
          {tool.installed && tool.version && (
            <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
              v{tool.version}
            </span>
          )}
          <Badge variant="outline" className="text-xs flex-shrink-0 hidden sm:inline-flex">
            {tool.templateId}
          </Badge>
        </div>

        {/* Spacer - only on large screens */}
        <div className="hidden lg:flex flex-1" />

        {/* Center: Dependencies */}
        {dependencies.length > 0 && (
          <>
            <div className="flex items-center gap-1 flex-wrap">
              {dependencies.map((dep) => (
                <Badge key={dep} variant="secondary" className="text-xs">
                  {dep}
                </Badge>
              ))}
            </div>
            <div className="hidden lg:flex flex-1" />
          </>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          {!tool.installed && installMethods.length > 0 && (
            <InstallMethodBadge method={installMethods[0]} />
          )}
          <StatusBadge installed={tool.installed} />
          {!tool.installed && installMethods.length > 0 && (
            <InstallButton
              installMethods={installMethods}
              onInstall={() => onInstall(tool.templateId)}
              isInstalling={isInstalling}
            />
          )}
        </div>
      </div>

      {/* Collapsible config files */}
      {tool.configFiles.length > 0 && (
        <CollapsibleConfigFiles
          configFiles={tool.configFiles}
          onViewFile={onViewConfig}
        />
      )}
    </Card>
  );
}


