import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CliToolCard } from "@/features/cli-management/components/CliToolCard";
import { CliToolDetailDialog } from "@/features/cli-management/components/CliToolDetailDialog";
import { SoftwareCard } from "@/features/software-recommendations/components/SoftwareCard";
import { useCliTemplates } from "@/features/cli-management/hooks/useCliTemplates";
import { useDependencyAwareInstall } from "@/features/cli-installation/hooks/useDependencyAwareInstall";
import { useToolInstallation } from "@/features/cli-installation/hooks/useToolInstallation";
import { toast } from "sonner";
import type { SearchResult } from "../types/search";
import type { CliToolDetection } from "@/features/cli-management/types/cli-tool";
import { DependencyInstallPreview } from "@/features/cli-installation/components/DependencyInstallPreview";

interface SearchResultsProps {
  results: SearchResult[];
}

export function SearchResults({ results }: SearchResultsProps) {
  const { getTemplate } = useCliTemplates();
  const [selectedTool, setSelectedTool] = useState<CliToolDetection | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const handleCardClick = (tool: CliToolDetection) => {
    setSelectedTool(tool);
    setDialogOpen(true);
  };

  const handleInstall = async (toolId: string) => {
    try {
      const result = await dependencyAwareInstall.prepareInstallation(toolId);
      if (!result.showPreview) {
        // No dependencies, install directly
        const template = getTemplate(toolId);
        if (template?.installMethods && template.installMethods.length > 0) {
          await toolInstallation.installTools([
            { id: toolId, installMethods: template.installMethods },
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
      const toolsToInstall = orderedTools.map((id) => {
        const template = getTemplate(id);
        return {
          id,
          installMethods: template?.installMethods || [],
        };
      });
      toolInstallation.installTools(toolsToInstall);
    }
  };

  // Separate CLI tools and software
  const cliTools = results.filter((r) => r.type === "cli-tool");
  const software = results.filter((r) => r.type === "software");

  if (results.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No results found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* CLI Tools Grid */}
      {cliTools.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">CLI Tools</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cliTools.map((result) => {
              const tool = result.data as CliToolDetection;
              return (
                <CliToolCard
                  key={result.id}
                  tool={tool}
                  template={getTemplate(tool.templateId)}
                  onClick={() => handleCardClick(tool)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Software Grid */}
      {software.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Software</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {software.map((result) => (
              <SoftwareCard key={result.id} software={result.data} />
            ))}
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      {selectedTool && (
        <CliToolDetailDialog
          tool={selectedTool}
          template={getTemplate(selectedTool.templateId)}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onInstall={handleInstall}
          isInstalling={toolInstallation.isInstalling}
        />
      )}
    </div>
  );
}


