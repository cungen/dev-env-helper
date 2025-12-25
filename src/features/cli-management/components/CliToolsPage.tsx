import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCliDetection } from "../hooks/useCliDetection";
import { RefreshCw, Terminal, AlertCircle } from "lucide-react";
import { ConfigFileViewer } from "./ConfigFileViewer";
import { InstallButton } from "@/features/cli-installation/components/InstallButton";
import { InstallMethodBadge } from "@/features/cli-installation/components/InstallMethodBadge";
import { StatusBadge } from "./StatusBadge";
import { CollapsibleConfigFiles } from "./CollapsibleConfigFiles";
import { useDependencyAwareInstall } from "@/features/cli-installation/hooks/useDependencyAwareInstall";
import { DependencyInstallPreview } from "@/features/cli-installation/components/DependencyInstallPreview";
import { toast } from "sonner";
import { useToolInstallation } from "@/features/cli-installation/hooks/useToolInstallation";

// Template data for dependencies and install methods
const TOOL_DATA: Record<string, { dependencies?: string[]; installMethods?: any[] }> = {
  node: { dependencies: [], installMethods: [{ type: "brew", caskName: "node" }] },
  python: { dependencies: [], installMethods: [{ type: "brew", caskName: "python" }] },
  uv: { dependencies: ["python"], installMethods: [{ type: "brew", caskName: "uv" }] },
  n: { dependencies: ["node"], installMethods: [{ type: "brew", caskName: "n" }] },
};

export function CliToolsPage() {
  const { tools, isLoading, error, refresh } = useCliDetection();
  const [selectedConfigPath, setSelectedConfigPath] = useState<string | null>(null);
  const dependencyAwareInstall = useDependencyAwareInstall({
    onSuccess: () => {
      refresh();
      toast.success("Installation completed successfully");
    },
  });
  const toolInstallation = useToolInstallation({
    onAllComplete: () => {
      refresh();
      toast.success("All tools installed successfully");
    },
  });

  const handleInstall = async (toolId: string) => {
    try {
      const result = await dependencyAwareInstall.prepareInstallation(toolId);
      if (!result.showPreview) {
        // No dependencies, install directly
        const toolData = TOOL_DATA[toolId];
        if (toolData?.installMethods) {
          await toolInstallation.installTools([
            { id: toolId, installMethods: toolData.installMethods },
          ]);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Installation failed");
    }
  };

  const handleConfirmInstall = () => {
    const orderedTools = dependencyAwareInstall.confirmInstallation();
    if (orderedTools) {
      const toolsToInstall = orderedTools.map((id) => ({
        id,
        installMethods: TOOL_DATA[id]?.installMethods || [],
      }));
      toolInstallation.installTools(toolsToInstall);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="mb-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold">CLI Tools</h1>
          <p className="text-muted-foreground">Manage your development CLI tools</p>
        </div>
        <Button onClick={refresh} disabled={isLoading} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="mb-4 border-destructive p-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        </Card>
      )}

      {dependencyAwareInstall.pendingInstallation && (
        <DependencyInstallPreview
          targetTool={dependencyAwareInstall.pendingInstallation.targetTool}
          dependencies={dependencyAwareInstall.pendingInstallation.allTools.slice(
            0,
            dependencyAwareInstall.pendingInstallation.allTools.indexOf(
              dependencyAwareInstall.pendingInstallation.targetTool
            )
          )}
          onConfirm={handleConfirmInstall}
          onCancel={dependencyAwareInstall.cancelInstallation}
        />
      )}

      {selectedConfigPath && (
        <div className="mb-4 flex-shrink-0">
          <ConfigFileViewer path={selectedConfigPath} onClose={() => setSelectedConfigPath(null)} />
        </div>
      )}

      {isLoading && tools.length === 0 ? (
        <Card className="p-3">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Detecting CLI tools...</span>
          </div>
        </Card>
      ) : (
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-2 pr-4">
            {tools.map((tool) => (
              <CliToolCard
                key={tool.templateId}
                tool={tool}
                onViewConfig={setSelectedConfigPath}
                onInstall={handleInstall}
                isInstalling={toolInstallation.isInstalling}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

interface CliToolCardProps {
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

function CliToolCard({ tool, onViewConfig, onInstall, isInstalling }: CliToolCardProps) {
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
