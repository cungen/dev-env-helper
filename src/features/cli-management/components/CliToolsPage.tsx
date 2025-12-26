import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCliDetection } from "../hooks/useCliDetection";
import { RefreshCw, AlertCircle } from "lucide-react";
import { ConfigFileViewer } from "./ConfigFileViewer";
import { CliToolCard } from "./CliToolCard";
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

      <ScrollArea className="flex-1 min-h-0">
        {isLoading && tools.length === 0 && (
          <Card className="p-3 mb-2">
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Detecting CLI tools...</span>
            </div>
          </Card>
        )}
        {tools.length === 0 && !isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No CLI tools detected. Detection may still be in progress.
            </p>
          </Card>
        ) : (
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
        )}
      </ScrollArea>
    </div>
  );
}

