import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCliDetection } from "../hooks/useCliDetection";
import { useCliTemplates } from "../hooks/useCliTemplates";
import { RefreshCw, AlertCircle } from "lucide-react";
import { CliToolCard } from "./CliToolCard";
import { CliToolDetailDialog } from "./CliToolDetailDialog";
import { useDependencyAwareInstall } from "@/features/cli-installation/hooks/useDependencyAwareInstall";
import { DependencyInstallPreview } from "@/features/cli-installation/components/DependencyInstallPreview";
import { InstallationProgressDialog } from "@/features/cli-installation/components/InstallationProgressDialog";
import { toast } from "sonner";
import { useToolInstallation } from "@/features/cli-installation/hooks/useToolInstallation";
import { CategoryFilter, type Category } from "@/components/CategoryFilter";
import type { CliToolDetection } from "../types/cli-tool";

export function CliToolsPage() {
  const { tools, isLoading, error, refresh } = useCliDetection();
  const { templates, getTemplate, categories } = useCliTemplates();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTool, setSelectedTool] = useState<CliToolDetection | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);

  const dependencyAwareInstall = useDependencyAwareInstall({
    onSuccess: () => {
      refresh();
      toast.success("Installation completed successfully");
    },
  });
  const toolInstallation = useToolInstallation({
    onAllComplete: () => {
      // Refresh detection after installation completes
      setTimeout(() => {
        refresh();
      }, 500); // Small delay to ensure installation is fully complete
      toast.success("All tools installed successfully");
    },
  });

  // Filter tools by category
  const filteredTools = useMemo(() => {
    if (selectedCategory === "all") return tools;
    return tools.filter((tool) => {
      const template = getTemplate(tool.templateId);
      return template?.category === selectedCategory;
    });
  }, [tools, selectedCategory, getTemplate]);

  // Get categories for filter (add "Other" if there are uncategorized tools)
  const filterCategories: Category[] = useMemo(() => {
    const hasUncategorized = tools.some((tool) => {
      const template = getTemplate(tool.templateId);
      return !template?.category;
    });
    const cats = categories.map((c) => ({
      id: c.id,
      name: c.name,
      emoji: c.emoji,
    }));
    if (hasUncategorized) {
      cats.push({ id: "other", name: "Other", emoji: "📦" });
    }
    return cats;
  }, [tools, categories, getTemplate]);

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
          setShowProgressDialog(true);
          await toolInstallation.installTools([
            { id: toolId, installMethods: template.installMethods },
          ]);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Installation failed");
      setShowProgressDialog(false);
    }
  };

  const handleConfirmInstall = () => {
    const orderedTools = dependencyAwareInstall.confirmInstallation();
    if (orderedTools) {
      setShowProgressDialog(true);
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

      {/* Category Filter */}
      {filterCategories.length > 0 && (
        <CategoryFilter
          categories={filterCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          className="mb-4 flex-shrink-0"
        />
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
        {filteredTools.length === 0 && !isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {selectedCategory === "all"
                ? "No CLI tools detected. Detection may still be in progress."
                : "No tools found in this category."}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pr-4">
            {filteredTools.map((tool) => (
              <CliToolCard
                key={tool.templateId}
                tool={tool}
                template={getTemplate(tool.templateId)}
                onClick={() => handleCardClick(tool)}
              />
            ))}
          </div>
        )}
      </ScrollArea>

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

      {/* Installation Progress Dialog */}
      <InstallationProgressDialog
        open={showProgressDialog && (toolInstallation.isInstalling || !!toolInstallation.error || toolInstallation.completedTools.length > 0)}
        onOpenChange={(open) => {
          if (!open) {
            setShowProgressDialog(false);
            const wasInstalling = toolInstallation.isInstalling;
            const hadCompleted = toolInstallation.completedTools.length > 0;
            const hadError = !!toolInstallation.error;

            if (!wasInstalling) {
              toolInstallation.reset();
              // Always refresh after closing dialog if installation completed (even with errors)
              if (hadCompleted) {
                // Small delay to ensure installation is fully complete
                setTimeout(() => {
                  refresh();
                }, 500);
              }
            }
          }
        }}
        currentTool={toolInstallation.currentTool}
        totalTools={toolInstallation.totalTools}
        completedTools={toolInstallation.completedTools}
        logOutput={toolInstallation.logOutput}
        error={toolInstallation.error}
        isInstalling={toolInstallation.isInstalling}
        onCancel={() => {
          setShowProgressDialog(false);
          toolInstallation.reset();
        }}
      />
    </div>
  );
}
