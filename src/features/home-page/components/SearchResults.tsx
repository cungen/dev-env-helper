import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CliToolCard } from "@/features/cli-management/components/CliToolCard";
import { SoftwareCard } from "@/features/software-recommendations/components/SoftwareCard";
import { ConfigFileViewer } from "@/features/cli-management/components/ConfigFileViewer";
import { useDependencyAwareInstall } from "@/features/cli-installation/hooks/useDependencyAwareInstall";
import { useToolInstallation } from "@/features/cli-installation/hooks/useToolInstallation";
import { toast } from "sonner";
import type { SearchResult } from "../types/search";
import { DependencyInstallPreview } from "@/features/cli-installation/components/DependencyInstallPreview";

// Template data for dependencies and install methods
const TOOL_DATA: Record<string, { dependencies?: string[]; installMethods?: any[] }> = {
  node: { dependencies: [], installMethods: [{ type: "brew", caskName: "node" }] },
  python: { dependencies: [], installMethods: [{ type: "brew", caskName: "python" }] },
  uv: { dependencies: ["python"], installMethods: [{ type: "brew", caskName: "uv" }] },
  n: { dependencies: ["node"], installMethods: [{ type: "brew", caskName: "n" }] },
};

interface SearchResultsProps {
  results: SearchResult[];
}

export function SearchResults({ results }: SearchResultsProps) {
  const [selectedConfigPath, setSelectedConfigPath] = useState<string | null>(null);
  const dependencyAwareInstall = useDependencyAwareInstall({
    onSuccess: () => {
      toast.success("Installation completed successfully");
    },
  });
  const toolInstallation = useToolInstallation({
    onAllComplete: () => {
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

  if (results.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No results found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
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
        <div className="mb-4">
          <ConfigFileViewer path={selectedConfigPath} onClose={() => setSelectedConfigPath(null)} />
        </div>
      )}

      {results.map((result) => {
        if (result.type === "cli-tool") {
          return (
            <CliToolCard
              key={result.id}
              tool={result.data}
              onViewConfig={setSelectedConfigPath}
              onInstall={handleInstall}
              isInstalling={toolInstallation.isInstalling}
            />
          );
        } else if (result.type === "software") {
          return <SoftwareCard key={result.id} software={result.data} />;
        }
        return null;
      })}
    </div>
  );
}


